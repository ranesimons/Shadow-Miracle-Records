// pages/api/youtubeoauth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const {
  YOUTUBE_CLIENT_ID,
  YOUTUBE_REDIRECT_URI
} = process.env;

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_REDIRECT_URI) {
  throw new Error('Missing YouTube OAuth env variables');
}

const clientId = YOUTUBE_CLIENT_ID;
const redirectUri = YOUTUBE_REDIRECT_URI;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload'
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {

    const params: Record<string,string> = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES.join(' ')
};
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`;
console.log('???')
console.log(clientId)
console.log('???')
console.log(redirectUri)
console.log('???')
console.log(SCOPES.join(' '))
console.log('???')
console.log(authUrl)
console.log('???')
res.redirect(authUrl);
}
