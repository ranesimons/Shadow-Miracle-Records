'use client';

import { useEffect, useState } from "react";

interface Video {
  id: string;
  timestamp: string;
  videoId: string;
  viewCount: number | null;
  embedHtml: string | null;
  permalink: string;
  error: string | null;
}

interface InstagramVideoListProps {
  instagramAuthToken: string;
}

const InstagramVideoList: React.FC<InstagramVideoListProps> = ({ instagramAuthToken }) => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  useEffect(() => {
    if (!instagramAuthToken) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/instagram", {
          method: "GET", // Instagram API doesn't require POST with token in body
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
  }, [instagramAuthToken]);

  if (loadingVideos) {
    return <p>Loading Instagram videos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={{ color: "#FFFFFF" }}>
      {videos && (
        <div>
          <h2>Instagram Videos</h2>
          <ul>
            {videos.map((v) => (
              <li key={v.id}>
                <p>Views: {v.viewCount || "(no views)"}</p>
                <p>Posted: {v.timestamp}</p>
                <a href={v.permalink} target="_blank" rel="noopener noreferrer">
                  View on Instagram
                </a>
                {v.embedHtml && (
                  <div dangerouslySetInnerHTML={{ __html: v.embedHtml }} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InstagramVideoList;