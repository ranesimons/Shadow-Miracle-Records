// src/pages/api/publish.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { publishInstagramReel } from '../../lib/instagram';
import { publishYouTubeVideo } from '../../lib/youtube';
// import { scheduleJob } from '../../lib/scheduler';

interface PublishResult {
  instagram?: unknown;
  youtube?: void;
}

interface PublishRequestBody {
  platforms: string[];
  caption: string;
  videoPath: string;
  scheduledTime?: string;
  youtubeTitle: string;
  youtubeDesc: string;
  igUserId?: string;
  youtubeUserId?: string;
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST' });
  }
  const { platforms, caption, videoPath, scheduledTime, youtubeTitle, youtubeDesc }: PublishRequestBody = req.body;

  // For immediate or scheduled
  if (scheduledTime) {
    // schedule for later
    // await scheduleJob({
    //   platforms,
    //   caption,
    //   videoPath,
    //   youtubeTitle,
    //   youtubeDesc,
    //   scheduledTime: new Date(scheduledTime),
    // });
    return res.status(200).json({ status: 'scheduled' });
  } else {
    // execute immediately
    const results: PublishResult = {};
    for (const platform of platforms) {
      try {
        if (platform === 'instagram') {
          results.instagram = await publishInstagramReel({
            igUserId: req.body.igUserId,
            caption,
            videoUrl: videoPath,
          });
        }
        if (platform === 'youtube') {
          results.youtube = await publishYouTubeVideo({
            userId: req.body.youtubeUserId,
            videoFilePath: videoPath,
            title: youtubeTitle,
            description: youtubeDesc,
          });
        }
        // add facebook, tiktok, twitter logic...
      } catch (err: unknown) {
        console.log('exception')
     }
    }
    res.status(200).json({ results });
  }
}
