// pages/api/video-proxy.ts
// Streams an Azure blob through our verified domain so TikTok's PULL_FROM_URL works.

import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { blob } = req.query;
  if (!blob || typeof blob !== 'string') {
    return res.status(400).end('Missing blob parameter');
  }

  const blobBaseUrl = decodeURIComponent(blob);

  const blobUrlParsed = new URL(blobBaseUrl);
  const pathParts = blobUrlParsed.pathname.split('/').filter(Boolean);
  const containerName = pathParts[0];
  const blobFileName = pathParts.slice(1).join('/');

  const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    process.env.AZURE_STORAGE_ACCOUNT_KEY!
  );
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: blobFileName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    sharedKeyCredential
  ).toString();

  const azureUrl = `${blobBaseUrl}?${sasToken}`;
  const upstream = await fetch(azureUrl);

  if (!upstream.ok) {
    return res.status(upstream.status).end('Failed to fetch from Azure');
  }

  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'video/mp4');
  const cl = upstream.headers.get('content-length');
  if (cl) res.setHeader('Content-Length', cl);
  res.setHeader('Cache-Control', 'no-store');

  upstream.body?.pipe(res);
}
