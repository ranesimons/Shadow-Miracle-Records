import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { sql } from '../../lib/db';

export const config = { maxDuration: 60 };

const BATCH_PER_DAY = 60;

type PendingSong = { song: string; artist: string; peak_position: number; weeks_on_chart: number };
type SongResult = {
  position: number; song: string; artist: string; peakPosition: number; weeksOnChart: number;
  status: 'added' | 'not_found' | 'error'; videoId?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refreshToken, id } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });
  if (!id) return res.status(400).json({ error: 'playlist db id is required' });

  const rows = (await sql`
    SELECT * FROM public.yt_playlists WHERE id = ${Number(id)}
  `) as { id: number; playlist_id: string; songs: SongResult[]; pending_songs: PendingSong[]; status: string; chart_name: string; week_date: string }[];

  if (!rows.length) return res.status(404).json({ error: 'Playlist not found' });
  const record = rows[0];
  if (record.status === 'complete') return res.status(400).json({ error: 'Playlist is already complete' });

  const pending = record.pending_songs ?? [];
  if (pending.length === 0) {
    await sql`UPDATE public.yt_playlists SET status = 'complete' WHERE id = ${record.id}`;
    return res.status(200).json({ status: 'complete', remainingSongs: 0 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  try { await oauth2Client.getAccessToken(); }
  catch { return res.status(401).json({ error: 'YouTube session expired. Please re-authenticate.' }); }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const playlistId = record.playlist_id;
  const existingResults: SongResult[] = record.songs ?? [];
  const offset = existingResults.length;

  const batch = pending.slice(0, BATCH_PER_DAY);
  const stillPending = pending.slice(BATCH_PER_DAY);
  const newResults: SongResult[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE);
    const searched = await Promise.all(chunk.map(async (row, idx) => {
      try {
        const searchRes = await youtube.search.list({
          part: ['id'], q: `${row.song} ${row.artist}`,
          type: ['video'], videoCategoryId: '10', maxResults: 1,
        });
        return { position: offset + i + idx + 1, song: row.song, artist: row.artist, peakPosition: row.peak_position, weeksOnChart: row.weeks_on_chart, videoId: searchRes.data.items?.[0]?.id?.videoId ?? undefined };
      } catch {
        return { position: offset + i + idx + 1, song: row.song, artist: row.artist, peakPosition: row.peak_position, weeksOnChart: row.weeks_on_chart, videoId: undefined };
      }
    }));

    for (const item of searched) {
      if (item.videoId) {
        try {
          await youtube.playlistItems.insert({
            part: ['snippet'],
            requestBody: { snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId: item.videoId } } },
          });
          newResults.push({ ...item, status: 'added' });
        } catch { newResults.push({ ...item, status: 'error' }); }
      } else {
        newResults.push({ ...item, status: 'not_found' });
      }
    }
    if (i + BATCH_SIZE < batch.length) await new Promise(r => setTimeout(r, 200));
  }

  const allResults = [...existingResults, ...newResults];
  const isComplete = stillPending.length === 0;
  const songsJson = JSON.stringify(allResults);
  const pendingJson = JSON.stringify(stillPending);

  await sql`
    UPDATE public.yt_playlists
    SET songs = ${songsJson}::jsonb,
        pending_songs = ${pendingJson}::jsonb,
        status = ${isComplete ? 'complete' : 'partial'}
    WHERE id = ${record.id}
  `;

  return res.status(200).json({
    status: isComplete ? 'complete' : 'partial',
    addedThisRun: newResults.filter(r => r.status === 'added').length,
    processedTotal: allResults.length,
    remainingSongs: stillPending.length,
  });
}
