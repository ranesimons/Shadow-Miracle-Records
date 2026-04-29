// pages/api/auth/instagram-personal.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use the INSTAGRAM_APP_ID from the "Instagram Login" product tab
  const IG_CLIENT_ID = process.env.IG_CLIENT_ID; 
  const IG_REDIRECT_URI = process.env.IG_REDIRECT_URI;

  // 2. Add this check to satisfy TypeScript
  if (!IG_CLIENT_ID || !IG_REDIRECT_URI) {
    return res.status(500).json({ 
      error: "Environment variables IG_CLIENT_ID or IG_REDIRECT_URI are not defined." 
    });
  }

  // 1. Updated Scopes for 2026
  // 'instagram_business_basic' is the new standard for profile/media access
  const SCOPES = [
    'instagram_business_basic',
    'instagram_business_content_publish', // Add this if you plan to schedule posts
    'instagram_business_manage_messages'  // Add this for DM automation
  ].join(',');

  const state = Math.random().toString(36).substring(2);

  console.log('ig redirect - IG_CLIENT_ID:', IG_CLIENT_ID);
  console.log('ig redirect - IG_REDIRECT_URI:', IG_REDIRECT_URI);
  console.log('state:', state);

  // 4. Construct Authorization URL
  // We use URLSearchParams to handle the encoding of the Redirect URI automatically
  const params = new URLSearchParams({
    enable_fb_login: '0',
    force_authentication: '1',
    client_id: IG_CLIENT_ID,
    redirect_uri: IG_REDIRECT_URI,
    scope: SCOPES,
    response_type: 'code',
    state: state,
  });

  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

  // 5. Redirect to Instagram
  res.redirect(307, authUrl);
}

