// pages/api/upload-instagram.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface IGContainerResponse {
  id: string;
}

interface IGPublishResponse {
  id: string;
}

interface ApiResponse {
  success: boolean;
  mediaId?: string;
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
    const { blobUrl, caption = '', mediaType = 'VIDEO', shareToFeed = false } = req.body as {
      blobUrl?: string;
      caption?: string;
      mediaType?: 'VIDEO' | 'REELS' | 'STORIES';
      shareToFeed?: boolean;
    };

    if (!blobUrl) {
      return res.status(400).json({ success: false, error: 'Missing blobUrl' });
    }

    const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // or IG-user token with publish permissions

    if (!igUserId || !accessToken) {
      return res.status(500).json({ success: false, error: 'Server misconfigured: missing IG account ID or access token' });
    }

    // 1) Create media container
    const containerUrl = `https://graph.facebook.com/v16.0/${igUserId}/media`;
    const containerParams = new URLSearchParams();
    containerParams.append('media_type', mediaType);
    containerParams.append(mediaType === 'VIDEO' ? 'video_url' : 'video_url', blobUrl);
    containerParams.append('caption', caption);
    if (mediaType === 'REELS') {
      containerParams.append('share_to_feed', shareToFeed ? 'true' : 'false');
    }
    containerParams.append('access_token', accessToken);

    const containerRes = await fetch(containerUrl, {
      method: 'POST',
      body: containerParams,
    });

    const containerJson = await containerRes.json();
    if (!containerRes.ok) {
      throw new Error(`IG container creation failed: ${JSON.stringify(containerJson)}`);
    }

    const containerData = containerJson as IGContainerResponse;
    const creationId = containerData.id;
    if (!creationId) {
      throw new Error(`Invalid container response: ${JSON.stringify(containerJson)}`);
    }

    // 2) (Optionally) Wait / poll until video processing is done
    // Some videos need processing before they can be published — you might need to poll:
    // GET https://graph.facebook.com/v16.0/{creationId}?fields=status_code&access_token=...
    // until status_code === 'FINISHED'

    // 3) Publish the container
    const publishUrl = `https://graph.facebook.com/v16.0/${igUserId}/media_publish`;
    const publishParams = new URLSearchParams();
    publishParams.append('creation_id', creationId);
    publishParams.append('access_token', accessToken);

    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      body: publishParams,
    });

    const publishJson = await publishRes.json();
    if (!publishRes.ok) {
      throw new Error(`IG publish failed: ${JSON.stringify(publishJson)}`);
    }

    const publishData = publishJson as IGPublishResponse;
    const mediaId = publishData.id;
    if (!mediaId) {
      throw new Error(`Invalid publish response: ${JSON.stringify(publishJson)}`);
    }

    return res.status(200).json({ success: true, mediaId });
  } catch (err: unknown) {
    console.error('Upload to Instagram Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}
