// pages/api/auth/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { TIKTOK_CLIENT_KEY } = process.env;

  // const TIKTOK_SCOPES = 'user.info.basic,video.list,video.publish'

  const TIKTOK_SCOPES = 'user.info.basic,video.list'

  // const TIKTOK_REDIRECT_URI: string = process.env.TIKTOK_REDIRECT_URI ?? 'https://shadowmiraclerecords.com/api/auth/callback/tiktok';
  const TIKTOK_REDIRECT_URI: string = process.env.TIKTOK_REDIRECT_URI ?? 'https://shadowmiraclerecords.com/api/auth/callback/tiktok';

  // Generate a random state parameter
  const state = Math.random().toString(36).substring(2);

  // Store the state in a secure session or cookie
  // Example: req.session.state = state;

  const authorizationUrl = `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${TIKTOK_CLIENT_KEY}` +
    `&scope=${TIKTOK_SCOPES}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}` +
    `&state=${state}`;

  res.redirect(authorizationUrl);
}
