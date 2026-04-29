import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobUrl, youtubeVideoId, tiktokVideoId, facebookVideoId, instagramVideoId } = req.body;

  if (!blobUrl) {
    return res.status(400).json({ error: 'Missing blobUrl' });
  }

  try {
    await sql`
      UPDATE public.reels SET
        youtube_video_id  = COALESCE(${youtubeVideoId  ?? null}, youtube_video_id),
        tiktok_video_id   = COALESCE(${tiktokVideoId   ?? null}, tiktok_video_id),
        facebook_video_id = COALESCE(${facebookVideoId ?? null}, facebook_video_id),
        instagram_video_id = COALESCE(${instagramVideoId ?? null}, instagram_video_id)
      WHERE blob_url = ${blobUrl}
    `;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('update-platform-ids error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
