// pages/api/auth/callback/instagram-personal.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface TokenResponse {
  access_token: string;
  user_id: string | number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, error, error_description } = req.query;
  if (error) {
    return res
      .status(400)
      .send(`Instagram OAuth Error: ${error} - ${error_description}`);
  }
  if (!code) {
    return res.status(400).send('No code returned from Instagram');
  }

  const IG_CLIENT_ID = process.env.IG_CLIENT_ID;
  const IG_CLIENT_SECRET = process.env.IG_CLIENT_SECRET;
  const IG_REDIRECT_URI =
    process.env.IG_REDIRECT_URI ||
    'https://shadowmiraclerecords.com/api/auth/callback/instagram-personal';

  console.log('IG_CLIENT_ID:', IG_CLIENT_ID);
  console.log('IG_CLIENT_SECRET:', IG_CLIENT_SECRET);
  console.log('IG_REDIRECT_URI:', IG_REDIRECT_URI);

  if (!IG_CLIENT_ID || !IG_CLIENT_SECRET) {
    return res
      .status(500)
      .json({ error: 'Missing IG_CLIENT_ID or IG_CLIENT_SECRET' });
  }

  try {
    const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: IG_CLIENT_ID,
        client_secret: IG_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: IG_REDIRECT_URI,
        code: code as string,
      }),
    });

    const raw = await tokenResp.text();
    // sometimes Instagram returns error info in JSON or text, log both
    let data: TokenResponse;
    try {
      data = JSON.parse(raw) as TokenResponse;
    } catch (parseErr) {
      console.error('Failed to parse token response:', parseErr, 'raw:', raw);
      return res.status(500).send(`Instagram token error: ${raw}`);
    }

    if ((data as any).error) {
      console.error('Instagram token endpoint returned error:', data);
      return res
        .status(400)
        .send(`Instagram OAuth error: ${(data as any).error.message || JSON.stringify(data)}`);
    }

    const { access_token, user_id } = data;

    const frontEndRedirect =
      `https://www.shadowmiraclerecords.com/landing?ig_access_token=${encodeURIComponent(
        access_token
      )}&ig_user_id=${encodeURIComponent(String(user_id))}`;

    res.redirect(307, frontEndRedirect);
  } catch (err: unknown) {
    console.error('Error exchanging code for token:', err);
    res.status(500).send('Failed to get Instagram access token');
  }
}