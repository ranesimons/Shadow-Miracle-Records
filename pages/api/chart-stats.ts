import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

export type WeekStat = {
  date: string;
  total: number;
  new_songs: number;
  returning_songs: number;
};

export type ResponseData = { chart: string; weeks: WeekStat[] } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const chart = (req.query.chart ?? 'Hot-100') as string;

  try {
    const rows = (await sql`
      WITH first_appearances AS (
        SELECT chart, song, artist, MIN(date) AS first_date
        FROM public.billboards
        GROUP BY chart, song, artist
      )
      SELECT
        b.date::text                                                          AS date,
        COUNT(*)::int                                                         AS total,
        COUNT(CASE WHEN b.date = fa.first_date THEN 1 END)::int              AS new_songs,
        COUNT(CASE WHEN b.date > fa.first_date THEN 1 END)::int              AS returning_songs
      FROM public.billboards b
      JOIN first_appearances fa
        ON fa.chart = b.chart AND fa.song = b.song AND fa.artist = b.artist
      WHERE b.chart = ${chart}
      GROUP BY b.date
      ORDER BY b.date
    `) as WeekStat[];

    res.status(200).json({ chart, weeks: rows });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'DB error' });
  }
}
