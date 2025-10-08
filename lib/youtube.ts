// import { google } from 'googleapis';

interface PublishVideoParams {
  userId: string;
  title: string;
  description: string;
  tags?: string[];
  videoFilePath: string;
  scheduledDate?: Date;
}

interface VideoRequestBody {
  snippet: {
    title: string;
    description: string;
    tags: string[];
  };
  status: {
    privacyStatus: 'private' | 'public' | 'unlisted';
    publishAt?: string;
  };
}



export async function publishYouTubeVideo({
  userId,
  title,
  description,
  tags = [],
  videoFilePath,
  scheduledDate,
}: PublishVideoParams) {
  const oauth2Client = process.env.YOUTUBE_API_KEY;
//   const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const requestBody: VideoRequestBody = {
    snippet: {
      title,
      description,
      tags,
    },
    status: {
      privacyStatus: scheduledDate ? 'private' : 'public',
    },
  };

  if (scheduledDate) {
    requestBody.status.publishAt = scheduledDate.toISOString();
  }

//   const res = await youtube.videos.insert({
//     part: ['snippet', 'status'],
//     requestBody,
//     media: {
//       body: fs.createReadStream(videoFilePath),
//     },
//   });

//   return res.data;
}
