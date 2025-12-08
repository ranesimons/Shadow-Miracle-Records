// pages/api/upload-twitter.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { TwitterApi } from 'twitter-api-v2';

interface ApiResponse {
  success: boolean;
  tweetId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { blobUrl, status = '' } = req.body as { blobUrl?: string; status?: string };
    if (!blobUrl) {
      return res.status(400).json({ success: false, error: 'Missing blobUrl' });
    }

    // Initialize Twitter client with OAuth-1.0a credentials (as required for media upload)
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    // 1. Fetch the video blob from your URL
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch video from blobUrl: HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload media to Twitter — no extra params needed for mediaType
    const mediaId = await twitterClient.v1.uploadMedia(buffer);

    // 3. Post a tweet referencing the uploaded media
    const tweet = await twitterClient.v1.tweet(status, { media_ids: [mediaId] });

    return res.status(200).json({ success: true, tweetId: tweet.id_str });
  } catch (err: unknown) {
    console.error('Upload to Twitter Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
