// pages/api/videos-by-day.ts
import { NextApiRequest, NextApiResponse } from "next";
import { sql } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: "Missing query params" });
    }

    const uploads = await sql`
        SELECT * FROM public.reels
        WHERE month = ${month} and year = ${year};
    `;

    return res.status(200).json({ uploads });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred";
    console.error(err);
    return res.status(500).json({ error: message });
  }
}
