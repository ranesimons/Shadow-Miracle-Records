// app/api/auth/callback/facebook/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
}

function isTokenResponse(data: unknown): data is TokenResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'access_token' in data
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const FB_OAUTH_VERSION = 'v23.0';  // adjust if needed
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

    const tokenUrl = `https://graph.facebook.com/${FB_OAUTH_VERSION}/oauth/access_token` +
    `?client_id=${FB_APP_ID}` +
    `&client_secret=${FB_APP_SECRET}` +
    `&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}` +
    `&code=${code}`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await tokenResponse.json() as TokenResponse;

    if (isTokenResponse(data)) {
      console.log('$$$');
      console.log(data.access_token);
      console.log('$$$');
    } else {
      console.log('^^^');
      console.error('Invalid data structure');
      console.log('^^^');
    }

    const frontEndRedirect = `https://www.shadowmiraclerecords.com/fbook?access_token=${encodeURIComponent(data.access_token)}`;
    res.redirect(307, frontEndRedirect);
    res.status(200).json({ data });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error exchanging code for token:', err);
    }
    res.status(500).send('Failed to get access token');
  }
  return NextResponse.redirect('https://www.shadowmiraclerecords.com/fbook');
}
