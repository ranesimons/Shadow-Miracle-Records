// pages/api/printful/catalog-products.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type PrintfulCatalogProduct = {
  id: number;
  main_category_id: number;
  type: string;
  type_name?: string;
  title: string;
  brand?: string;
  model?: string;
  variant_count: number;
  // optionally include other fields you care about
};

type ApiResponse = {
  products: PrintfulCatalogProduct[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category_id } = req.query;
  const token = process.env.PRINTFUL_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Missing PRINTFUL_API_TOKEN environment variable' });
  }

  const url = new URL('https://api.printful.com/v2/catalog-products');
  if (category_id) {
    url.searchParams.set('category_ids', String(category_id));
  }

  try {
    const apiRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error('Printful API error', apiRes.status, text);
      return res.status(apiRes.status).json({ error: 'Failed to fetch from Printful' });
    }

    const body = await apiRes.json();
    const products = (body.data ?? []) as PrintfulCatalogProduct[];

    console.log('!!!')
    console.log(products)
    console.log('!!!')

    return res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
