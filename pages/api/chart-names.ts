import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ charts: string[] } | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const rows = await sql`SELECT DISTINCT chart FROM public.billboards ORDER BY chart`;
    res.status(200).json({ charts: rows.map((r) => r.chart as string) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chart names' });
  }
}
