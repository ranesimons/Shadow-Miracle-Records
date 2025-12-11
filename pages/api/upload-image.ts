// pages/api/upload-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { put } from '@vercel/blob';
import fs from 'fs';

export const config = {
  api: { bodyParser: false },  // disable built-in parser
};

type BlobResponse = Awaited<ReturnType<typeof put>>;
type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlobResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'Error parsing the form' });
    }

    // Assume your file input field is named "file"
    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // formidable may produce single file or array — handle both
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    // Read the file from its temp filepath
    try {
      const fileBuffer = fs.readFileSync((file as FormidableFile).filepath);
      const originalFilename = (file as FormidableFile).originalFilename || `upload-${Date.now()}`;

      const blob = await put(originalFilename, fileBuffer, {
        access: 'public',
        addRandomSuffix: true,
        // optionally: contentType: (file as FormidableFile).mimetype
      });

      return res.status(200).json(blob);
    } catch (e) {
      console.error('Blob upload error:', e);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
