// pages/api/auth/callback/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env;
  const FB_APP_ID = process.env.FB_APP_ID;
  const FB_APP_SECRET = process.env.FB_APP_SECRET;
  const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI || 'https://shadowmiraclerecords.com/api/auth/callback/facebook'; 

  if (!FB_APP_ID || !FB_APP_SECRET || !FB_REDIRECT_URI) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  try {
  const { code, error, error_description } = req.query;
  if (error) {
    return res.status(400).send(`Facebook OAuth Error: ${error} - ${error_description}`);
  }
  if (!code) {
    return res.status(400).send('No code returned from Facebook');
  }

  try {
    // Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/${FB_OAUTH_VERSION}/oauth/access_token` +
    `?client_id=${FB_APP_ID}` +
    `?client_secret=${FB_APP_SECRET}` +
    `&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}` +
    `&code=${code}`;

    // const tokenResponse = await axios.get(tokenUrl, {
    //   params: {
    //     client_id: FB_APP_ID,
    //     client_secret: FB_APP_SECRET,
    //     redirect_uri: FB_REDIRECT_URI,
    //     code: code
    //   }
    // });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = tokenResponse;
    // tokenData looks like: { access_token: "...", token_type: "bearer", expires_in: 3600, ... }

    // Now you have a short-lived access token. You can send it to client, store it, etc.
    res.json(tokenData);

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error exchanging code for token:', err);
    }
    res.status(500).send('Failed to get access token');
  }
}
