// // // pages/api/auth/callback/instagram-personal.ts
import { NextApiRequest, NextApiResponse } from 'next';

// // interface TokenResponse {
// //   access_token: string;
// //   user_id: string | number;
// // }

// // export default async function handler(
// //   req: NextApiRequest,
// //   res: NextApiResponse
// // ) {
// //   const { code, error, error_description } = req.query;
// //   if (error) {
// //     return res
// //       .status(400)
// //       .send(`Instagram OAuth Error: ${error} - ${error_description}`);
// //   }
// //   if (!code) {
// //     return res.status(400).send('No code returned from Instagram');
// //   }

// //   const IG_CLIENT_ID = process.env.IG_CLIENT_ID;
// //   const IG_CLIENT_SECRET = process.env.IG_CLIENT_SECRET;
// //   const IG_REDIRECT_URI =
// //     process.env.IG_REDIRECT_URI ||
// //     'https://shadowmiraclerecords.com/api/auth/callback/instagram-personal';

// //   console.log('IG_CLIENT_ID:', IG_CLIENT_ID);
// //   console.log('IG_CLIENT_SECRET:', IG_CLIENT_SECRET);
// //   console.log('IG_REDIRECT_URI:', IG_REDIRECT_URI);

// //   if (!IG_CLIENT_ID || !IG_CLIENT_SECRET) {
// //     return res
// //       .status(500)
// //       .json({ error: 'Missing IG_CLIENT_ID or IG_CLIENT_SECRET' });
// //   }

// //   try {
// //     const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/x-www-form-urlencoded',
// //       },
// //       body: new URLSearchParams({
// //         client_id: IG_CLIENT_ID,
// //         client_secret: IG_CLIENT_SECRET,
// //         grant_type: 'authorization_code',
// //         redirect_uri: IG_REDIRECT_URI,
// //         code: code as string,
// //       }),
// //     });

// //     const raw = await tokenResp.text();
// //     // sometimes Instagram returns error info in JSON or text, log both
// //     let data: TokenResponse;
// //     try {
// //       data = JSON.parse(raw) as TokenResponse;
// //     } catch (parseErr) {
// //       console.error('Failed to parse token response:', parseErr, 'raw:', raw);
// //       return res.status(500).send(`Instagram token error: ${raw}`);
// //     }

// //     if ((data as any).error) {
// //       console.error('Instagram token endpoint returned error:', data);
// //       return res
// //         .status(400)
// //         .send(`Instagram OAuth error: ${(data as any).error.message || JSON.stringify(data)}`);
// //     }

// //     const { access_token, user_id } = data;

// //     const frontEndRedirect =
// //       `https://www.shadowmiraclerecords.com/landing?ig_access_token=${encodeURIComponent(
// //         access_token
// //       )}&ig_user_id=${encodeURIComponent(String(user_id))}`;

// //     res.redirect(307, frontEndRedirect);
// //   } catch (err: unknown) {
// //     console.error('Error exchanging code for token:', err);
// //     res.status(500).send('Failed to get Instagram access token');
// //   }
// // }

// // pages/api/auth/callback/instagram-personal.ts
// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { code, error } = req.query;

//   if (error || !code) {
//     return res.status(400).send(`Auth Failed: ${error || 'No code returned'}`);
//   }

//   if (!code || typeof code !== 'string') {
//     return res.status(400).send('No code provided');
//   }

//   // FIX: Strip the trailing #_ fragment if it exists
//   const cleanCode = code.split('#')[0];

//   try {
//     // STEP 1: Exchange code for a Short-Lived Token (Valid 1 hour)
//     const shortLivedResp = await fetch('https://graph.instagram.com/access_token', {
//       method: 'POST',
//       body: new URLSearchParams({
//         client_id: process.env.IG_CLIENT_ID!,
//         client_secret: process.env.IG_CLIENT_SECRET!,
//         grant_type: 'authorization_code',
//         redirect_uri: process.env.IG_REDIRECT_URI!,
//         code: cleanCode as string,
//       }),
//     });

//     const shortLivedData = await shortLivedResp.json();

//     if (shortLivedData.error) {
//       return res.status(400).json(shortLivedData.error);
//     }

//     // STEP 2: Exchange for a Long-Lived Token (Valid 60 days)
//     // This is the "magic" step for Creator accounts
//     const longLivedResp = await fetch(
//       `https://graph.instagram.com/access_token?` +
//       `grant_type=ig_exchange_token` +
//       `&client_secret=${process.env.IG_CLIENT_SECRET}` +
//       `&access_token=${shortLivedData.access_token}`
//     );

//     const data = await longLivedResp.json();

//     // STEP 3: Redirect to your frontend with the 60-day token
//     const frontEndRedirect =
//       `https://www.shadowmiraclerecords.com/landing?` +
//       `token=${encodeURIComponent(data.access_token)}` +
//       `&user_id=${shortLivedData.user_id}`;

//     res.redirect(307, frontEndRedirect);
//   } catch (err) {
//     res.status(500).send('Internal Server Error during Token Exchange');
//   }
// }

// pages/api/auth/callback/instagram-personal.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  // 1. Clean the code (strip the fragment Meta appends)
  const cleanCode = typeof code === 'string' ? code.split('#')[0] : '';

  try {
    // 2. Use the 'Instagram Login' endpoint, not the Facebook one
    const shortLivedResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.IG_CLIENT_ID!,
        client_secret: process.env.IG_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: 'https://www.shadowmiraclerecords.com/api/auth/callback/instagram-personal',
        code: cleanCode,
      }),
    });

  //   const data = await response.json();

  //   if (data.error) {
  //     // If you see "error_subcode": 491 here, it means your redirect_uri 
  //     // in the code above doesn't match the one in the Dashboard.
  //     return res.status(400).json(data);
  //   }

  //   // Success! This 'access_token' is your real key.
  //   return res.status(200).json({ access_token: data.access_token });
  // } catch (err) {
  //   return res.status(500).json({ error: "Exchange failed" });
  // }
  const shortLivedData = await shortLivedResponse.json();

    if (shortLivedData.error) {
      return res.status(400).json({ step: 'short_lived_exchange', ...shortLivedData });
    }

    const shortLivedToken = shortLivedData.access_token;

    // 2. IMMEDIATELY exchange for a Long-Lived Token (60 days)
    // Note: We use graph.instagram.com for this exchange
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_CLIENT_SECRET}&access_token=${shortLivedToken}`
    );

    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      return res.status(400).json({ step: 'long_lived_exchange', ...longLivedData });
    }

    const finalToken = longLivedData.access_token;

    // 3. Optional: Get the User's Profile to store in your DB
    const userProfileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${finalToken}`
    );
    const profileData = await userProfileResponse.json();

    const frontEndRedirect = `https://www.shadowmiraclerecords.com/landing?ig_access_token=${encodeURIComponent(finalToken)}&ig_user_id=${encodeURIComponent(profileData.id)}`;
    res.redirect(307, frontEndRedirect);

    // SUCCESS: You now have a 60-day token and user info
    // return res.status(200).json({
    //   success: true,
    //   message: "Long-lived token acquired",
    //   user: profileData,
    //   access_token: finalToken, // Save this to your database!
    //   expires_in: longLivedData.expires_in
    // });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error during token exchange" });
  }
}