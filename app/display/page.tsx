// components/VideoUploadByDay.tsx

'use client';

import { useState, useEffect, ChangeEvent } from 'react';

type UploadState = {
  file: File | null;
  uploading: boolean;
  uploadedUrl: string;
  error: string | null;
};

interface UploadMetadata {
  day: number;
  blob_url: string;
}

interface FetchUploadsResponse {
  uploads: UploadMetadata[];
}

export default function VideoUploadByDay({}) {
  const [uploadingToYoutube, setUploadingToYoutube] = useState(false);
  const [uploadingToTiktok, setUploadingToTiktok] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const monthZeroBased = today.getMonth();
  const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();

  const [states, setStates] = useState<UploadState[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        file: null,
        uploading: false,
        uploadedUrl: '',
        error: null,
      }))
  );

  useEffect(() => {
    async function fetchExisting() {
      try {
        const resp = await fetch(
          `/api/videos-by-day?year=${year}&month=${monthZeroBased + 1}`
        );
        if (!resp.ok) {
          throw new Error('Failed to fetch existing uploads');
        }
        const data: FetchUploadsResponse = await resp.json();

        setStates((prevStates) => {
          const copy = [...prevStates];
          data.uploads.forEach(({ day, blob_url }) => {
            const idx = day - 1;
            console.log('!!!');
            console.log(day);
            console.log(blob_url);
            console.log(idx);
            console.log(copy.length);
            console.log('!!!');
            if (idx >= 0 && idx < copy.length) {
              const prev = copy[idx];
              copy[idx] = {
                file: prev.file,
                uploading: false,
                uploadedUrl: blob_url,
                error: null,
              };
            }
          });
          return copy;
        });
        console.log('???');
        console.log(states);
        console.log('???');
      } catch (err) {
        console.error('Error loading existing uploads:', err);
      }
    }

    fetchExisting();
  }, [year, monthZeroBased]);

  const handleFileChange = (dayIndex: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setStates((prev) => {
        const copy = [...prev];
        const prevState = copy[dayIndex];
        copy[dayIndex] = {
          ...prevState,
          file,
        };
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

    setStates((prev) => {
      const copy = [...prev];
      const prevState = copy[dayIndex];
      copy[dayIndex] = {
        ...prevState,
        uploading: true,
        error: null,
      };
      return copy;
    });

    try {
      const { file } = state;
      const fileName = `year${year}_month${monthZeroBased + 1}_day${dayIndex + 1}_${file.name}`;

      // Step 1: Get SAS URL
      const sasResp = await fetch('/api/generate-sas-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: file.type,
        }),
      });
      if (!sasResp.ok) {
        throw new Error('Failed to get SAS URL');
      }
      const { uploadUrl }: { uploadUrl: string } = await sasResp.json();

      // Step 2: Upload the file to Azure Blob
      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
        body: file,
      });
      if (!uploadResp.ok) {
        throw new Error('Failed to upload video');
      }

      const blobUrl = uploadUrl.split('?')[0];

      // Step 3: Save metadata to backend
      const saveResp = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month: monthZeroBased + 1,
          day: dayIndex + 1,
          fileName,
          blobUrl,
        }),
      });
      if (!saveResp.ok) {
        throw new Error('Failed to save upload metadata');
      }

      // Step 4: Update local state
      setStates((prev) => {
        const copy = [...prev];
        copy[dayIndex] = {
          file: null,
          uploading: false,
          uploadedUrl: blobUrl,
          error: null,
        };
        return copy;
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setStates((prev) => {
        const copy = [...prev];
        const prevState = copy[dayIndex];
        copy[dayIndex] = {
          ...prevState,
          uploading: false,
          error: errorMessage,
        };
        return copy;
      });
    }
  };

  const handleUploadToYouTube = async (blobName: string) => {
    if (!blobName) {
    //   setError('Please provide all required fields');
      console.log('Please provide all required fields')
      return;
    }

    console.log('&&&');
    console.log(blobName);
    console.log('&&&');

    setUploadingToYoutube(true);
    // setError(null);

    try {
      const response = await fetch('/api/upload-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to YouTube');
      }

      alert('Video uploaded successfully');
    } catch (err) {
    //   setError(err instanceof Error ? err.message : 'An error occurred');
        console.log(err)
    } finally {
      setUploadingToYoutube(false);
    }
  };

  const handleUploadToTikTok = async (blobName: string) => {
    if (!blobName) {
    //   setError('Please provide all required fields');
      console.log('Please provide all required fields')
      return;
    }

    console.log('&&&');
    console.log(blobName);
    console.log('&&&');

    setUploadingToTiktok(true);
    // setError(null);

    try {
      const response = await fetch('/api/upload-tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to TikTok');
      }

      alert('Video uploaded successfully');
    } catch (err) {
    //   setError(err instanceof Error ? err.message : 'An error occurred');
        console.log(err)
    } finally {
      setUploadingToTiktok(false);
    }
  };

  return (
    <div>
      <h1>
        Upload Video by Day of Month — {year}-{(monthZeroBased + 1).toString().padStart(2, '0')}
      </h1>
      {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '12px' }}>
        {states.map((state, idx) => {
          const day = idx + 1;
          return (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '8px' }}>
              <p>
                <strong>Day {day}</strong>
              </p>
              {state.uploadedUrl ? (
                <div>
                  <p>Uploaded!</p>
                  <video width={160} controls>
                    <source src={state.uploadedUrl} type="video/mp4" />
                    Your browser doesn’t support this tag.
                  </video>
                  <p>
                    <a href={state.uploadedUrl} target="_blank" rel="noreferrer">
                      Open video
                    </a>
                    <div>
                        <button onClick={() => handleUploadToYouTube(state.uploadedUrl)} disabled={uploadingToYoutube}>
                            {uploadingToYoutube ? 'Uploading...' : 'Upload to YouTube'}
                        </button>
                        <button onClick={() => handleUploadToTikTok(state.uploadedUrl)} disabled={uploadingToTiktok}>
                            {uploadingToTiktok ? 'Uploading...' : 'Upload to TikTok'}
                        </button>
                    </div>
                  </p>
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
      </div> */}
    </div>
  );
}
