'use client';

import { useEffect, useState } from "react";

interface Video {
  id: string;
  created_time: string;
  title: string;
  videoId: string;
  viewCount: number;
  video_insights: any;
  error: string | null;
}

interface FacebookVideoListProps {
  facebookAuthToken: string;
}

const FacebookVideoList: React.FC<FacebookVideoListProps> = ({ facebookAuthToken }) => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  useEffect(() => {
    if (!facebookAuthToken) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/facebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: facebookAuthToken }),
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
  }, [facebookAuthToken]);

  if (loadingVideos) {
    return <p>Loading Facebook videos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={{ color: "#FFFFFF" }}>
      {videos && (
        <div>
          <h2>Facebook Videos</h2>
          <ul>
            {videos.map((v) => (
              <li key={v.id}>
                <h3>{v.title || "(no title)"}</h3>
                <p>Views: {v.viewCount || "(no views)"}</p>
                <p>Created: {v.created_time}</p>
                {/* Facebook videos don't have embed iframes like TikTok, so maybe just show a link */}
                <a href={`https://www.facebook.com/watch/?v=${v.videoId}`} target="_blank" rel="noopener noreferrer">
                  Watch on Facebook
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FacebookVideoList;