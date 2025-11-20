// pages/api/tiktok/videos.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from '../../lib/db';

interface Video {
  id: string;
  create_time: number;
  title: string;
  embed_link: string;
  view_count: number;
  error: string | null;
}

interface ResponseData {
  videos?: Video[];
  error?: string;
}

interface VideoListResponse {
  data: {
    cursor: string | number | null;
    has_more: boolean;
    videos: Video[];
  };
  error?: {
    code: string | number | null;
    message: string;
    log_id: string | number | null;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { access_token } = req.body as { access_token?: string };

  if (!access_token || typeof access_token !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid TikTok Access Token" });
  }

  try {
    // let allVideos: Video[] = [];
    // let nextPageCursor: number | undefined = undefined;

    const allVideos: Video[] = [];
    let cursor: number | string | null = 0;

    do {
      const resp = await fetch("https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,title,embed_link,view_count", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({
          cursor: cursor,
          max_count: 10,
          fields: ["id", "create_time", "title", "embed_link", "view_count"]
        })
      });
      const json: VideoListResponse = await resp.json();

      // if (json.error) {
      //   throw new Error(json.error.message || "TikTok video list error");
      // }

      if (json.error) {
        const { code, message, log_id } = json.error;
        console.log('???');
        console.log(code);
        console.log(message);
        console.log(log_id);
        console.log('???');
        const errorMessage = `TikTok API Error: ${message} (Code: ${code}, Log ID: ${log_id})`;
        if (code !== 'ok') {
          throw new Error(errorMessage);
        }
      }

      const videoList = json.data.videos;
      allVideos.push(...videoList);

      console.log('---');
      console.log(json.data);
      console.log('---');

      console.log('===');
      console.log(videoList);
      console.log('===');

      const nextCursor = json.data.cursor;
      const hasMore = json.data.has_more;

      if (!hasMore || nextCursor === cursor) {
        // no more data or stuck cursor
        break;
      }
      cursor = nextCursor;
    } while (cursor)

    for (const i of allVideos) {
      await sql`
        UPDATE public.reels
        SET
          tiktok_video_views = ${i.view_count},
          tiktok_video_date = ${i.create_time}
        WHERE
          tiktok_video_id = ${i.id};
      `;
    }

    return res.status(200).json({ videos: allVideos });
  } catch (err) {
    console.error("Error in /api/tiktok/videos:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
