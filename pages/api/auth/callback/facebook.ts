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

    // const tokenData: TokenResponse = await tokenResponse.json();

    // if (tokenData.error) {
    //   throw new Error(tokenData.error.message);
    // }

    if (isTokenResponse(data)) {
      console.log('$$$');
      console.log(data.access_token); // No error
      console.log('$$$');
    } else {
      console.log('^^^');
      console.error('Invalid data structure');
      console.log('^^^');
    }

    // const tokenData = tokenResponse;
    // console.log('$$$');
    // console.log(tokenData);
    // console.log('$$$');
    // res.json(data);

    // const frontEndRedirect = `https://www.shadowmiraclerecords.com/fbook`;

    const frontEndRedirect = `https://www.shadowmiraclerecords.com/fbook?access_token=${encodeURIComponent(data.access_token)}`;

    res.redirect(307, frontEndRedirect);

    res.status(200).json({ data });

    // window.location.href = '/api/fbook';

    

    // Redirect to front-end, passing token in query (you could use other ways, e.g. cookies)
    // const frontEndRedirect = `https://www.shadowmiraclerecords.com/fbook?access_token=${encodeURIComponent(data.access_token)}`;
    // const frontEndRedirect = `https://www.shadowmiraclerecords.com/fbook`;

    // res.redirect(307, frontEndRedirect);

    // return NextResponse.redirect(frontEndRedirect);

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error exchanging code for token:', err);
    }
    res.status(500).send('Failed to get access token');
  }
  // return res.redirect(307, 'fbook');
  return NextResponse.redirect('https://www.shadowmiraclerecords.com/fbook');
}



// import { NextRequest, NextResponse } from 'next/server';

// interface TokenResponse {
//   access_token: string;
// }

// function isTokenResponse(data: unknown): data is TokenResponse {
//   return (
//     typeof data === 'object' &&
//     data !== null &&
//     'access_token' in data &&
//     typeof (data as TokenResponse).access_token === 'string'
//   );
// }

// export default async function GET(request: NextRequest) {
//   const FB_APP_ID = process.env.FB_APP_ID;
//   const FB_APP_SECRET = process.env.FB_APP_SECRET;
//   const REDIRECT_URI = process.env.FB_REDIRECT_URI;

//   if (!FB_APP_ID || !FB_APP_SECRET || !REDIRECT_URI) {
//     return new NextResponse('Missing env vars', { status: 500 });
//   }

//   const url = new URL(request.url);
//   const code = url.searchParams.get('code');
//   const error = url.searchParams.get('error');
//   const error_description = url.searchParams.get('error_description');

//   if (error) {
//     return new NextResponse(`OAuth Error: ${error} – ${error_description}`, { status: 400 });
//   }
//   if (!code) {
//     return new NextResponse('No code returned', { status: 400 });
//   }

//   const tokenUrl = `https://graph.facebook.com/v23.0/oauth/access_token` +
//     `?client_id=${encodeURIComponent(FB_APP_ID)}` +
//     `&client_secret=${encodeURIComponent(FB_APP_SECRET)}` +
//     `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//     `&code=${encodeURIComponent(code)}`;

//   const tokenRes = await fetch(tokenUrl);
//   const tokenJson = await tokenRes.json() as unknown;

//   if (!isTokenResponse(tokenJson)) {
//     console.error('Invalid token structure', tokenJson);
//     return new NextResponse('Invalid token response', { status: 500 });
//   }

//   const accessToken = tokenJson.access_token;
//   const redirectTo = `/fbook?access_token=${encodeURIComponent(accessToken)}`;

//   return NextResponse.redirect(redirectTo);
// }
