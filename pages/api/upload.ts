// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import mime from 'mime-types';
import { promises as fs } from 'fs';

interface UploadedFile {
  filepath: string;
  originalFilename?: string;
  mimetype: string;
  size: number;
}


export const config = {
  api: {
    bodyParser: false,
  }
};

// parse with formidable
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: { video: UploadedFile } }> {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
    //   else resolve({ fields, files: { video: files.video as UploadedFile } });
    });
  });
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});
const BUCKET = process.env.S3_BUCKET_NAME!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const videoFile = files.video;
    if (!videoFile) {
      return res.status(400).json({ error: 'No file uploaded ("video" field missing)' });
    }

    const filePath = videoFile.filepath;
    const origName = videoFile.originalFilename || 'upload';
    const ext = origName.split('.').pop();
    const safeName = `${Date.now()}_${origName.replace(/\s+/g, '_')}`;
    // const contentType = mime.lookup(ext || '') || 'application/octet-stream';

    // Read the file into buffer
    const data = await fs.readFile(filePath);

    // Upload to S3
    const putCmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `videos/${safeName}`,
      Body: data,
    //   ContentType: contentType,
      ACL: 'public-read',  // or private if you want to serve via signed URLs
    });

    await s3.send(putCmd);

    const s3Url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${safeName}`;

    return res.status(200).json({ success: true, url: s3Url });
  } catch (err: unknown) {
    console.error('Upload error:');
    return res.status(500).json({ error: 'Upload failed'});
  }
}
