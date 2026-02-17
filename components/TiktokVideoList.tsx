'use client';

import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  embed_link: string;
  view_count: string;
}

// Define the Props interface
interface TikTokAuthPageProps {
  tiktokAuthToken: string; // The Landing Page passes this in
}

const TiktokVideoList: React.FC<TikTokAuthPageProps> = ({ tiktokAuthToken }) => {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  useEffect(() => {
    if (!tiktokAuthToken) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/tiktok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tiktokAuthToken }),
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
  }, [tiktokAuthToken]);

  return (
    <div style={{ color: "#FFFFFF" }}>
      {videos && (
        <div>
          <ul>
            {videos.map((v) => (
              <li key={v.id}>
                <h3>{v.title || "(no title)"}</h3>
                <h3>{v.id || "(no id)"}</h3>
                <h3>{v.view_count || "(no views)"}</h3>
                <iframe
                  src={v.embed_link}
                  width="560"
                  height="315"
                  allow="autoplay; encrypted-media; picture-in-picture"
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

export default TiktokVideoList;
