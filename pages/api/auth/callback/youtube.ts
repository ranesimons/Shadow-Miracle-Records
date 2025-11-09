// // pages/api/auth/callback/tiktok.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import fetch from 'node-fetch';

// interface TokenResponse {
//   access_token: string;
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env;

  // const code = (Array.isArray(req.query.code) ? req.query.code[0] : req.query.code) ?? '';

//   if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET || !TIKTOK_REDIRECT_URI) {
//     return res.status(500).json({ error: 'Missing required environment variables' });
//   }

//   try {
//     const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         client_key: TIKTOK_CLIENT_KEY,
//         client_secret: TIKTOK_CLIENT_SECRET,
//         code: code,
//         grant_type: 'authorization_code',
//         redirect_uri: TIKTOK_REDIRECT_URI,
//       }),
//     });

//     if (!tokenResponse.ok) {
//       throw new Error('Failed to exchange code for access token');
//     }

//     const data = await tokenResponse.json() as TokenResponse;

//     const frontEndRedirect = `https://www.shadowmiraclerecords.com/tok?access_token=${encodeURIComponent(data.access_token)}`;
//     res.redirect(307, frontEndRedirect);
//     res.status(200).json({ data });

//     // res.status(200).json(tokenData);

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//         res.status(500).json({ error: error.message });
//     }
//     else {
//         res.status(500).json({ error: "Unknown exception occurred" });
//     }
//   }
// }




// pages/api/youtubeoauth.ts
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

const clientId = YOUTUBE_CLIENT_ID;
const clientSecret = YOUTUBE_CLIENT_SECRET;
const redirectUri = YOUTUBE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<TokenResponse | ErrorResponse>
// ): Promise<void> {

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // const body = req.body as { code?: string | null | undefined };
  // const rawCode = body.code;
  // if (!rawCode || typeof rawCode !== 'string') {
  //   res.status(400).json({ error: 'Missing or invalid code' });
  //   return;
  // }
  // const code: string = rawCode;

  const code = (Array.isArray(req.query.code) ? req.query.code[0] : req.query.code) ?? '';

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const tokenInfo: TokenResponse = {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || '',
      scope: tokens.scope,
      token_type: tokens.token_type || '',
      expiry_date: tokens.expiry_date || 0
    };
    console.log('!!!')
    console.log(tokenInfo)
    console.log('!!!')
    res.status(200).json(tokenInfo);
    return;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during token exchange';
    res.status(500).json({ error: message });
    return;
  }
}
