// app/api/auth/callback/facebook/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface TokenResponse {
  access_token: string;
}

interface PageData {
  id: string;
  name: string;
  // other fields
}

interface PagesResponse {
  data: PageData[];
}

interface InstagramAccount {
  id: string;
}

interface PageDetails {
  instagram_business_account?: InstagramAccount;
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

    // Get Instagram user ID from Facebook pages
    let igUserId = process.env.IG_USER_ID || '';
    console.log('Initial igUserId from env:', igUserId);
    try {
      const pagesResponse = await fetch(`https://graph.facebook.com/${FB_OAUTH_VERSION}/me/accounts?access_token=${data.access_token}`);
      const pagesData = await pagesResponse.json() as PagesResponse;
      console.log('Pages data:', pagesData);
      if (pagesData.data && pagesData.data.length > 0) {
        const pageId = pagesData.data[0].id; // Assume first page
        console.log('Using page ID:', pageId);
        const igResponse = await fetch(`https://graph.facebook.com/${FB_OAUTH_VERSION}/${pageId}?fields=instagram_business_account&access_token=${data.access_token}`);
        const igData = await igResponse.json() as PageDetails;
        console.log('Instagram data for page:', igData);
        if (igData.instagram_business_account && igData.instagram_business_account.id) {
          igUserId = igData.instagram_business_account.id;
          console.log('Set igUserId from API:', igUserId);
        } else {
          console.log('No Instagram business account found for this page');
        }
      } else {
        console.log('No pages found for this user');
      }
    } catch (error) {
      console.error('Error fetching Instagram user ID:', error);
      // Fall back to env var
    }

    const frontEndRedirect = `https://www.shadowmiraclerecords.com/landing?fb_access_token=${encodeURIComponent(data.access_token)}&ig_access_token=${encodeURIComponent(data.access_token)}&ig_user_id=${encodeURIComponent(igUserId)}`;
    console.log('ig access token:', data.access_token);
    console.log('ig user id:', igUserId);
    res.redirect(307, frontEndRedirect);

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error exchanging code for token:', err);
    }
    res.status(500).send('Failed to get access token');
  }
}
