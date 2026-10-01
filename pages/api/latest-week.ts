import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

type ResponseData = { week: string } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const chart = (req.method === 'POST' ? req.body?.chart : req.query.chart) as string | undefined;

  if (!chart || typeof chart !== 'string') {
    return res.status(400).json({ error: 'Missing chart name' });
  }

  const rows = (await sql`
    SELECT MAX(date)::text AS week
    FROM public.billboards
    WHERE chart = ${chart}
  `) as { week: string }[];

  const week = rows[0]?.week;
  if (!week) {
    return res.status(404).json({ error: `No data found for chart: ${chart}` });
  }

  return res.status(200).json({ week });
}
