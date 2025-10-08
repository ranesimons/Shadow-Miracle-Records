// src/lib/instagram.ts
import fetch from 'node-fetch';

type CreateContainerResp = {
  id: string;
};

export async function publishInstagramReel({
  igUserId,
  caption,
  videoUrl,
}: {
  igUserId: string;
  caption: string;
  videoUrl: string;
}) {
  const token = process.env.IG_ACCESS_TOKEN ?? "";
  if (!token) throw new Error('No token');

  // Step 1: create media container
  const createResp = await fetch(
    `https://graph.facebook.com/v17.0/${igUserId}/media`,
    {
      method: 'POST',
      body: new URLSearchParams({
        access_token: token,
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        share_to_feed: 'true',
      }),
    }
  );
  const createJson = await createResp.json();
  if (!createResp.ok) {
    throw new Error(
      'Error creating container: ' + JSON.stringify(createJson)
    );
  }
  const containerId = (createJson as CreateContainerResp).id;
  if (!containerId) {
    throw new Error('No container id returned');
  }

  // Step 2: publish
  const publishResp = await fetch(
    `https://graph.facebook.com/v17.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        access_token: token,
        creation_id: containerId,
      }),
    }
  );
  const pubJson = await publishResp.json();
  if (!publishResp.ok) {
    throw new Error(
      'Error publishing: ' + JSON.stringify(pubJson)
    );
  }
  return pubJson; // includes Instagram post ID etc.
}
