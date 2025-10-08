import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function uploadToTikTok(filePath: string, accessToken: string, openId: string) {
  const videoFile = fs.createReadStream(filePath);
  const formData = new FormData();
//   formData.append('video', videoFile);

  const response = await fetch(`https://open-api.tiktok.com/share/video/upload/?access_token=${accessToken}&open_id=${openId}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
//   if (data.code !== 0) {
//     throw new Error(`TikTok upload failed: ${data.message}`);
//   }

  return data;
}
