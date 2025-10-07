// pages/api/auth/callback/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
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
      throw new Error('Failed to exchange code for access token');
    }

    const data = await tokenResponse.json() as TokenResponse;

    const frontEndRedirect = `https://www.shadowmiraclerecords.com/tok?access_token=${encodeURIComponent(data.access_token)}`;
    res.redirect(307, frontEndRedirect);
    res.status(200).json({ data });

    // res.status(200).json(tokenData);

  } catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    }
    else {
        res.status(500).json({ error: "Unknown exception occurred" });
    }
  }
}
