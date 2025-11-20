// pages/api/all.js
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const reels = await sql`
      SELECT * FROM public.reels
      WHERE youtube_video_id is not null;
    `;
    console.log('$$$')
    console.log(reels)
    console.log('$$$')
    const total = [];
    for (const r of reels) {
      const facebookVideoViews = r.facebook_video_views ?? 0;
      const instagramVideoViews = r.instagram_video_views ?? 0;
      const tiktokVideoViews = r.tiktok_video_views ?? 0;
      const youtubeVideoViews = r.youtube_video_views ?? 0;
      const realVideoId = r.real_video_id ?? '';
      const youtubeVideoDate = r.youtube_video_date ?? '';
      const totalVideoViews = facebookVideoViews + instagramVideoViews + tiktokVideoViews + youtubeVideoViews
      const hmm = {
        title: r.title,
        facebookVideoViews: facebookVideoViews,
        instagramVideoViews: instagramVideoViews,
        tiktokVideoViews: tiktokVideoViews,
        youtubeVideoViews: youtubeVideoViews,
        realVideoId: realVideoId,
        youtubeVideoDate: youtubeVideoDate,
        totalVideoViews: totalVideoViews
      }
      total.push(hmm);
    }
    res.status(200).json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
