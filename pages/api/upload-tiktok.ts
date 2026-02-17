// pages/api/upload-tiktok.ts\

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import JSONBig from 'json-bigint';
import { file } from 'googleapis/build/src/apis/file';

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
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : process.env.TIKTOK_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'No access token provided' });
    }
    const { blobName, title = 'testing', description = 'testing' } = req.body;
    if (!blobName || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields blobName or title' });
    }

    // Inside your upload handler
    // const { blobName } = req.body; 
    // Example: blobName is "my-container/video.mp4"

    // CONSTRUCT THE PROXIED URL
    // Instead of https://smr.blob.core...
    // We use your main domain that TikTok already trusts!
    // const proxiedVideoUrl = `https://shadowmiraclerecords.com/tiktok-assets/${blobName}`;

    // const fileName = proxiedVideoUrl.split('/').pop();
    // console.log(fileName); 
    // Output: "year2026_month2_day14_20251224_221701.mp4"
  
    // const newProxiedVideoUrl = `https://shadowmiraclerecords.com/tiktok-assets/${fileName}`;

    console.log('&&&')
    console.log(blobName)
    console.log('&&&')

    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          post_info: { title, description, "privacy_level": "SELF_ONLY", },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: blobName // <--- Use the new proxy URL here
          }
        }),
      }
    );

    const rawText = await initResponse.text(); // Get the raw text first
    // Parse using JSONBig to keep the long ID as a string
    const data = JSONBig({ storeAsString: true }).parse(rawText);

    const publishId = data.data.publish_id; 

    console.log("Correct Publish ID:", publishId);

    // 1) Initialize video upload with TikTok
    // const initResponse = await fetch(
    //   'https://open.tiktokapis.com/v2/post/publish/video/init/',
    //   {
    //     method: 'POST',
    //     headers: {
    //       // 'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
    //       'Authorization': `Bearer ${accessToken}`,
    //       'Content-Type': 'application/json; charset=UTF-8',
    //     },
    //     body: JSON.stringify({
    //       post_info: {
    //         title,
    //         description,
    //         // You could add more fields like privacy_level, disable_comment, etc
    //       },
    //       source_info: {
    //         source: 'PULL_FROM_URL',
    //         video_url: blobName
    //       }
    //     }),
    //   }
    // );

    if (!initResponse.ok) {
      const text = await initResponse.text();
      throw new Error(`Init upload failed: ${initResponse.status} ${text}`);
    }

    // const initRaw = await initResponse.json();
    // const initResult = initRaw as TikTokInitResponse;

    console.log('$$$');
    console.log(accessToken);
    console.log(publishId);
    console.log('$$$');

    // if (!initResult.data || typeof initResult.data.publish_id !== 'string') {
    //   throw new Error(`TikTok init upload returned unexpected shape: ${JSON.stringify(initRaw)}`);
    // }

    // const publishId = initResult.data.publish_id;

    return res.status(200).json({ success: true, publishId });

  } catch (err: unknown) {
    console.error('Upload to TikTok Error:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}

