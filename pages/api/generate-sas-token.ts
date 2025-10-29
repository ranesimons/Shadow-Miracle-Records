// pages/api/generate-sas-token.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient, StorageSharedKeyCredential, ContainerSASPermissions, generateBlobSASQueryParameters } from '@azure/storage-blob';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'File name and type are required' });
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';
    const containerName = 'uploads';

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = fileName;
    const permissions = new ContainerSASPermissions();
    permissions.write = true;
    permissions.create = true;
    permissions.read = true;

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiry
      },
      sharedKeyCredential
    ).toString();

    const uploadUrl = `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;

    return res.status(200).json({ uploadUrl });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
