// pages/api/youtube.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=UUbBOtAD5-8yfuvUUXsO1lRw&key=${apiKey}`
    );
    const data = await response.json();

    console.log('???');
    console.log(data);
    console.log('???');

    const stuff = [];
    for (const i of data.items) {
      const responses = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${i.snippet.resourceId.videoId}&key=${apiKey}`
      );
      const datas = await responses.json();
      const hmm = {
        videoId: i.id,
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
