// pages/api/charts.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "../../lib/db";

type Entry = {
  artist: string;
  song: string;
  position: number;
};

type WeekWithEntries = {
  date: string;
  entries: Entry[];
};

type ChartWithWeeks = {
  chart: string;
  dates: WeekWithEntries[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChartWithWeeks[] | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Pull all rows sorted
    const rows = await sql`
      SELECT
        chart,
        date,
        artist,
        song,
        position
      FROM public.billboards
      ORDER BY chart, date DESC, position;
    `;

    console.log('???')
    console.log(rows)
    console.log('???')

    // Nest by chart → week → entries
    const chartMap: Record<string, Record<string, Entry[]>> = {};

    for (const row of rows) {
      if (!chartMap[row.chart]) {
        chartMap[row.chart] = {};
      }
      if (!chartMap[row.chart][row.date]) {
        chartMap[row.chart][row.date] = [];
      }

      chartMap[row.chart][row.date].push({
        artist: row.artist,
        song: row.song,
        position: row.position,
      });
    }

    const result: ChartWithWeeks[] = Object.entries(chartMap).map(
      ([chart, weeksObj]) => ({
        chart,
        dates: Object.entries(weeksObj).map(([date, entries]) => ({
          date,
          entries,
        })),
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch charts" });
  }
}
