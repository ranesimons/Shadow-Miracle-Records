import fetch from 'node-fetch';

async function uploadToTwitter(mediaData: Buffer, accessToken: string, accessTokenSecret: string) {
  // Step 1: Initialize upload
  const initResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': `OAuth oauth_token=${accessToken}`,
    },
    body: new URLSearchParams({
      command: 'INIT',
      media_type: 'video/mp4',
      total_bytes: mediaData.length.toString(),
    }),
  });

  const initData = await initResponse.json();
//   const mediaId = initData.media_id_string;

  // Step 2: Append video chunks
  const chunkSize = 5 * 1024 * 1024; // 5MB
  for (let i = 0; i < mediaData.length; i += chunkSize) {
    const chunk = mediaData.slice(i, i + chunkSize);
    const appendResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `OAuth oauth_token=${accessToken}`,
      },
      body: new URLSearchParams({
        command: 'APPEND',
        // media_id: mediaId,
        media: chunk.toString('base64'),
        segment_index: (i / chunkSize).toString(),
      }),
    });

    const appendData = await appendResponse.json();
    // if (appendData.error) {
    //   throw new Error(`Twitter upload failed: ${appendData.error}`);
    // }
  }

  // Step 3: Finalize upload
  const finalizeResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': `OAuth oauth_token=${accessToken}`,
    },
    body: new URLSearchParams({
      command: 'FINALIZE',
    //   media_id: mediaId,
    }),
  });

  const finalizeData = await finalizeResponse.json();
//   if (finalizeData.error) {
//     throw new Error(`Twitter upload failed: ${finalizeData.error}`);
//   }

  // Step 4: Create Tweet with video
  const tweetResponse = await fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: 'POST',
    headers: {
      'Authorization': `OAuth oauth_token=${accessToken}`,
    },
    body: new URLSearchParams({
      status: 'Check out this video!',
    //   media_ids: mediaId,
    }),
  });

  const tweetData = await tweetResponse.json();
//   if (tweetData.error) {
//     throw new Error(`Twitter tweet creation failed: ${tweetData.error}`);
//   }

  return tweetData;
}
