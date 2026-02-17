'use client';

import { useEffect } from "react";

export default function TikTokAuth({ onTokenDetected }: { onTokenDetected: (t: string) => void }) {
  useEffect(() => {
    // Check URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("access_token");
    
    // Check Storage
    const storedToken = localStorage.getItem("tt_token");

    if (urlToken) {
      localStorage.setItem("tt_token", urlToken);
      window.history.replaceState({}, "", window.location.pathname);
      onTokenDetected(urlToken);
    } else if (storedToken) {
      onTokenDetected(storedToken);
    }
  }, [onTokenDetected]);

  return null; // This component renders nothing visually
}