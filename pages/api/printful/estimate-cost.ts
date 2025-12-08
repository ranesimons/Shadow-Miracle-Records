// pages/api/printful/estimate-cost.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { variant_id, country_code } = req.body;

  console.log('===')
  console.log(variant_id)
  console.log('===')
  console.log(country_code)
  console.log('===')

  if (!variant_id || Array.isArray(variant_id)) {
    return res.status(400).json({ error: 'Missing or invalid variant_id' });
  }

  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Missing Printful API token' });
  }

  // Build request body for Printful
  const body = {
    shipping: 'STANDARD',
    recipient: {
      country_code: country_code ?? 'US',
      // For US make sure you include state_code, city, zip, address1 if needed:
      state_code: 'TX',
      city: 'Austin',
      zip: '78701',
      address1: '123 Test St'
    },
    items: [
      {
        variant_id: Number(variant_id),
        quantity: 1
        // add files/options if required by the product
      }
    ]
  };

  try {
    const apiRes = await fetch('https://api.printful.com/orders/estimate-costs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID ?? '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await apiRes.text();
    if (!text) {
      return res.status(apiRes.status).json({ error: 'Empty response from Printful' });
    }

    const json = JSON.parse(text);

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: json });
    }

    console.log('^^^')
    console.log(json)
    console.log('^^^')

    return res.status(200).json({ costs: json.result?.costs });
  } catch (err) {
    console.error('Error calling Printful API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
