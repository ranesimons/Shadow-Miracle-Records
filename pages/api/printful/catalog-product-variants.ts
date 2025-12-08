// pages/api/printful/catalog-product-variants.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface PrintfulVariant {
  id: number;
  catalog_product_id: number;
  // add other fields you expect from Printful variant endpoint
  size?: string;
  color?: string;
  // ... etc
}

interface ApiResponse {
  variants: PrintfulVariant[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const productId = req.query.product_id;
  const token = process.env.PRINTFUL_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Missing PRINTFUL_API_TOKEN environment variable' });
  }

  if (!productId) {
    return res.status(400).json({ error: 'Missing product_id query parameter' });
  }

  const pid = Array.isArray(productId) ? productId[0] : productId;

  const url = `https://api.printful.com/v2/catalog-products/${encodeURIComponent(
    pid
  )}/catalog-variants`;

  try {
    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error('Printful variants API error', apiRes.status, text);
      return res.status(apiRes.status).json({ error: 'Failed to fetch variants from Printful' });
    }

    const body = await apiRes.json();

    // Printful returns e.g. { "data": [ { variant... }, ... ] }
    // Adjust depending on what Printful actually returns
    const variants = Array.isArray(body.data) ? (body.data as PrintfulVariant[]) : [];

    console.log('@@@')
    console.log(variants)
    console.log('@@@')

    return res.status(200).json({ variants });
  } catch (err) {
    console.error('Error fetching variants', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
