// components/SocialMediaCalendar.tsx
"use client";

import { useEffect, useState, ChangeEvent } from "react";

// Define the Props interface
interface SocialMediaCalendarProps {
  tiktokAuthToken: string; // The Landing Page passes this in
}

type UploadState = {
  file: File | null;
  uploading: boolean;
  uploadedUrl: string;
  error: string | null;
};

type UploadTargets = {
  youtube: boolean;
  tiktok: boolean;
  facebook: boolean;
  instagram: boolean;
  twitter: boolean;
};

type TikTokSettings = {
  title: string;
  description: string;
  privacyLevel: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  discloseContent: boolean;
  brandContentToggle: boolean;
  brandOrganicToggle: boolean;
};

type PlatformStatus = 'idle' | 'loading' | 'success' | 'error';

type UploadTargetStatus = {
  status: PlatformStatus;
  message?: string;
};

type UploadStatusMap = Record<keyof UploadTargets, UploadTargetStatus>;

interface UploadMetadata {
  day: number;
  blob_url: string;
}

interface FetchUploadsResponse {
  uploads: UploadMetadata[];
}

const SocialMediaCalendar: React.FC<SocialMediaCalendarProps> = ({ tiktokAuthToken }) => {
  const today = new Date();
  const year = today.getFullYear();
  const monthZeroBased = today.getMonth();
  const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();
  const [uploadingToYoutube, setUploadingToYoutube] = useState(false);
  const [uploadingToTiktok, setUploadingToTiktok] = useState(false);
  const [uploadingToFacebook, setUploadingToFacebook] = useState(false);
  const [uploadingToInstagram, setUploadingToInstagram] = useState(false);
  const [uploadingToTwitter, setUploadingToTwitter] = useState(false);
  const [states, setStates] = useState<UploadState[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        file: null,
        uploading: false,
        uploadedUrl: "",
        error: null,
      }))
  );
  const [uploadTargets, setUploadTargets] = useState<UploadTargets[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        youtube: true,
        tiktok: true,
        facebook: true,
        instagram: true,
        twitter: true,
      }))
  );
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatusMap[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        youtube: { status: 'idle' },
        tiktok: { status: 'idle' },
        facebook: { status: 'idle' },
        instagram: { status: 'idle' },
        twitter: { status: 'idle' },
      }))
  );
  const [tiktokSettings, setTiktokSettings] = useState<TikTokSettings[]>(
    () =>
      Array.from({ length: daysInMonth }, () => ({
        title: '',
        description: '',
        privacyLevel: 'PUBLIC_TO_EVERYONE',
        discloseContent: false,
        brandContentToggle: false,
        brandOrganicToggle: false,
      }))
  );

  const updateTikTokSetting = <K extends keyof TikTokSettings>(
    dayIndex: number,
    key: K,
    value: TikTokSettings[K]
  ) => {
    setTiktokSettings((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], [key]: value };
      return copy;
    });
  };

  const updateUploadStatus = (
    dayIndex: number,
    target: keyof UploadTargets,
    status: PlatformStatus,
    message?: string
  ) => {
    setUploadStatuses((prev) => {
      const copy = [...prev];
      copy[dayIndex] = {
        ...copy[dayIndex],
        [target]: { status, message },
      };
      return copy;
    });
  };

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

  const handleUploadToYouTube = async (dayIndex: number, blobName: string): Promise<string | undefined> => {
    if (!blobName) {
      const message = 'Please provide all required fields';
      updateUploadStatus(dayIndex, 'youtube', 'error', message);
      throw new Error(message);
    }

    updateUploadStatus(dayIndex, 'youtube', 'loading');
    setUploadingToYoutube(true);

    try {
      const savedRefreshToken = localStorage.getItem("yt_refresh_token");

      if (!savedRefreshToken) {
        const message = "YouTube session not found. Please re-authenticate.";
        alert(message);
        updateUploadStatus(dayIndex, 'youtube', 'error', message);
        throw new Error(message);
      }

      const response = await fetch('/api/upload-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobName, refreshToken: savedRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to YouTube');
      }

      const data: { success: boolean; videoId?: string } = await response.json();
      updateUploadStatus(dayIndex, 'youtube', 'success');
      return data.videoId;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        updateUploadStatus(dayIndex, 'youtube', 'error', message);
        console.log(err);
        throw err;
    } finally {
      setUploadingToYoutube(false);
    }
  };

  const handleUploadToTikTok = async (dayIndex: number, blobName: string) => {
    if (!blobName) {
      const message = 'Please provide all required fields';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    if (!tiktokAuthToken) {
      const message = "No TikTok session found. Please authenticate first.";
      alert(message);
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    const settings = tiktokSettings[dayIndex];
    if (!settings.title.trim()) {
      const message = 'Please enter a title for your TikTok post.';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    if (settings.discloseContent && !settings.brandContentToggle && !settings.brandOrganicToggle) {
      const message = 'Please select at least one content disclosure option (Your Brand or Branded Content).';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    updateUploadStatus(dayIndex, 'tiktok', 'loading');
    setUploadingToTiktok(true);

    try {
      const response = await fetch('/api/upload-tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tiktokAuthToken}`,
        },
        body: JSON.stringify({
          blobName,
          title: settings.title.trim(),
          description: settings.description.trim(),
          privacyLevel: settings.privacyLevel,
          brandContentToggle: settings.brandContentToggle,
          brandOrganicToggle: settings.brandOrganicToggle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to TikTok');
      }

      const data: { success: boolean; publishId?: string } = await response.json();
      updateUploadStatus(dayIndex, 'tiktok', 'success');
      return data.publishId;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        updateUploadStatus(dayIndex, 'tiktok', 'error', message);
        console.log(err);
        throw err;
    } finally {
      setUploadingToTiktok(false);
    }
  };

  const handleUploadToFacebook = async (dayIndex: number, blobUrl: string): Promise<string | undefined> => {
    if (!blobUrl) {
      const message = 'Please provide all required fields';
      updateUploadStatus(dayIndex, 'facebook', 'error', message);
      throw new Error(message);
    }

    updateUploadStatus(dayIndex, 'facebook', 'loading');
    setUploadingToFacebook(true);

    try {
      const response = await fetch('/api/upload-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload video to Facebook');
      }

      const data: { success: boolean; videoId?: string } = await response.json();
      updateUploadStatus(dayIndex, 'facebook', 'success');
      return data.videoId;
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        updateUploadStatus(dayIndex, 'facebook', 'error', message);
        console.log(err);
        throw err;
    } finally {
      setUploadingToFacebook(false);
    }
  };

  const handleUploadToTwitter = async (dayIndex: number, blobName: string) => {
    if (!blobName) {
      const message = 'Please provide all required fields';
      updateUploadStatus(dayIndex, 'twitter', 'error', message);
      throw new Error(message);
    }

    updateUploadStatus(dayIndex, 'twitter', 'loading');
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

      updateUploadStatus(dayIndex, 'twitter', 'success');
      alert('Video uploaded successfully');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        updateUploadStatus(dayIndex, 'twitter', 'error', message);
        console.log(err);
        throw err;
    } finally {
      setUploadingToTwitter(false);
    }
  };

  const handleUploadTargetChange = (dayIndex: number, target: keyof UploadTargets) => (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUploadTargets((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], [target]: checked };
      return copy;
    });
  };

  const handleUploadToInstagram = async (dayIndex: number, blobUrl: string): Promise<string | undefined> => {
    if (!blobUrl) {
      const message = 'Please provide all required fields';
      updateUploadStatus(dayIndex, 'instagram', 'error', message);
      throw new Error(message);
    }

    const igAccessToken = localStorage.getItem('ig_access_token');
    const igUserId = localStorage.getItem('ig_user_id');

    if (!igAccessToken || !igUserId) {
      const message = 'Instagram session not found. Please authenticate first.';
      alert(message);
      updateUploadStatus(dayIndex, 'instagram', 'error', message);
      throw new Error(message);
    }

    updateUploadStatus(dayIndex, 'instagram', 'loading');
    setUploadingToInstagram(true);

    try {
      const createRes = await fetch('/api/create-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobUrl,
          accessToken: igAccessToken,
          igUserId,
          mediaType: 'REELS',
        }),
      });

      if (!createRes.ok) {
        const message = 'Failed to create Instagram media container';
        updateUploadStatus(dayIndex, 'instagram', 'error', message);
        throw new Error(message);
      }

      const createJson = await createRes.json();
      const containerId = createJson.containerId;

      if (!containerId) {
        const message = 'Instagram container creation failed';
        updateUploadStatus(dayIndex, 'instagram', 'error', message);
        throw new Error(message);
      }

      await new Promise<void>((resolve, reject) => {
        const pollStatus = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/check-instagram?id=${containerId}&accessToken=${igAccessToken}`);
            const data = await statusRes.json();

            if (data.status_code === 'FINISHED') {
              clearInterval(pollStatus);
              resolve();
            } else if (data.status_code === 'ERROR') {
              clearInterval(pollStatus);
              reject(new Error('Meta failed to process the video.'));
            }
          } catch (err) {
            clearInterval(pollStatus);
            reject(err);
          }
        }, 5000);
      });

      const publishRes = await fetch('/api/upload-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creationId: createJson.containerId, igUserId, accessToken: igAccessToken }),
      });

      if (!publishRes.ok) {
        const message = 'Failed to publish Instagram media';
        updateUploadStatus(dayIndex, 'instagram', 'error', message);
        throw new Error(message);
      }

      const publishData: { success?: boolean; postId?: string } = await publishRes.json();
      updateUploadStatus(dayIndex, 'instagram', 'success');
      return publishData.postId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      updateUploadStatus(dayIndex, 'instagram', 'error', message);
      console.log(err);
      throw err;
    } finally {
      setUploadingToInstagram(false);
    }
  };

  const handleUploadSelectedPlatforms = async (dayIndex: number) => {
    const state = states[dayIndex];
    const targets = uploadTargets[dayIndex];

    if (!state.uploadedUrl) {
      alert(`Please upload a video first for day ${dayIndex + 1}`);
      return;
    }

    const selectedTargets = Object.entries(targets)
      .filter(([, value]) => value)
      .map(([key]) => key);

    if (selectedTargets.length === 0) {
      alert('Please select at least one platform to upload to.');
      return;
    }

    type ActionResult = { target: string; status: 'fulfilled' | 'rejected'; error?: string; videoId?: string };
    const actions: Array<Promise<ActionResult>> = [];

    if (targets.youtube) {
      actions.push(
        handleUploadToYouTube(dayIndex, state.uploadedUrl)
          .then((videoId) => ({ target: 'YouTube', status: 'fulfilled' as const, videoId }))
          .catch((err) => ({ target: 'YouTube', status: 'rejected' as const, error: err instanceof Error ? err.message : String(err) }))
      );
    }

    if (targets.tiktok) {
      actions.push(
        handleUploadToTikTok(dayIndex, state.uploadedUrl)
          .then((videoId) => ({ target: 'TikTok', status: 'fulfilled' as const, videoId }))
          .catch((err) => ({ target: 'TikTok', status: 'rejected' as const, error: err instanceof Error ? err.message : String(err) }))
      );
    }

    if (targets.facebook) {
      actions.push(
        handleUploadToFacebook(dayIndex, state.uploadedUrl)
          .then((videoId) => ({ target: 'Facebook', status: 'fulfilled' as const, videoId }))
          .catch((err) => ({ target: 'Facebook', status: 'rejected' as const, error: err instanceof Error ? err.message : String(err) }))
      );
    }

    if (targets.instagram) {
      actions.push(
        handleUploadToInstagram(dayIndex, state.uploadedUrl)
          .then((videoId) => ({ target: 'Instagram', status: 'fulfilled' as const, videoId }))
          .catch((err) => ({ target: 'Instagram', status: 'rejected' as const, error: err instanceof Error ? err.message : String(err) }))
      );
    }

    const results = await Promise.all(actions);
    const failed = results.filter((result) => result.status === 'rejected');

    const getId = (target: string) =>
      results.find((r) => r.target === target && r.status === 'fulfilled')?.videoId;

    const youtubeVideoId = getId('YouTube');
    const tiktokVideoId = getId('TikTok');
    const facebookVideoId = getId('Facebook');
    const instagramVideoId = getId('Instagram');

    if (youtubeVideoId || tiktokVideoId || facebookVideoId || instagramVideoId) {
      await fetch('/api/update-platform-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: state.uploadedUrl,
          youtubeVideoId,
          tiktokVideoId,
          facebookVideoId,
          instagramVideoId,
        }),
      });
    }

    if (failed.length > 0) {
      const failedList = failed.map((result) => `${result.target}${result.error ? ` (${result.error})` : ''}`).join(', ');
      alert(`Some uploads failed: ${failedList}`);
    } else {
      alert('Selected uploads completed successfully.');
    }
  };

  return (

    <div style={{ color: "#FFFFFF" }}>

      <h1>
        Upload Video by Day — {year}-{(monthZeroBased + 1).toString().padStart(2, "0")}
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "12px" }}>
        {states.map((state, idx) => {
          const day = idx + 1;
          return (
            <div key={idx} style={{ color: "#FFFFFF", border: "1px solid #ccc", padding: "8px" }}>
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
                  <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={uploadTargets[idx]?.youtube ?? true}
                        onChange={handleUploadTargetChange(idx, 'youtube')}
                      />
                      Upload to YouTube
                      <span style={{ marginLeft: '8px', color: uploadStatuses[idx]?.youtube.status === 'error' ? '#f87171' : '#a1a1aa' }}>
                        {uploadStatuses[idx]?.youtube.status === 'loading' && 'Loading...'}
                        {uploadStatuses[idx]?.youtube.status === 'success' && 'Success'}
                        {uploadStatuses[idx]?.youtube.status === 'error' && `Error: ${uploadStatuses[idx]?.youtube.message ?? 'Failed'}`}
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={uploadTargets[idx]?.tiktok ?? true}
                        onChange={handleUploadTargetChange(idx, 'tiktok')}
                      />
                      Upload to TikTok
                      <span style={{ marginLeft: '8px', color: uploadStatuses[idx]?.tiktok.status === 'error' ? '#f87171' : '#a1a1aa' }}>
                        {uploadStatuses[idx]?.tiktok.status === 'loading' && 'Loading...'}
                        {uploadStatuses[idx]?.tiktok.status === 'success' && 'Success'}
                        {uploadStatuses[idx]?.tiktok.status === 'error' && `Error: ${uploadStatuses[idx]?.tiktok.message ?? 'Failed'}`}
                      </span>
                    </label>
                    {uploadTargets[idx]?.tiktok && (
                      <div style={{ marginLeft: '24px', display: 'grid', gap: '6px', fontSize: '12px', borderLeft: '2px solid #333', paddingLeft: '8px' }}>
                        <input
                          type="text"
                          placeholder="TikTok title (required)"
                          value={tiktokSettings[idx]?.title ?? ''}
                          onChange={(e) => updateTikTokSetting(idx, 'title', e.target.value)}
                          maxLength={150}
                          style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 6px', width: '100%' }}
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={tiktokSettings[idx]?.description ?? ''}
                          onChange={(e) => updateTikTokSetting(idx, 'description', e.target.value)}
                          maxLength={2200}
                          rows={2}
                          style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 6px', width: '100%', resize: 'vertical' }}
                        />
                        <select
                          value={tiktokSettings[idx]?.privacyLevel ?? 'PUBLIC_TO_EVERYONE'}
                          onChange={(e) => updateTikTokSetting(idx, 'privacyLevel', e.target.value as TikTokSettings['privacyLevel'])}
                          style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 6px' }}
                        >
                          <option value="PUBLIC_TO_EVERYONE">Public</option>
                          <option value="FOLLOWER_OF_CREATOR">Followers only</option>
                          <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                          <option value="SELF_ONLY">Private</option>
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc' }}>
                          <input
                            type="checkbox"
                            checked={tiktokSettings[idx]?.discloseContent ?? false}
                            onChange={(e) => {
                              updateTikTokSetting(idx, 'discloseContent', e.target.checked);
                              if (!e.target.checked) {
                                updateTikTokSetting(idx, 'brandContentToggle', false);
                                updateTikTokSetting(idx, 'brandOrganicToggle', false);
                              }
                            }}
                          />
                          Disclose video content
                        </label>
                        {tiktokSettings[idx]?.discloseContent && (
                          <div style={{ marginLeft: '16px', display: 'grid', gap: '4px', color: '#aaa', fontSize: '11px' }}>
                            <p style={{ margin: 0, color: '#888' }}>Your video will be labeled "Promotional content". You must disclose when it promotes yourself or a third party.</p>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="checkbox"
                                checked={tiktokSettings[idx]?.brandOrganicToggle ?? false}
                                onChange={(e) => updateTikTokSetting(idx, 'brandOrganicToggle', e.target.checked)}
                              />
                              Your Brand (promoting yourself or your own business)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="checkbox"
                                checked={tiktokSettings[idx]?.brandContentToggle ?? false}
                                onChange={(e) => updateTikTokSetting(idx, 'brandContentToggle', e.target.checked)}
                              />
                              Branded Content (paid partnership / sponsored)
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={uploadTargets[idx]?.facebook ?? true}
                        onChange={handleUploadTargetChange(idx, 'facebook')}
                      />
                      Upload to Facebook
                      <span style={{ marginLeft: '8px', color: uploadStatuses[idx]?.facebook.status === 'error' ? '#f87171' : '#a1a1aa' }}>
                        {uploadStatuses[idx]?.facebook.status === 'loading' && 'Loading...'}
                        {uploadStatuses[idx]?.facebook.status === 'success' && 'Success'}
                        {uploadStatuses[idx]?.facebook.status === 'error' && `Error: ${uploadStatuses[idx]?.facebook.message ?? 'Failed'}`}
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={uploadTargets[idx]?.instagram ?? true}
                        onChange={handleUploadTargetChange(idx, 'instagram')}
                      />
                      Upload to Instagram
                      <span style={{ marginLeft: '8px', color: uploadStatuses[idx]?.instagram.status === 'error' ? '#f87171' : '#a1a1aa' }}>
                        {uploadStatuses[idx]?.instagram.status === 'loading' && 'Loading...'}
                        {uploadStatuses[idx]?.instagram.status === 'success' && 'Success'}
                        {uploadStatuses[idx]?.instagram.status === 'error' && `Error: ${uploadStatuses[idx]?.instagram.message ?? 'Failed'}`}
                      </span>
                    </label>
                    {/* <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={uploadTargets[idx]?.twitter ?? true}
                        onChange={handleUploadTargetChange(idx, 'twitter')}
                      />
                      Upload to Twitter
                      <span style={{ marginLeft: '8px', color: uploadStatuses[idx]?.twitter.status === 'error' ? '#f87171' : '#a1a1aa' }}>
                        {uploadStatuses[idx]?.twitter.status === 'loading' && 'Loading...'}
                        {uploadStatuses[idx]?.twitter.status === 'success' && 'Success'}
                        {uploadStatuses[idx]?.twitter.status === 'error' && `Error: ${uploadStatuses[idx]?.twitter.message ?? 'Failed'}`}
                      </span>
                    </label> */}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => handleUploadSelectedPlatforms(idx)}
                      disabled={
                        (uploadTargets[idx]?.youtube && uploadingToYoutube) ||
                        (uploadTargets[idx]?.tiktok && uploadingToTiktok) ||
                        (uploadTargets[idx]?.facebook && uploadingToFacebook) ||
                        (uploadTargets[idx]?.instagram && uploadingToInstagram) ||
                        (uploadTargets[idx]?.twitter && uploadingToTwitter)
                      }
                    >
                      Upload selected platforms
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

export default SocialMediaCalendar;