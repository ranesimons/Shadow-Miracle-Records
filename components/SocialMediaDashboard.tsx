'use client';

import { useState, useEffect } from "react";
import TiktokVideoManager from "./TiktokVideoManager";
import TiktokVideoList from "./TiktokVideoList";
import TikTokAuthButton from "./TikTokAuthButton";

export default function SocialMediaDashboard() {
  const [tiktokAuthToken, setTiktokAuthToken] = useState<string | null>(null);
  const [tiktokAuthError, setTiktokAuthError] = useState<string | null>(null);
  const [loadingTiktokAuth, setloadingTiktokAuth] = useState<boolean>(false);
  const [showTiktokVideos, setShowTiktokVideos] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if we already have a token to avoid re-running logic
    if (tiktokAuthToken) {
      setloadingTiktokAuth(false);
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get("access_token");
    
    // TikTok often returns errors in the query string (e.g., ?error=access_denied)
    const authError = searchParams.get("error") || searchParams.get("error_description");

    if (authError) {
      setTiktokAuthError(authError);
      setloadingTiktokAuth(false);
      return;
    }

    // 2. Helper to handle token cleanup and state update
    const finalizeAuth = (token: string) => {
      // Remove tokens from URL so they don't leak in history/bookmarks
      window.history.replaceState({}, document.title, window.location.pathname);
      setTiktokAuthToken(token);
      setloadingTiktokAuth(false);
    };

    // 3. Check Query Parameters
    if (queryToken) {
      finalizeAuth(queryToken);
      return;
    }

    // 4. Check URL Hash (Common for Implicit Flow)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashToken = hashParams.get("access_token");

      if (hashToken) {
        finalizeAuth(hashToken);
        return;
      }
    }

    // 5. If we got here and no token was found, stop the loading spinner
    setloadingTiktokAuth(false);
  }, [tiktokAuthToken]); // Added dependency for safety

  return (
    <div className="dashboard-container">
      {tiktokAuthToken ? (
        <>
          <TiktokVideoManager tiktokAuthToken={tiktokAuthToken} />
          {!showTiktokVideos && (
            <button 
              onClick={() => setShowTiktokVideos(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
            >
              Show My TikTok Videos
            </button>
          )}
          {showTiktokVideos && (
            <div className="animate-in fade-in duration-500">
              <button 
                onClick={() => setShowTiktokVideos(false)}
                className="mt-4 text-sm text-gray-400 underline"
              >
                Hide Videos
              </button>
              <TiktokVideoList tiktokAuthToken={tiktokAuthToken} />
            </div>
          )}
        </>
      ) : (
        <div className="p-10 border border-gray-800 text-center" style={{ color: "#FFFFFF" }}>
          <h1>TikTok Authentication</h1>
            {loadingTiktokAuth && !tiktokAuthToken && <p>Checking TikTok permissions...</p>}
            
            {/* Show button only if NOT loading and NO token */}
            {!loadingTiktokAuth && !tiktokAuthToken && (
              <>
                <p>Please connect your account to continue:</p>
                <TikTokAuthButton />
              </>
            )}

            {/* Success State */}
            {tiktokAuthToken && (
              <p style={{ color: "#4BB543" }}>✓ Connected to TikTok</p>
            )}

            {tiktokAuthError && (
              <p style={{ color: "#FF4D4D" }}>Error: {tiktokAuthError}</p>
            )}
        </div>
      )}
    </div>
  );
}