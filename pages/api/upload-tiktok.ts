// pages/api/upload-tiktok.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import JSONBig from 'json-bigint';

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
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : process.env.TIKTOK_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }
    const {
      blobName,
      title,
      description = '',
      privacyLevel = 'PUBLIC_TO_EVERYONE',
      brandContentToggle = false,
      brandOrganicToggle = false,
    } = req.body;

    if (!blobName || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields blobName or title' });
    }

    const validPrivacyLevels = ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];
    if (!validPrivacyLevels.includes(privacyLevel)) {
      return res.status(400).json({ success: false, error: `Invalid privacy_level. Must be one of: ${validPrivacyLevels.join(', ')}` });
    }

    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: {
            title,
            description,
            privacy_level: privacyLevel,
            brand_content_toggle: brandContentToggle,
            brand_organic_toggle: brandOrganicToggle,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: blobName,
          },
        }),
      }
    );

    const rawText = await initResponse.text(); // Get the raw text first

    if (!initResponse.ok) {
      throw new Error(`Init upload failed: ${initResponse.status} ${rawText}`);
    }

    // Parse using JSONBig to keep the long ID as a string
    const data = JSONBig({ storeAsString: true }).parse(rawText);

    const publishId = data.data.publish_id;

    return res.status(200).json({ success: true, publishId });

  } catch (err: unknown) {
    console.error('Upload to TikTok Error:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}

