// pages/api/fb/videos.ts

import type { NextApiRequest, NextApiResponse } from "next";

interface Value {
  value: number;
}

interface Insights {
  name: string;
  period: string;
  values: Value[];
  title: number;
  description: string;
  id: string;
}

interface Vdata {
  data: Insights[];
}

interface Video {
  id: string;
  created_time: string;
  title: string;
  videoId: string;
  viewCount: number;
  video_insights: Vdata;
  error: string | null;
}

interface ResponseData {
  videos?: Video[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Extract token from body
  const { access_token } = req.body as { access_token?: string };

  const pageId = "1389669548028513";  

  console.log('@@@');
  console.log(access_token);
  console.log('@@@');

  if (!access_token || typeof access_token !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid Facebook Access Token" });
  }
  if (!pageId) {
    return res
      .status(400)
      .json({ error: "Missing Facebook Page ID" });
  }

  try {
    let allVideos: Video[] = [];
    let nextPageCursor: string | undefined = undefined;

    // Fetch videos from the Facebook Page, paging
    do {
      const afterParam: string = nextPageCursor
        ? `&after=${encodeURIComponent(nextPageCursor)}`
        : "";
      const url = `https://graph.facebook.com/v23.0/1389669548028513/videos?fields=id,created_time,title,video_insights.metric(fb_reels_total_plays)&access_token=${encodeURIComponent(access_token)}${afterParam}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log('===');
      console.log(data);
      console.log('===');

      if (data.error) {
        throw new Error(data.error.message || "Facebook API error");
      }

      if (!Array.isArray(data.data)) {
        throw new Error("Unexpected response format: data.data is not an array");
      }

      const batch: Video[] = data.data.map((video: Video) => ({
        id: video.id,
        createdTime: video.created_time,
        title: video.title ?? "",
        videoId: video.id.includes("_") ? video.id.split("_")[1] : video.id,
        viewCount: video.video_insights ? video.video_insights.data[0].values[0].value : 0,
        error: null,
      }));

      allVideos = allVideos.concat(batch);

      nextPageCursor = data.paging?.cursors?.after;
    } while (nextPageCursor);

    return res.status(200).json({ videos: allVideos });
  } catch (err) {
    console.error("Error in /api/fb/videos:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
}
