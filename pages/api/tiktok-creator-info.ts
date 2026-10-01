import type { NextApiRequest, NextApiResponse } from 'next';

export type CreatorInfo = {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No TikTok access token provided' });
  }

  const ttRes = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
  const body = await ttRes.json();

  if (!ttRes.ok || body.error?.code !== 'ok') {
    return res.status(ttRes.ok ? 403 : ttRes.status).json({
      error: body.error?.message || 'This TikTok account cannot post right now. Please try again later.',
      code: body.error?.code,
    });
  }

  return res.status(200).json(body.data as CreatorInfo);
}
