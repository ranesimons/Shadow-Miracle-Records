// // pages/api/instagram.js
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '../../lib/db';

interface Value {
  value: number;
}

interface Vdata {
  data: Insights[];
}

interface Video {
  id: string;
  media_type: string;
  media_product_type: string;
  permalink: string;
  timestamp: string;
  comments_count: number;
  like_count: number;
  insights: Vdata;
  error: string | null;
}

interface Insights {
  name: string;
  period: string;
  values: Value[];
  title: string;
  description: string;
  id: string;
}

interface Batch {
  id: string;
  timestamp: string;
  permalink: string;
  viewCount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.IG_ACCESS_TOKEN ?? "";
  const oEmbedUrl = 'https://api.instagram.com/oembed/';

  try {
    let allVideos: Batch[] = [];
    let nextPageCursor;

    do {
      const afterParam: string = nextPageCursor ? `&after=${encodeURIComponent(nextPageCursor)}` : '';
      const url = `https://graph.instagram.com/v23.0/me/media?fields=id,media_type,media_product_type,permalink,timestamp,comments_count,like_count,insights.metric(views)&access_token=${encodeURIComponent(apiKey)}${afterParam}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        if (data.error.message && data.error.message.includes("converted to a business account")) {
          break;
        }
        throw new Error(data.error.message || "Instagram API error");
      }

      if (!Array.isArray(data.data)) {
        throw new Error("Unexpected response format: data.data is not an array");
      }

      const batch = await Promise.all(data.data.map(async (video: Video) => {
        const permalink = video.permalink.replace(/\/$/, '');
        // const oEmbedResponse = await fetch(`${oEmbedUrl}?url=${encodeURIComponent(permalink)}&access_token=${encodeURIComponent(apiKey)}`);
        // console.log('}}}');
        // console.log(oEmbedResponse);
        // console.log('}}}');
        // const oEmbedData = await oEmbedResponse.json();

        // console.log('{{{');
        // console.log(oEmbedData);
        // console.log('{{{');

        return {
          id: video.id,
          timestamp: video.timestamp,
          permalink,
          viewCount: video.insights?.data[0]?.values[0]?.value || -1,
          // embedHtml: oEmbedData.html || null,
          embedHtml: null,
        };
      }));

      allVideos = allVideos.concat(batch);
      nextPageCursor = data.paging?.cursors?.after;
    } while (nextPageCursor);

    for (const i of allVideos) {
      await sql`
        UPDATE public.reels
        SET
          instagram_video_views = ${i.viewCount},
          instagram_video_date = ${i.timestamp}
        WHERE
          instagram_video_id = ${i.id};
      `;
    }
    return res.status(200).json({ videos: allVideos });
  } catch (err) {
    console.error("Error in /api/instagram:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}



// await sql`
//   INSERT INTO public.reels (title, youtube_video_id, youtube_video_date, youtube_video_views)
//   VALUES (${hmm.title}, ${hmm.videoId}, ${hmm.publishedAt}, ${hmm.viewCount})
//   ON CONFLICT (youtube_video_id)
//   DO UPDATE SET
//     title = EXCLUDED.title,
//     youtube_video_date = EXCLUDED.youtube_video_date,
//     youtube_video_views = EXCLUDED.youtube_video_views
//   RETURNING id, title, youtube_video_id, youtube_video_date, youtube_video_views;
// `;