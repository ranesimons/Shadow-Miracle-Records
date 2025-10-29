import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files, File } from 'formidable';
import fs from 'fs';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: 'https://ik.imagekit.io/f5ayrcdvt',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB (adjust as needed)

interface ParsedFields {
  [key: string]: string | string[] | undefined;
}

interface ParsedFiles {
  [key: string]: File | File[] | undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({
    maxFileSize: MAX_VIDEO_BYTES,
    keepExtensions: true,
  });

  form.parse(
    req,
    async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        const message = err.message ?? '';
        if (message.includes('maxFileSize')) {
          return res.status(400).json({
            error: `File size exceeds the allowed limit of ${MAX_VIDEO_BYTES} bytes`,
          });
        }
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      const parsedFields = fields as ParsedFields;
      const parsedFiles = files as ParsedFiles;

      const maybeVideo = parsedFiles.video;
      if (!maybeVideo) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const videoFile: File = Array.isArray(maybeVideo) ? maybeVideo[0] : maybeVideo;
      const fileSize = videoFile.size ?? 0;

      if (fileSize > MAX_VIDEO_BYTES) {
        return res.status(400).json({
          error: `Uploaded file size (${fileSize} bytes) exceeds the allowed limit of ${MAX_VIDEO_BYTES} bytes`,
        });
      }

      const filePath = videoFile.filepath;
      const fileName = videoFile.originalFilename ?? 'upload_video';

      try {
        const fileBuffer = fs.readFileSync(filePath);
        const uploadResponse = await imagekit.upload({
          file: fileBuffer,
          fileName,
          folder: '/uploads/videos',
          isPrivateFile: false,
        });

        return res.status(200).json({ url: uploadResponse.url });
      } catch (uploadError: unknown) {
        console.error('Upload error:', uploadError);
        const errorMessage =
          uploadError instanceof Error
            ? uploadError.message
            : String(uploadError);
        return res.status(500).json({
          error: 'Failed to upload video',
          details: errorMessage,
        });
      } finally {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn('Cleanup error (ignoring):', cleanupError);
        }
      }
    }
  );
}
