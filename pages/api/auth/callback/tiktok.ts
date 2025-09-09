// pages/api/auth/callback/tiktok.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const { code, state } = req.query;
  // const { rcode } = req.query;
  const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env;

  // Retrieve the stored state from the session or cookie
  // const storedState = req.session.state;

  // if (state !== storedState) {
  //   return res.status(400).json({ error: 'Invalid or missing state' });
  // }

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

    const tokenData = await tokenResponse.json();

    // Store tokenData in session or database as needed

    res.status(200).json(tokenData);




    

    // const params = new URLSearchParams();
    // params.append('client_key', process.env.TIKTOK_CLIENT_KEY!);
    // params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET!);
    // params.append('code', code);
    // params.append('grant_type', 'authorization_code');
    // params.append('redirect_uri', process.env.TIKTOK_REDIRECT_URI!);

    // const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: params,
    // });

    // const data = await response.json();
    // console.log(data);

  } catch (error: unknown) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    }
    else {
        res.status(500).json({ error: "Unknown exception occurred" });
    }
  }
}
