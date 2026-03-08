// pages/api/auth/callback/instagram.ts
// This endpoint is no longer used with manual token setup
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ error: 'OAuth callback no longer used - using manual token configuration' });
}
