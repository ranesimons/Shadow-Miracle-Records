// pages/api/upload-tiktok.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface TikTokInitResponseData {
  publish_id: string;
  upload_url?: string;
}

interface TikTokInitResponse {
  data: TikTokInitResponseData;
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

type Data = { success: boolean; publishId?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { blobName, title = 'testing', description = 'testing' } = req.body;
    if (!blobName || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields blobName or title' });
    }

    // 1) Initialize video upload with TikTok
    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title,
            description,
            // You could add more fields like privacy_level, disable_comment, etc
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: blobName
          }
        }),
      }
    );

    if (!initResponse.ok) {
      const text = await initResponse.text();
      throw new Error(`Init upload failed: ${initResponse.status} ${text}`);
    }

    const initRaw = await initResponse.json();
    const initResult = initRaw as TikTokInitResponse;

    if (!initResult.data || typeof initResult.data.publish_id !== 'string') {
      throw new Error(`TikTok init upload returned unexpected shape: ${JSON.stringify(initRaw)}`);
    }

    const publishId = initResult.data.publish_id;

    return res.status(200).json({ success: true, publishId });

  } catch (err: unknown) {
    console.error('Upload to TikTok Error:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
