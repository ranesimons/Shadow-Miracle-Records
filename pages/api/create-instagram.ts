// pages/api/create-instagram.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobUrl, caption = '', mediaType = 'REELS', shareToFeed = false, igUserId, accessToken } = req.body;

  const imageUrl = blobUrl

  console.log('imageUrl:', imageUrl);
  console.log('caption:', caption);
  console.log('mediaType:', mediaType);
  console.log('shareToFeed:', shareToFeed);
  console.log('igUserId:', igUserId);
  console.log('accessToken:', accessToken);

  // 1. Validation
  if (!blobUrl || !accessToken || !igUserId) {
    return res.status(400).json({ error: 'Missing required fields: blobUrl, accessToken, or igUserId' });
  }

  try {
    // // --- STEP 1: CREATE THE MEDIA CONTAINER ---
    // // Note: We use the v22.0 (current for 2026) graph.instagram.com endpoint
    // const containerResponse = await fetch(
    //   `https://graph.instagram.com/v22.0/${igUserId}/media`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${accessToken}`, // Passing token in header avoids parsing issues
    //     },
    //     body: JSON.stringify({
    //       image_url: imageUrl,
    //       caption: caption || '',
    //     }),
    //   }
    // );

    // --- STEP 1: CREATE THE MEDIA CONTAINER (VIDEO VERSION) ---
    const containerResponse = await fetch(
      `https://graph.instagram.com/v22.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          video_url: blobUrl, // Required for .mov/.mp4
          media_type: 'REELS', // Best for 2026 standalone video posts
          caption: caption || '',
          share_mode: 'FEED_AND_REELS' // Optional: puts it on both your grid and Reels tab
        }),
      }
    );

    const containerData = await containerResponse.json();

    console.log('containerData:', containerData);

    if (containerData.error) {
      console.error('Container Error:', containerData.error);
      return res.status(400).json({ step: 'container_creation', ...containerData.error });
    }

    const creationId = containerData.id;

    // --- STEP 2: PUBLISH THE CONTAINER ---
    // Instagram needs a moment to process the image; for production, 
    // you'd check the status, but for a simple script, we call publish immediately.
    // const publishResponse = await fetch(
    //   `https://graph.instagram.com/v22.0/${igUserId}/media_publish`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${accessToken}`,
    //     },
    //     body: JSON.stringify({
    //       creation_id: creationId,
    //     }),
    //   }
    // );

    // const publishData = await publishResponse.json();

    // console.log('publishData:', publishData);

    // if (publishData.error) {
    //   console.error('Publish Error:', publishData.error);
    //   return res.status(400).json({ step: 'media_publish', ...publishData.error });
    // }

    console.log('creationId:', creationId);

    // SUCCESS!
    return res.status(200).json({
      success: true,
      containerId: creationId,
      message: 'Container successfully created for Instagram',
    });

  } catch (error) {
    console.error('Upload Process Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
