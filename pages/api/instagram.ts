// pages/api/instagram.js
import { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.IG_ACCESS_TOKEN ?? "";

  try {
    let allVideos: Video[] = [];
    let nextPageCursor: string | undefined = undefined;

    // Fetch videos from the Facebook Page, paging
    do {
      const afterParam: string = nextPageCursor
        ? `&after=${encodeURIComponent(nextPageCursor)}`
        : "";
      const url = `https://graph.instagram.com/v23.0/me/media?fields=id,media_type,media_product_type,permalink,timestamp,comments_count,like_count,insights.metric(views)&access_token=${encodeURIComponent(apiKey)}${afterParam}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log('===');
      console.log(data);
      console.log('===');

      if (data.error) {
        if (data.error.message && data.error.message.includes("converted to a business account")) {
          break;
        }
        throw new Error(data.error.message || "Instagram API error");
      }

      if (!Array.isArray(data.data)) {
        throw new Error("Unexpected response format: data.data is not an array");
      }

      const batch: Video[] = data.data
      .map((video: Video) => ({
        id: video.id,
        timestamp: video.timestamp,
        permalink: video.permalink,
        videoId: video.id.includes("_") ? video.id.split("_")[1] : video.id,
        viewCount: video.insights
          ? video.insights.data[0].values[0].value
          : -1,
        error: null,
      }))

      allVideos = allVideos.concat(batch);

      nextPageCursor = data.paging?.cursors?.after;
    } while (nextPageCursor);

    return res.status(200).json({ videos: allVideos });
  } catch (err) {
    console.error("Error in /api/insta/videos:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}