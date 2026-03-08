// pages/api/auth/instagram-personal.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const IG_CLIENT_ID = process.env.IG_CLIENT_ID;
  const IG_REDIRECT_URI =
    process.env.IG_REDIRECT_URI ||
    'https://shadowmiraclerecords.com/api/auth/callback/instagram-personal';

  if (!IG_CLIENT_ID) {
    console.error('Missing IG_CLIENT_ID environment variable');
    res
      .status(500)
      .send('Instagram personal auth not configured - set IG_CLIENT_ID');
    return;
  }
  // note: the app referenced by IG_CLIENT_ID must have the "Instagram Basic Display"
  // product enabled in the Facebook developer console; otherwise Facebook/Instagram will
  // reject requests with "Invalid platform app".  See README for setup instructions.


  // optional: could also generate and store state in a cookie/session
  const state = Math.random().toString(36).substring(2);

  const authUrl =
    `https://api.instagram.com/oauth/authorize` +
    `?client_id=${IG_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(IG_REDIRECT_URI)}` +
    `&scope=user_profile,user_media` +
    `&response_type=code` +
    `&state=${state}`;

  res.redirect(307, authUrl);
}