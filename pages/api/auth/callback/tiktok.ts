// pages/api/auth/callback/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface TokenResponse {
  access_token: string;
  open_id: string;
  expires_in: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env;

  const code = (Array.isArray(req.query.code) ? req.query.code[0] : req.query.code) ?? '';

  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET || !TIKTOK_REDIRECT_URI) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  try {
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('TikTok Token Error:', errorData);
      throw new Error('Failed to exchange code for access token');
    }

    const data = await tokenResponse.json() as TokenResponse;

    // Redirecting to the /landing page with the token in the hash or query
    // Using '#' (fragment) is slightly more secure as it's not sent to the server in subsequent requests
    const frontEndRedirect = `https://www.shadowmiraclerecords.com/landing?access_token=${encodeURIComponent(data.access_token)}`;
    
    // Perform the redirect and stop execution here
    return res.redirect(307, frontEndRedirect);

  } catch (error: unknown) {
    console.error('Auth Callback Error:', error);
    const message = error instanceof Error ? error.message : "Unknown exception occurred";
    return res.status(500).json({ error: message });
  }
}