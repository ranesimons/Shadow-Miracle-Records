import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export type StoredPlaylist = {
  id: number;
  chart_name: string;
  week_date: string;
  playlist_id: string;
  playlist_url: string;
  songs: { position: number; song: string; artist: string; status: string; videoId?: string; peakPosition?: number; weeksOnChart?: number }[];
  status: 'complete' | 'partial';
  pending_count: number;
  created_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoredPlaylist[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.yt_playlists (
        id            SERIAL PRIMARY KEY,
        chart_name    TEXT        NOT NULL,
        week_date     TEXT        NOT NULL,
        playlist_id   TEXT        NOT NULL,
        playlist_url  TEXT        NOT NULL,
        songs         JSONB,
        status        TEXT        NOT NULL DEFAULT 'complete',
        pending_songs JSONB       NOT NULL DEFAULT '[]',
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    // Migrate existing tables that may lack the new columns
    await sql`ALTER TABLE public.yt_playlists ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'complete'`;
    await sql`ALTER TABLE public.yt_playlists ADD COLUMN IF NOT EXISTS pending_songs JSONB NOT NULL DEFAULT '[]'`;

    const chart = (req.query.chart as string) ?? 'Hot-100';
    // view=year → week_date is a 4-digit year; view=week (default) → week_date is a date string
    const view = (req.query.view as string) ?? 'week';

    const rows = view === 'year'
      ? await sql`
          SELECT id, chart_name, week_date, playlist_id, playlist_url, songs, status,
                 jsonb_array_length(COALESCE(pending_songs, '[]'::jsonb)) AS pending_count,
                 created_at
          FROM public.yt_playlists
          WHERE chart_name = ${chart}
            AND week_date ~ '^[0-9]{4}$'
          ORDER BY week_date DESC, created_at DESC
        `
      : await sql`
          SELECT id, chart_name, week_date, playlist_id, playlist_url, songs, status,
                 jsonb_array_length(COALESCE(pending_songs, '[]'::jsonb)) AS pending_count,
                 created_at
          FROM public.yt_playlists
          WHERE chart_name = ${chart}
            AND week_date !~ '^[0-9]{4}$'
          ORDER BY created_at DESC
          LIMIT 50
        `;

    res.status(200).json(rows as StoredPlaylist[]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load playlists' });
  }
}
