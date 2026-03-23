// pages/api/upload-instagram.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('req.body:', req.body);

  const { creationId, igUserId, accessToken } = req.body;

  console.log('creationId:', creationId);
  console.log('igUserId:', igUserId);
  console.log('accessToken:', accessToken);

  // 1. Validation
  if (!creationId || !accessToken || !igUserId) {
    return res.status(400).json({ error: 'Missing required fields: creationId, accessToken, or igUserId' });
  }

  try {

    // const containerData = await containerResponse.json();

    // console.log('containerData:', containerData);

    // if (containerData.error) {
    //   console.error('Container Error:', containerData.error);
    //   return res.status(400).json({ step: 'container_creation', ...containerData.error });
    // }

    // const creationId = containerData.id;

    // --- STEP 2: PUBLISH THE CONTAINER ---
    // Instagram needs a moment to process the image; for production, 
    // you'd check the status, but for a simple script, we call publish immediately.
    const publishResponse = await fetch(
      `https://graph.instagram.com/v22.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          creation_id: creationId,
        }),
      }
    );

    const publishData = await publishResponse.json();

    console.log('publishData:', publishData);

    if (publishData.error) {
      console.error('Publish Error:', publishData.error);
      return res.status(400).json({ step: 'media_publish', ...publishData.error });
    }

    // SUCCESS!
    return res.status(200).json({
      success: true,
      postId: publishData.id,
      message: 'Post successfully uploaded to Instagram',
    });

  } catch (error) {
    console.error('Upload Process Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
