'use client';

import { useEffect, useState } from "react";
import TikTokAuthButton from "@/components/TikTokAuthButton";

interface Video {
  id: string;
  title: string;
  embed_link: string;
  view_count: string;
}

const TikTokAuthPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);

  const handleToken = (accessToken: string) => {
    setToken(accessToken);
    setLoadingAuth(false);
  };

  useEffect(() => {
    setLoadingAuth(true);

    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get("access_token");

    if (queryToken) {
      window.history.replaceState({}, "", window.location.pathname);
      handleToken(queryToken);
      return;
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashToken = hashParams.get("access_token");

      if (hashToken) {
        window.history.replaceState({}, "", window.location.pathname);
        handleToken(hashToken);
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const resp = await fetch("/api/tiktok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: token }),
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
  }, [token]);

  return (
    <div>
      <h1>TikTok Authentication</h1>

      {loadingAuth && !token && <p>Authenticating with TikTok...</p>}

      {!token && <TikTokAuthButton />}

      {/* {!token && <button onClick={() => window.location.href = 'https://www.tiktok.com/login'}>Login with TikTok</button>} */}

      {token && loadingVideos && <p>Loading videos...</p>}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

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

export default TikTokAuthPage;
