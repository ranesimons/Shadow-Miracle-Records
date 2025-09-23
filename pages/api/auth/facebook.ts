// pages/api/auth/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Generate a random state parameter
  const state = Math.random().toString(36).substring(2);

  const FB_OAUTH_VERSION = 'v23.0';  // adjust if needed
  const FB_APP_ID = process.env.FB_APP_ID;
  const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI || 'https://shadowmiraclerecords.com/api/auth/callback/facebook'; 

  // 1. Route to redirect user to Facebook login dialog

  const scope = ['pages_show_list', 'read_insights', 'pages_read_engagement', ];  // adjust scopes as needed
  const authorizationUrl = `https://www.facebook.com/${FB_OAUTH_VERSION}/dialog/oauth` +
      `?client_id=${FB_APP_ID}` +
      `&scope=${encodeURIComponent(scope.join(','))}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}` +
      `&state=${state}`;

  res.redirect(authorizationUrl);
}