import fetch from 'node-fetch';
import fs from 'fs';
// import FormData from 'form-data';

async function uploadToFacebook(pageId: string, accessToken: string, filePath: string) {
  const videoFile = fs.createReadStream(filePath);
  const form = new FormData();
//   form.append('source', videoFile);
  form.append('access_token', accessToken);

  const response = await fetch(`https://graph-video.facebook.com/v14.0/${pageId}/videos`, {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
//   if (data.error) {
//     throw new Error(`Facebook upload failed: ${data.error.message}`);
//   }

  return data;
}
