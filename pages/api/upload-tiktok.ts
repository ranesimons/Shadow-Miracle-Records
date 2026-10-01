// pages/api/upload-tiktok.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import JSONBig from 'json-bigint';
import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

type Data = { success: boolean; publishId?: string; error?: string };

export const config = { maxDuration: 60 };

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
      privacyLevel,
      allowComment = false,
      allowDuet = false,
      allowStitch = false,
      brandContentToggle = false,
      brandOrganicToggle = false,
    } = req.body;

    if (!blobName || !title) {
      return res.status(400).json({ success: false, error: 'Missing required fields blobName or title' });
    }

    const validPrivacyLevels = ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];
    if (!validPrivacyLevels.includes(privacyLevel)) {
      return res.status(400).json({ success: false, error: 'Please choose who can view this video.' });
    }
    if (brandContentToggle && privacyLevel === 'SELF_ONLY') {
      return res.status(400).json({ success: false, error: 'Branded content visibility cannot be set to private.' });
    }

    // Generate a read SAS to fetch the video from Azure
    const blobUrlParsed = new URL(blobName);
    const pathParts = blobUrlParsed.pathname.split('/').filter(Boolean);
    const containerName = pathParts[0];
    const blobFileName = decodeURIComponent(pathParts.slice(1).join('/'));

    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      process.env.AZURE_STORAGE_ACCOUNT_KEY!
    );
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: blobFileName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
      sharedKeyCredential
    ).toString();

    const videoUrl = `${blobName}?${sasToken}`;

    // Get video size
    const headResp = await fetch(videoUrl, { method: 'HEAD' });
    const videoSize = parseInt(headResp.headers.get('content-length') ?? '0');
    if (!headResp.ok || !videoSize) {
      return res.status(500).json({ success: false, error: `Could not read video from Azure (HTTP ${headResp.status})` });
    }

    // TikTok: count is floor(size/chunk) with the remainder folded into the last chunk; smaller files go as one chunk
    const DEFAULT_CHUNK = 10 * 1024 * 1024;
    const CHUNK_SIZE = videoSize < DEFAULT_CHUNK ? videoSize : DEFAULT_CHUNK;
    const totalChunkCount = Math.floor(videoSize / CHUNK_SIZE);

    // Init upload with TikTok using FILE_UPLOAD — no domain verification needed
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
            // Direct Post has no description field; the title is the full caption
            title: description ? `${title}\n\n${description}`.slice(0, 2200) : title,
            privacy_level: privacyLevel,
            disable_comment: !allowComment,
            disable_duet: !allowDuet,
            disable_stitch: !allowStitch,
            brand_content_toggle: brandContentToggle,
            brand_organic_toggle: brandOrganicToggle,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: videoSize,
            chunk_size: CHUNK_SIZE,
            total_chunk_count: totalChunkCount,
          },
        }),
      }
    );

    const initText = await initResponse.text();
    if (!initResponse.ok) {
      throw new Error(`Init upload failed: ${initResponse.status} ${initText}`);
    }

    const initData = JSONBig({ storeAsString: true }).parse(initText);
    const publishId: string = initData.data.publish_id;
    const uploadUrl: string = initData.data.upload_url;

    // Download video from Azure
    const videoResp = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await videoResp.arrayBuffer());

    // Push chunks to TikTok
    for (let i = 0; i < totalChunkCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = i === totalChunkCount - 1 ? videoSize : start + CHUNK_SIZE;
      const chunk = videoBuffer.subarray(start, end);

      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
          'Content-Type': 'video/mp4',
          'Content-Length': String(end - start),
        },
        body: chunk,
      });

      if (!uploadResp.ok) {
        const uploadErr = await uploadResp.text();
        throw new Error(`Chunk ${i + 1}/${totalChunkCount} failed: ${uploadResp.status} ${uploadErr}`);
      }
    }

    return res.status(200).json({ success: true, publishId });

  } catch (err: unknown) {
    console.error('Upload to TikTok Error:', err);
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
