// pages/api/upload-video.ts
import { NextApiRequest, NextApiResponse } from "next";
import { sql } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { year, month, day, fileName, blobUrl } = req.body;
    if (!year || !month || !day || !fileName || !blobUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const record = {
        year,
        month,
        day,
        fileName,
        blobUrl
    }

    await sql`
        INSERT INTO public.reels (year, month, day, file_name, blob_url)
        VALUES (${year}, ${month}, ${day}, ${fileName}, ${blobUrl})
        ON CONFLICT (year, month, day)
        DO UPDATE SET
            file_name = EXCLUDED.file_name,
            blob_url = EXCLUDED.blob_url
        RETURNING year, month, day, file_name, blob_url;
    `;

    return res.status(200).json({ record });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred";
    console.error(err);
    return res.status(500).json({ error: message });
  }
}
