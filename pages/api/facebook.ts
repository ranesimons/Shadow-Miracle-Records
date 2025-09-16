import { NextApiRequest, NextApiResponse } from "next";

interface Video {
  id: string;
  title: string;
  videoId: string;
  viewCount: number;
  error: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = '1389669548028513';

  if (!accessToken || !pageId) {
    return res
      .status(400)
      .json({ error: "Missing Facebook Access Token or Page ID" });
  }

  try {
    let allVideos: Video[] = [];
    let nextPageToken = "";

    // Fetch videos from the Facebook Page
    while (nextPageToken !== undefined) {
      const response = await fetch(
        `https://graph.facebook.com/v12.0/${pageId}/videos?access_token=${accessToken}&after=${nextPageToken}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const videos = data.data.map((video: Video) => ({
        id: video.id,
        title: video.title,
        videoId: video.id.split("_")[1],
        viewCount: 0,
        error: null,
      }));

      allVideos = [...allVideos, ...videos];
      nextPageToken = data.paging?.cursors?.after;
    }

    console.log('???')
    console.log(allVideos)
    console.log('???')

    // Fetch view counts for each video
    for (const video of allVideos) {
      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v12.0/${video.id}/video_insights?metric=total_video_impressions&access_token=${accessToken}`
        );
        const insightsData = await insightsResponse.json();

        if (insightsData.error) {
          throw new Error(insightsData.error.message);
        }

        video.viewCount = insightsData.data[0]?.values[0]?.value || 0;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    }

    res.status(200).json({ videos: allVideos });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
