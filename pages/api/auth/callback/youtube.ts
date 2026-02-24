// pages/api/auth/callback/youtube.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const {
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REDIRECT_URI
} = process.env;

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REDIRECT_URI) {
  throw new Error('Missing YouTube OAuth env variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use a fresh client for every request to avoid state issues
  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    YOUTUBE_REDIRECT_URI
  );

  const code = (Array.isArray(req.query.code) ? req.query.code[0] : req.query.code) ?? '';

  if (!code) {
    return res.redirect('/landing?yt_error=no_code_provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token; // <--- The permanent token

    if (!accessToken) {
        throw new Error("No access token returned from Google");
    }

    // Start building the redirect URL
    let redirectUrl = `/landing?yt_access_token=${encodeURIComponent(accessToken)}`;
    
    // ONLY append the refresh token if it exists. 
    // Remember: Google only sends this the FIRST time the user consents.
    if (refreshToken) {
      redirectUrl += `&yt_refresh_token=${encodeURIComponent(refreshToken)}`;
    }
    
    return res.redirect(redirectUrl);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('OAuth Error:', message);
    return res.redirect(`/landing?yt_error=${encodeURIComponent(message)}`);
  }
}