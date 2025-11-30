// pages/api/upload-to-drive.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { google } from 'googleapis';

export const config = {
  api: {
    bodyParser: false,  // we’ll use formidable
    sizeLimit: 1024 * 1024 * 1024 * 2, // e.g. 2 GB limit (adjust as needed)
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  const { files, fields } = await new Promise<{ files: formidable.Files; fields: any }>((resolve, reject) => {
    form.parse(req, (err, f, fi) => (err ? reject(err) : resolve({ files: f, fields: fi })));
  });

  const file = files.file as formidable.File;
  const fileName = (fields.fileName as string) || file.originalFilename || 'upload';

  // Authenticate using service account credentials JSON stored in env
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  // Create a read stream from the temp file
  const media = {
    mimeType: file.mimetype || undefined,
    body: fs.createReadStream(file.filepath),
  };

  try {
    const driveResp = await drive.files.create({
      requestBody: {
        name: fileName,
        // optionally: parents: [FOLDER_ID],
      },
      media,
      fields: 'id, webViewLink', 
    });

    return res.status(200).json({
      fileId: driveResp.data.id,
      link: driveResp.data.webViewLink,
    });
  } catch (err) {
    console.error('Drive upload error:', err);
    return res.status(500).json({ error: 'Upload to Google Drive failed' });
  }
}

export default handler;
