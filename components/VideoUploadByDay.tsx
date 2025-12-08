// components/VideoUploadByDay.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";

import TikTokAuthButton from "@/components/TikTokAuthButton";

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

export default function VideoUploadByDay() {
  const today = new Date();
  const year = today.getFullYear();
  const monthZeroBased = today.getMonth();
  const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();
  const [uploadingToYoutube, setUploadingToYoutube] = useState(false);
  const [uploadingToTiktok, setUploadingToTiktok] = useState(false);
  const [uploadingToFacebook, setUploadingToFacebook] = useState(false);
  const [uploadingToInstagram, setUploadingToInstagram] = useState(false);
  const [uploadingToTwitter, setUploadingToTwitter] = useState(false);
  const [tiktokAuthToken, setTiktokAuthToken] = useState<string | null>(null);
  const [tiktokAuthError, setTiktokAuthError] = useState<string | null>(null);
  const [loadingTiktokAuth, setloadingTiktokAuth] = useState<boolean>(false);
  const [states, setStates] = useState<UploadState[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        file: null,
        uploading: false,
        uploadedUrl: "",
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
          throw new Error("Failed to fetch existing uploads");
        }
        const data: FetchUploadsResponse = await resp.json();

        setStates((prev) => {
          const copy = [...prev];
          data.uploads.forEach(({ day, blob_url }) => {
            const idx = day - 1;
            if (idx >= 0 && idx < copy.length) {
              copy[idx] = {
                file: copy[idx].file,
                uploading: false,
                uploadedUrl: blob_url,
                error: null,
              };
            }
          });
          return copy;
        });
      } catch (err) {
        console.error("Error loading existing uploads:", err);
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

    setStates((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], uploading: true, error: null };
      return copy;
    });

    try {
      const { file } = state;
      const fileName = `year${year}_month${monthZeroBased + 1}_day${dayIndex + 1}_${file.name}`;

      // Step 1: Get SAS URL (or your upload URL logic)
      const sasResp = await fetch("/api/generate-sas-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType: file.type }),
      });
      if (!sasResp.ok) {
        throw new Error("Failed to get SAS URL");
      }
      const { uploadUrl }: { uploadUrl: string } = await sasResp.json();

      // Step 2: Upload the file
      const uploadResp = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type,
        },
        body: file,
      });
      if (!uploadResp.ok) {
        throw new Error("Failed to upload video");
      }

      const blobUrl = uploadUrl.split("?")[0];

      // Step 3: Save metadata
      const saveResp = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month: monthZeroBased + 1,
          day: dayIndex + 1,
          fileName,
          blobUrl,
        }),
      });
      if (!saveResp.ok) {
        throw new Error("Failed to save upload metadata");
      }

      setStates((prev) => {
        const copy = [...prev];
        copy[dayIndex] = { file: null, uploading: false, uploadedUrl: blobUrl, error: null };
        return copy;
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setStates((prev) => {
        const copy = [...prev];
        copy[dayIndex] = { ...copy[dayIndex], uploading: false, error: errorMessage };
        return copy;
      });
    }
  };

  const handleUploadToYouTube = async (blobName: string) => {
    if (!blobName) {
      console.log('Please provide all required fields')
      return;
    }

    setUploadingToYoutube(true);

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
        console.log(err)
    } finally {
      setUploadingToYoutube(false);
    }
  };

  const handleUploadToTikTok = async (blobName: string) => {
    if (!blobName) {
      console.log('Please provide all required fields')
      return;
    }

    setUploadingToTiktok(true);

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
        console.log(err)
    } finally {
      setUploadingToTiktok(false);
    }
  };

  const handleUploadToFacebook = async (blobName: string) => {
    if (!blobName) {
      console.log('Please provide all required fields')
      return;
    }

    setUploadingToFacebook(true);

    try {
      const response = await fetch('/api/upload-facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to Facebook');
      }

      alert('Video uploaded successfully');
    } catch (err) {
        console.log(err)
    } finally {
      setUploadingToFacebook(false);
    }
  };

  const handleUploadToInstagram = async (blobName: string) => {
    if (!blobName) {
      console.log('Please provide all required fields')
      return;
    }

    setUploadingToInstagram(true);

    try {
      const response = await fetch('/api/upload-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to Instagram');
      }

      alert('Video uploaded successfully');
    } catch (err) {
        console.log(err)
    } finally {
      setUploadingToInstagram(false);
    }
  };

  const handleUploadToTwitter = async (blobName: string) => {
    if (!blobName) {
      console.log('Please provide all required fields')
      return;
    }

    setUploadingToTwitter(true);

    try {
      const response = await fetch('/api/upload-twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to Twitter');
      }

      alert('Video uploaded successfully');
    } catch (err) {
        console.log(err)
    } finally {
      setUploadingToTwitter(false);
    }
  };

  const handleTiktokToken = (accessToken: string) => {
    setTiktokAuthToken(accessToken);
    setloadingTiktokAuth(false);
  };

  useEffect(() => {
    setloadingTiktokAuth(true);

    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get("access_token");

    console.log('^^^')
    console.log(queryToken)
    console.log('^^^')

    if (queryToken) {
      window.history.replaceState({}, "", window.location.pathname);
      handleTiktokToken(queryToken);
      return;
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashToken = hashParams.get("access_token");

      if (hashToken) {
        window.history.replaceState({}, "", window.location.pathname);
        handleTiktokToken(hashToken);
        return;
      }
    }
  }, []);

  return (
    <div>
      <h1>TikTok Authentication</h1>

      {loadingTiktokAuth && !tiktokAuthToken && <p>Authenticating with TikTok...</p>}
      {!tiktokAuthToken && <TikTokAuthButton />}
      {tiktokAuthError && <p style={{ color: "red" }}>Error: {tiktokAuthError}</p>}

      <h1>
        Upload Video by Day — {year}-{(monthZeroBased + 1).toString().padStart(2, "0")}
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "12px" }}>
        {states.map((state, idx) => {
          const day = idx + 1;
          return (
            <div key={idx} style={{ border: "1px solid #ccc", padding: "8px" }}>
              <p><strong>Day {day}</strong></p>
              {state.uploadedUrl ? (
                <div>
                  <p>Uploaded!</p>
                  <video width={160} controls>
                    <source src={state.uploadedUrl} type="video/mp4" />
                    Your browser doesn’t support this tag.
                  </video>
                  <p>
                    <a href={state.uploadedUrl} target="_blank" rel="noreferrer">Open video</a>
                  </p>
                  <div>
                    <button onClick={() => handleUploadToYouTube(state.uploadedUrl)} disabled={uploadingToYoutube}>
                        {uploadingToYoutube ? 'Uploading...' : 'Upload to YouTube'}
                    </button>
                  </div>
                  <div>
                    <button onClick={() => handleUploadToTikTok(state.uploadedUrl)} disabled={uploadingToTiktok}>
                        {uploadingToTiktok ? 'Uploading...' : 'Upload to TikTok'}
                    </button>
                  </div>
                  <div>
                    <button onClick={() => handleUploadToFacebook(state.uploadedUrl)} disabled={uploadingToFacebook}>
                        {uploadingToFacebook ? 'Uploading...' : 'Upload to Facebook'}
                    </button>
                  </div>
                  <div>
                    <button onClick={() => handleUploadToInstagram(state.uploadedUrl)} disabled={uploadingToInstagram}>
                        {uploadingToInstagram ? 'Uploading...' : 'Upload to Instagram'}
                    </button>
                  </div>
                  <div>
                    <button onClick={() => handleUploadToTwitter(state.uploadedUrl)} disabled={uploadingToTwitter}>
                        {uploadingToTwitter ? 'Uploading...' : 'Upload to Twitter'}
                    </button>
                  </div>
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
                  {state.error && <p style={{ color: "red" }}>{state.error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
