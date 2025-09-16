// pages/api/youtube.js
import { NextApiRequest, NextApiResponse } from 'next';

interface PlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    resourceId: {
      videoId: string;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  try {
  let allTheItems: PlaylistItem[] = [];
  let nextPageToken = '';
  
  while (nextPageToken !== undefined) {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=UUbBOtAD5-8yfuvUUXsO1lRw&key=${apiKey}&pageToken=${nextPageToken}`
    );
    const data = await response.json();
    allTheItems = [...allTheItems, ...data.items];
    nextPageToken = data.nextPageToken;
  }

    console.log('???');
    console.log(allTheItems);
    console.log('???');

    const stuff = [];
    for (const i of allTheItems) {
      const responses = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${i.snippet.resourceId.videoId}&key=${apiKey}`
      );
      const datas = await responses.json();
      const hmm = {
        videoId: i.id,
        realVideoId: i.snippet.resourceId.videoId,
        title: i.snippet.title,
        viewCount: datas.items[0].statistics.viewCount
      }
      stuff.push(hmm);
    }
    res.status(200).json({ viewCount: stuff });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
