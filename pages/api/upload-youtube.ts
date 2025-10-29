// pages/api/upload-youtube.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { BlobServiceClient } from '@azure/storage-blob';
import fetch from 'node-fetch';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

// Load env
const {
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_SAS_TOKEN,
  AZURE_VIDEO_CONTAINER_NAME,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REFRESH_TOKEN,
  YOUTUBE_CHANNEL_ID,          // optional if needed
} = process.env;

if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_SAS_TOKEN || !AZURE_VIDEO_CONTAINER_NAME) {
  throw new Error('Azure storage env variables missing');
}
if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  throw new Error('YouTube OAuth env variables missing');
}

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net?${AZURE_STORAGE_SAS_TOKEN}`
);

const oauth2Client = new google.auth.OAuth2(
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET
);
// oauth2Client.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

type Data = { success: boolean; videoId?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('^^^');
  console.log(req.method);
  console.log('^^^');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { blobName, title = 'testing', description = 'testing', privacyStatus = 'unlisted' } = req.body;
    console.log('===');
    console.log(blobName);
    console.log(title);
    console.log('===');
    if (!blobName || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields blobName or title' });
    }

    // 1) Get blob URL / stream from Azure
    const containerClient = blobServiceClient.getContainerClient(AZURE_VIDEO_CONTAINER_NAME || "");
    const blobClient = containerClient.getBlobClient(blobName);
    // const blobUrl = blobClient.url + `?${AZURE_STORAGE_SAS_TOKEN}`;

    // Define the blob URL with the SAS token appended
    // const blobUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_VIDEO_CONTAINER_NAME}/${blobName}?${AZURE_STORAGE_SAS_TOKEN}`;

    const blobUrl = 'https://smr.blob.core.windows.net/uploads/year2025_month10_day31_Devout%20Kuya%20Verse.mov?sp=racwdli&st=2025-10-23T03:38:09Z&se=2025-10-31T11:53:09Z&sv=2024-11-04&sr=c&sig=cNRgqVGgV3fAzaC1kr9flhddd7rgrnlAy7ETPVOyF%2Bo%3D'

    console.log(']]]');
    console.log(blobUrl);
    console.log(']]]');

    // 2) Fetch the blob and get a readable stream
    const azureRes = await fetch(blobUrl);
    if (!azureRes.ok) {
      throw new Error(`Failed to fetch blob from Azure: ${azureRes.statusText}`);
    }
    const videoStream = azureRes.body;

    // 3) Upload to YouTube
    const insertResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: description || '',
          categoryId: '22', // choose appropriate category
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
    if (!videoId) {
      throw new Error('YouTube upload did not return videoId');
    }

    // Optional: you might want to do something post‐upload (tag blob, move blob, record in DB, etc)

    return res.status(200).json({ success: true, videoId });
  } catch (err: unknown) {
    console.error('Upload to YouTube Error:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
