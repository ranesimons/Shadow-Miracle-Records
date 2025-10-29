// components/VideoUpload.tsx

'use client';

import { useState } from 'react';

export default function VideoUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    try {
      // Step 1: Get SAS URL from your server
      const response = await fetch('/api/generate-sas-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: videoFile.name,
          fileType: videoFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get SAS URL');
      }

      const { uploadUrl } = await response.json();

      // Step 2: Upload the file directly to Azure Blob Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': videoFile.type,
        },
        body: videoFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      // Step 3: Set the video URL
      setVideoUrl(uploadUrl.split('?')[0]);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Video</button>
      {videoUrl && (
        <div>
          <p>Video uploaded successfully!</p>
          <video controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
