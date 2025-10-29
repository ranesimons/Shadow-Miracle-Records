// components/VideoUploadByDay.tsx

'use client';

import { useState } from 'react';

type UploadState = {
  file: File | null;
  uploading: boolean;
  uploadedUrl: string;
  error: string | null;
};

export default function VideoUploadByDay() {
  const [states, setStates] = useState<UploadState[]>(
    () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // zero-based
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, () => ({
        file: null,
        uploading: false,
        uploadedUrl: '',
        error: null,
      }));
    }
  );

  const handleFileChange = (dayIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setStates(prev => {
        const copy = [...prev];
        copy[dayIndex] = { ...copy[dayIndex], file };
        return copy;
      });
    }
  };

  const handleUpload = (dayIndex: number) => async () => {
    const state = states[dayIndex];
    if (!state.file) {
      alert(`Please select a video file for day ${dayIndex + 1}`);
      return;
    }

    setStates(prev => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], uploading: true, error: null };
      return copy;
    });

    try {
      const file = state.file;
      // Step 1: Get SAS URL from your server
      const response = await fetch('/api/generate-sas-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: `day${dayIndex + 1}_${file.name}`,
          fileType: file.type,
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
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const blobUrl = uploadUrl.split('?')[0];

      // Step 3: Set the video URL
      setStates(prev => {
        const copy = [...prev];
        copy[dayIndex] = {
          ...copy[dayIndex],
          uploading: false,
          uploadedUrl: blobUrl,
          file: null,
        };
        return copy;
      });
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      setStates(prev => {
        const copy = [...prev];
        copy[dayIndex] = {
          ...copy[dayIndex],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
        return copy;
      });
    }
  };

  return (
    <div>
      <h1>Upload Video by Day of Month</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
        {states.map((state, idx) => {
          const day = idx + 1;
          return (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '8px' }}>
              <p><strong>Day {day}</strong></p>
              {state.uploadedUrl ? (
                <div>
                  <p>Uploaded!</p>
                  <video width={160} controls>
                    <source src={state.uploadedUrl} type="video/mp4" />
                    Your browser doesn’t support this tag.
                  </video>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange(idx)}
                    disabled={state.uploading}
                  />
                  <button onClick={handleUpload(idx)} disabled={state.uploading}>
                    {state.uploading ? `Uploading…` : `Upload Day ${day}`}
                  </button>
                  {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
