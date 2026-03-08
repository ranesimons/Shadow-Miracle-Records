'use client';

import { useEffect, useState } from "react";

interface Video {
  videoId: string;
  publishedAt: string;
  realVideoId: string;
  title: string;
  viewCount: string;
}

interface YouTubeVideoListProps {
  youtubeAuthToken: string;
}

const YouTubeVideoList: React.FC<YouTubeVideoListProps> = ({ youtubeAuthToken }) => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  useEffect(() => {
    if (!youtubeAuthToken) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/youtube", {
          method: "GET",
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || "Failed to fetch videos");
        }
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [youtubeAuthToken]);

  if (loadingVideos) {
    return <p>Loading YouTube videos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={{ color: "#FFFFFF" }}>
      {videos && (
        <div>
          <h2>YouTube Videos</h2>
          <ul>
            {videos.map((v) => (
              <li key={v.videoId}>
                <h3>{v.title}</h3>
                <p>Views: {v.viewCount}</p>
                <p>Published: {v.publishedAt}</p>
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${v.realVideoId}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoList;