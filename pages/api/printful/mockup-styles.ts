import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query;
  const PRINTFUL_TOKEN = process.env.PRINTFUL_API_TOKEN!;
  const resp = await fetch(
    `https://api.printful.com/v2/catalog-products/${productId}/mockup-styles`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${PRINTFUL_TOKEN}` },
    }
  );
  const data = await resp.json();
  res.status(resp.status).json(data);
}
