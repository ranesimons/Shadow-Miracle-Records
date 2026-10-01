// components/SocialMediaCalendar.tsx
"use client";

import { useEffect, useState, ChangeEvent } from "react";
import type { CreatorInfo } from "../pages/api/tiktok-creator-info";

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Everyone',
  MUTUAL_FOLLOW_FRIENDS: 'Friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  SELF_ONLY: 'Only me',
};

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
  privacyLevel: '' | 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
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
        youtube: false,
        tiktok: true,
        facebook: false,
        instagram: false,
        twitter: false,
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
        privacyLevel: '',
        allowComment: false,
        allowDuet: false,
        allowStitch: false,
        discloseContent: false,
        brandContentToggle: false,
        brandOrganicToggle: false,
      }))
  );
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  const [tiktokNotice, setTiktokNotice] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!tiktokAuthToken) return;
    fetch('/api/tiktok-creator-info', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tiktokAuthToken}` },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? 'Could not load your TikTok account');
        setCreatorInfo(data);
        setCreatorError(null);
      })
      .catch((e) => setCreatorError(e instanceof Error ? e.message : 'Could not load your TikTok account'));
  }, [tiktokAuthToken]);

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

    if (!creatorInfo) {
      const message = creatorError ?? 'Your TikTok account is still loading. Please try again in a moment.';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    if (!settings.privacyLevel) {
      const message = 'Please choose who can view this video.';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    const duration = videoDurations[dayIndex];
    if (duration && duration > creatorInfo.max_video_post_duration_sec) {
      const message = `This video is ${Math.round(duration)}s long. Your TikTok account can post videos up to ${creatorInfo.max_video_post_duration_sec}s.`;
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    if (settings.discloseContent && !settings.brandContentToggle && !settings.brandOrganicToggle) {
      const message = 'Please select at least one content disclosure option (Your Brand or Branded Content).';
      updateUploadStatus(dayIndex, 'tiktok', 'error', message);
      throw new Error(message);
    }

    setTiktokNotice((prev) => ({ ...prev, [dayIndex]: '' }));
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
          allowComment: settings.allowComment,
          allowDuet: settings.allowDuet,
          allowStitch: settings.allowStitch,
          brandContentToggle: settings.brandContentToggle,
          brandOrganicToggle: settings.brandOrganicToggle,
        }),
      });

      const data: { success: boolean; publishId?: string; error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to upload video to TikTok');
      }
      updateUploadStatus(dayIndex, 'tiktok', 'success');
      setTiktokNotice((prev) => ({
        ...prev,
        [dayIndex]: 'Posted! TikTok is processing your video. It may take a few minutes to appear on your profile.',
      }));
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

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthName = MONTH_NAMES[monthZeroBased];

  const fieldStyle: React.CSSProperties = {
    background: '#0a0a0c',
    color: '#e4e4e7',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '6px 8px',
    fontSize: '0.73rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ color: "#FFFFFF" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
          {monthName} {year}
        </h2>
        <p style={{ fontSize: "0.78rem", color: "#52525b", margin: 0 }}>
          Upload a video for each day, then post it to TikTok.
        </p>
        {creatorInfo && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "8px 12px", background: "#111113", border: "1px solid #1f1f23", borderRadius: "10px", width: "fit-content" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={creatorInfo.creator_avatar_url} alt="" width={28} height={28} style={{ borderRadius: "50%" }} />
            <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
              Posting to <strong style={{ color: "#fff" }}>{creatorInfo.creator_nickname}</strong>
              <span style={{ color: "#52525b" }}> @{creatorInfo.creator_username}</span>
            </span>
          </div>
        )}
        {creatorError && (
          <p style={{ fontSize: "0.75rem", color: "#f87171", margin: "10px 0 0" }}>
            TikTok: {creatorError}
          </p>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(160px, 1fr))", gap: "8px", minWidth: "1120px" }}>
          {states.map((state, idx) => {
            const day = idx + 1;
            const hasVideo = !!state.uploadedUrl;
            const ttStatus = uploadStatuses[idx]?.tiktok.status;

            const statusBadge = hasVideo ? (
              <span style={{
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                padding: "2px 7px",
                borderRadius: "20px",
                background: ttStatus === 'success' ? '#14532d33' : ttStatus === 'error' ? '#7f1d1d33' : ttStatus === 'loading' ? '#17255133' : '#18181b',
                color: ttStatus === 'success' ? '#4ade80' : ttStatus === 'error' ? '#f87171' : ttStatus === 'loading' ? '#93c5fd' : '#52525b',
                border: `1px solid ${ttStatus === 'success' ? '#166534' : ttStatus === 'error' ? '#991b1b' : ttStatus === 'loading' ? '#1e3a8a' : '#27272a'}`,
              }}>
                {ttStatus === 'success' ? '✓ Posted' : ttStatus === 'loading' ? '↻ Posting' : ttStatus === 'error' ? '✕ Failed' : 'Ready'}
              </span>
            ) : null;

            return (
              <div
                key={idx}
                style={{
                  background: "#111113",
                  border: "1px solid #1f1f23",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Day header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3f3f46", letterSpacing: "0.08em" }}>
                    DAY {day}
                  </span>
                  {statusBadge}
                </div>

                {hasVideo ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Video preview */}
                    <video
                      style={{ width: "100%", borderRadius: "6px", background: "#000", maxHeight: "90px", objectFit: "cover", display: "block" }}
                      controls
                      onLoadedMetadata={(e) => {
                        const d = e.currentTarget.duration;
                        setVideoDurations((prev) => ({ ...prev, [idx]: d }));
                      }}
                    >
                      <source src={state.uploadedUrl} type="video/mp4" />
                    </video>

                    {/* TikTok settings */}
                    <input
                      type="text"
                      placeholder="Title (required)"
                      value={tiktokSettings[idx]?.title ?? ''}
                      onChange={(e) => updateTikTokSetting(idx, 'title', e.target.value)}
                      maxLength={150}
                      style={fieldStyle}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={tiktokSettings[idx]?.description ?? ''}
                      onChange={(e) => updateTikTokSetting(idx, 'description', e.target.value)}
                      maxLength={2200}
                      rows={2}
                      style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                    <select
                      value={tiktokSettings[idx]?.privacyLevel ?? ''}
                      onChange={(e) => updateTikTokSetting(idx, 'privacyLevel', e.target.value as TikTokSettings['privacyLevel'])}
                      style={{ ...fieldStyle, color: tiktokSettings[idx]?.privacyLevel ? fieldStyle.color : '#52525b' }}
                    >
                      <option value="" disabled>Who can view this video?</option>
                      {(creatorInfo?.privacy_level_options ?? []).map((opt) => {
                        const blocked = opt === 'SELF_ONLY' && tiktokSettings[idx]?.brandContentToggle;
                        return (
                          <option key={opt} value={opt} disabled={blocked}>
                            {PRIVACY_LABELS[opt] ?? opt}{blocked ? ' (not allowed for branded content)' : ''}
                          </option>
                        );
                      })}
                    </select>

                    {/* Interaction settings */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {([
                        ['allowComment', 'Comment', creatorInfo?.comment_disabled],
                        ['allowDuet', 'Duet', creatorInfo?.duet_disabled],
                        ['allowStitch', 'Stitch', creatorInfo?.stitch_disabled],
                      ] as const).map(([key, label, disabledByCreator]) => (
                        <label
                          key={key}
                          title={disabledByCreator ? `${label} is turned off in your TikTok settings` : undefined}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: disabledByCreator ? 'not-allowed' : 'pointer', opacity: disabledByCreator ? 0.4 : 1 }}
                        >
                          <input
                            type="checkbox"
                            checked={!disabledByCreator && (tiktokSettings[idx]?.[key] ?? false)}
                            disabled={!!disabledByCreator}
                            onChange={(e) => updateTikTokSetting(idx, key, e.target.checked)}
                            style={{ accentColor: '#ee1d52' }}
                          />
                          <span style={{ fontSize: "0.68rem", color: "#71717a" }}>Allow {label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Disclose content */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
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
                        style={{ accentColor: '#ee1d52' }}
                      />
                      <span style={{ fontSize: "0.7rem", color: "#71717a" }}>Disclose video content</span>
                    </label>
                    {tiktokSettings[idx]?.discloseContent && (
                      <div style={{ marginLeft: "10px", borderLeft: "2px solid #27272a", paddingLeft: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                        <p style={{ fontSize: "0.65rem", color: "#52525b", margin: "0 0 2px" }}>
                          {tiktokSettings[idx]?.brandContentToggle
                            ? 'Your video will be labeled "Paid partnership"'
                            : tiktokSettings[idx]?.brandOrganicToggle
                              ? 'Your video will be labeled "Promotional content"'
                              : 'Turn on to disclose that this video promotes goods or services in exchange for something of value.'}
                        </p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={tiktokSettings[idx]?.brandOrganicToggle ?? false}
                            onChange={(e) => updateTikTokSetting(idx, 'brandOrganicToggle', e.target.checked)}
                            style={{ accentColor: '#ee1d52' }}
                          />
                          <span style={{ fontSize: "0.68rem", color: "#71717a" }}>Your Brand</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={tiktokSettings[idx]?.brandContentToggle ?? false}
                            onChange={(e) => {
                              updateTikTokSetting(idx, 'brandContentToggle', e.target.checked);
                              if (e.target.checked && tiktokSettings[idx]?.privacyLevel === 'SELF_ONLY') {
                                updateTikTokSetting(idx, 'privacyLevel', '');
                              }
                            }}
                            style={{ accentColor: '#ee1d52' }}
                          />
                          <span style={{ fontSize: "0.68rem", color: "#71717a" }}>Branded Content</span>
                        </label>
                      </div>
                    )}

                    {/* Error message */}
                    {ttStatus === 'error' && (
                      <p style={{ fontSize: "0.68rem", color: "#f87171", margin: 0, lineHeight: 1.3 }}>
                        {uploadStatuses[idx]?.tiktok.message ?? 'Upload failed'}
                      </p>
                    )}

                    {tiktokNotice[idx] && ttStatus === 'success' && (
                      <p style={{ fontSize: "0.68rem", color: "#4ade80", margin: 0, lineHeight: 1.3 }}>
                        {tiktokNotice[idx]}
                      </p>
                    )}

                    {/* Consent declaration */}
                    <p style={{ fontSize: "0.62rem", color: "#52525b", margin: 0, lineHeight: 1.4 }}>
                      By posting, you agree to TikTok&apos;s{' '}
                      {tiktokSettings[idx]?.brandContentToggle && (
                        <>
                          <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer" style={{ color: "#a1a1aa" }}>Branded Content Policy</a>
                          {' and '}
                        </>
                      )}
                      <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer" style={{ color: "#a1a1aa" }}>Music Usage Confirmation</a>.
                    </p>

                    {/* Post button */}
                    {(() => {
                      const s = tiktokSettings[idx];
                      const disclosureIncomplete = s?.discloseContent && !s.brandContentToggle && !s.brandOrganicToggle;
                      const blocked = uploadingToTiktok || !creatorInfo || !s?.privacyLevel || !!disclosureIncomplete;
                      const hint = !creatorInfo
                        ? 'Connect TikTok to post'
                        : !s?.privacyLevel
                          ? 'Choose who can view this video'
                          : disclosureIncomplete
                            ? 'Select Your Brand or Branded Content'
                            : null;
                      return (
                        <>
                          <button
                            onClick={() => handleUploadSelectedPlatforms(idx)}
                            disabled={blocked}
                            style={{
                              background: blocked ? '#27272a' : '#ee1d52',
                              color: blocked ? '#52525b' : '#fff',
                              border: 'none',
                              borderRadius: '7px',
                              padding: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: blocked ? 'not-allowed' : 'pointer',
                              width: '100%',
                              letterSpacing: '0.01em',
                            }}
                          >
                            {uploadingToTiktok ? 'Posting…' : 'Post to TikTok'}
                          </button>
                          {hint && !uploadingToTiktok && (
                            <p style={{ fontSize: "0.62rem", color: "#71717a", margin: 0, textAlign: "center" }}>{hint}</p>
                          )}
                        </>
                      );
                    })()}

                    <a
                      href={state.uploadedUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "0.65rem", color: "#3f3f46", textAlign: "center", textDecoration: "none" }}
                    >
                      View source ↗
                    </a>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {/* Upload drop zone */}
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1.5px dashed ${state.file ? '#3f3f46' : '#27272a'}`,
                        borderRadius: "8px",
                        padding: "18px 8px",
                        cursor: "pointer",
                        gap: "5px",
                        background: state.file ? '#18181b' : 'transparent',
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🎬</span>
                      <span style={{ fontSize: "0.68rem", color: state.file ? '#a1a1aa' : '#3f3f46', textAlign: 'center', wordBreak: 'break-all' }}>
                        {state.file
                          ? (state.file.name.length > 22 ? state.file.name.slice(0, 20) + '…' : state.file.name)
                          : 'Choose video'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange(idx)}
                        disabled={state.uploading}
                        style={{ display: "none" }}
                      />
                    </label>

                    {/* Save button */}
                    <button
                      onClick={handleUpload(idx)}
                      disabled={state.uploading || !state.file}
                      style={{
                        background: state.file && !state.uploading ? '#27272a' : '#18181b',
                        color: state.file && !state.uploading ? '#e4e4e7' : '#3f3f46',
                        border: '1px solid #27272a',
                        borderRadius: '7px',
                        padding: '7px',
                        fontSize: '0.73rem',
                        fontWeight: 500,
                        cursor: state.file && !state.uploading ? 'pointer' : 'not-allowed',
                        width: '100%',
                      }}
                    >
                      {state.uploading ? 'Saving…' : 'Save to storage'}
                    </button>

                    {state.error && (
                      <p style={{ fontSize: "0.68rem", color: "#f87171", margin: 0, lineHeight: 1.3 }}>{state.error}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SocialMediaCalendar;