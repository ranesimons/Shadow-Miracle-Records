// pages/api/auth/instagram.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use manual Instagram access token from environment
  const { IG_ACCESS_TOKEN, IG_USER_ID } = process.env;

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    console.error('Missing IG_ACCESS_TOKEN or IG_USER_ID environment variables');
    res.status(500).send('Instagram not configured - set IG_ACCESS_TOKEN and IG_USER_ID in environment');
    return;
  }

  // Redirect to landing page with token and user ID
  const frontEndRedirect =
    `https://www.shadowmiraclerecords.com/landing?ig_access_token=${encodeURIComponent(
      IG_ACCESS_TOKEN
    )}&ig_user_id=${encodeURIComponent(IG_USER_ID)}`;

  res.redirect(307, frontEndRedirect);
}
