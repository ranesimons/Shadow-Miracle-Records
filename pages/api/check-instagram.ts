// pages/api/check-instagram.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, accessToken } = req.query;

  try {
    console.log('id', id);
    console.log('accessToken', accessToken);
    const response = await fetch(
      `https://graph.instagram.com/v22.0/${id}?fields=status_code&access_token=${accessToken}`
    );
    const data = await response.json();

    // Possible status_code: 'IN_PROGRESS', 'FINISHED', 'ERROR'
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Status check failed" });
  }
}