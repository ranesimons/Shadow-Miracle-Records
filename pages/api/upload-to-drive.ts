// pages/api/upload-to-drive.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile, Files, Fields } from 'formidable';
import fs from 'fs';
import { google } from 'googleapis';

export const config = {
  api: {
    bodyParser: false,  // disable Next.js’s default body parser
    // (optionally: increase sizeLimit if expecting large files)
  },
};

type UploadResponse = {
  fileId: string;
  link: string;
} | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Wrap parse in a Promise so we can async/await
  const { fields, files } = await new Promise<{
    fields: Fields;
    files: Files;
  }>((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
      // optionally: set uploadDir, maxFileSize, etc
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  // Access the uploaded file
  // Note: `files.file` may be undefined or a single File or an array
  const fileField = files.file;
  if (!fileField) {
    return res.status(400).json({ error: 'No file uploaded under field name "file"' });
  }

  // Normalize to a single file
  const uploadFile: FormidableFile =
    Array.isArray(fileField) ? fileField[0] : fileField;

  // Optionally: you can read metadata from `fields`, e.g. a custom filename
  const fileNameFromClient = typeof fields.fileName === 'string'
    ? fields.fileName
    : uploadFile.originalFilename ?? 'upload';

  // Use googleapis to upload to Drive
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const media = {
    mimeType: uploadFile.mimetype || undefined,
    body: fs.createReadStream(uploadFile.filepath),
  };

  try {
    const driveResp = await drive.files.create({
      requestBody: { name: fileNameFromClient },
      media,
      fields: 'id, webViewLink',
    });

    return res.status(200).json({
      fileId: driveResp.data.id!,
      link: driveResp.data.webViewLink!,
    });
  } catch (err) {
    console.error('Error uploading to Google Drive:', err);
    return res.status(500).json({ error: 'Google Drive upload failed' });
  }
}
