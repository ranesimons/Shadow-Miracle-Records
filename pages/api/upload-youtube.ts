// pages/api/upload-youtube.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import fetch from 'node-fetch';

type Data = { success: boolean; videoId?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
        blobName, 
        title = 'testing', 
        refreshToken, // <--- New dynamic field
        description = 'testing', 
        privacyStatus = 'public' 
    } = req.body;

    if (!blobName || !title || !refreshToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: blobName, title, or refreshToken' 
      });
    }

    // 1. Setup OAuth2 Client with the dynamic refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // 2. EXPLICIT REFRESH: This is where invalid_grant usually triggers.
    // We catch it here to give a better error message.
    try {
      await oauth2Client.getAccessToken();
    } catch (tokenErr: any) {
      console.error("Token Refresh Error:", tokenErr.response?.data || tokenErr.message);
      return res.status(401).json({ 
        success: false, 
        error: 'YouTube session expired. Please re-authenticate.' 
      });
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // 3. Fetch from Azure
    const azureRes = await fetch(blobName);
    if (!azureRes.ok) {
      throw new Error(`Failed to fetch blob from Azure: ${azureRes.statusText}`);
    }
    const videoStream = azureRes.body;

    // 4. Upload to YouTube
    const insertResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: description || '',
          categoryId: '22',
        },
        status: {
          privacyStatus,
        },
      },
      media: {
        body: videoStream as unknown as NodeJS.ReadableStream,
      },
    });

    const videoId = insertResponse.data.id;
    // Using ?? ensures null becomes undefined, which matches your 'Data' type
    return res.status(200).json({ success: true, videoId: videoId ?? undefined });

  } catch (err: unknown) {
    console.error('Upload to YouTube Error:', err);
    return res.status(500).json({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
}
