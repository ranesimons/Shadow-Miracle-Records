'use client';

import { useState, useEffect } from "react";
import TiktokVideoList from "./TiktokVideoList";
import TikTokAuthButton from "./TikTokAuthButton";
import YouTubeAuthButton from "./YouTubeAuthButton";
import SocialMediaCalendar from "./SocialMediaCalendar";
import FacebookAuthButton from "./FacebookAuthButton";
import Instagram from "./Instagram";
import InstagramAuthButton from "./InstagramAuthButton";

export default function SocialMediaDashboard() {
  const [mounted, setMounted] = useState(false);
  const [tiktokAuthToken, setTiktokAuthToken] = useState<string | null>(null);
  const [youtubeAuthToken, setYoutubeAuthToken] = useState<string | null>(null);
  
  const [facebookAuthToken, setFacebookAuthToken] = useState<string | null>(null);
  const [instagramAuthToken, setInstagramAuthToken] = useState<string | null>(null);
  // Unified loading state for the whole page
  const [loading, setLoading] = useState(true);
  
  const [tiktokAuthError, setTiktokAuthError] = useState<string | null>(null);
  const [youtubeAuthError, setYoutubeAuthError] = useState<string | null>(null);
  const [facebookAuthError, setFacebookAuthError] = useState<string | null>(null);
  const [instagramAuthError, setInstagramAuthError] = useState<string | null>(null);
  const [showTiktokVideos, setShowTiktokVideos] = useState<boolean>(false);

  // 1. Initial Mount: Handle Browser-only logic
  useEffect(() => {
    setMounted(true);
    const savedTT = localStorage.getItem("tt_token");
    const savedYT = localStorage.getItem("yt_access_token");
    const savedFB = localStorage.getItem("fb_access_token");
    const savedIG = localStorage.getItem("ig_access_token");
    if (savedTT) setTiktokAuthToken(savedTT);
    if (savedYT) setYoutubeAuthToken(savedYT);
    if (savedFB) setFacebookAuthToken(savedFB);
    if (savedIG) setInstagramAuthToken(savedIG);
  }, []);

  // 2. Token Processing: Handle URL parameters
  useEffect(() => {
    if (!mounted) return;

    const searchParams = new URLSearchParams(window.location.search);
    const newParams = new URLSearchParams(window.location.search);
    let urlChanged = false;

    // Process TikTok
    const ttToken = searchParams.get("access_token");
    if (ttToken) {
      setTiktokAuthToken(ttToken);
      localStorage.setItem("tt_token", ttToken);
      newParams.delete("access_token");
      urlChanged = true;
    }

    // Process YouTube
    const ytAccess = searchParams.get("yt_access_token");
    const ytRefresh = searchParams.get("yt_refresh_token");

    if (ytAccess) {
      setYoutubeAuthToken(ytAccess);
      localStorage.setItem("yt_access_token", ytAccess);
      newParams.delete("yt_access_token");
      urlChanged = true;
    }

    if (ytRefresh) {
      localStorage.setItem("yt_refresh_token", ytRefresh);
      newParams.delete("yt_refresh_token");
      urlChanged = true;
    }

    // Process Facebook
    const fbAccess = searchParams.get("fb_access_token");
    if (fbAccess) {
      setFacebookAuthToken(fbAccess);
      localStorage.setItem("fb_access_token", fbAccess);
      newParams.delete("fb_access_token");
      urlChanged = true;
    }

    // Process Instagram
    const igAccess = searchParams.get("ig_access_token");
    if (igAccess) {
      setInstagramAuthToken(igAccess);
      localStorage.setItem("ig_access_token", igAccess);
      newParams.delete("ig_access_token");
      urlChanged = true;
    }

    // Process Errors
    const ttErr = searchParams.get("error");
    if (ttErr) setTiktokAuthError(ttErr);

    const ytErr = searchParams.get("yt_error");
    if (ytErr) setYoutubeAuthError(ytErr);

    const fbErr = searchParams.get("fb_error");
    if (fbErr) setFacebookAuthError(fbErr);

    const igErr = searchParams.get("ig_error");
    if (igErr) setInstagramAuthError(igErr);

    // Clean URL
    if (urlChanged) {
      const cleanPath = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      window.history.replaceState({}, document.title, cleanPath);
    }

    // CRITICAL: Turn off loading state once processing is finished
    setLoading(false);
  }, [mounted]);
  const logout = () => {
    localStorage.clear();
    setTiktokAuthToken(null);
    setYoutubeAuthToken(null);
    setFacebookAuthToken(null);
    setInstagramAuthToken(null);
  };

  // SSR Guard
  if (!mounted) return null;

  // Main Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        {(tiktokAuthToken || youtubeAuthToken || facebookAuthToken || instagramAuthToken) && (
          <button onClick={logout} className="text-xs text-gray-500 hover:text-white underline">
            Logout All Accounts
          </button>
        )}
      </div>
      
      {/* TIKTOK SECTION */}
      <section className="p-6 border border-gray-800 rounded-lg bg-zinc-900/50">
        <h2 className="text-xl font-bold mb-4 text-white">TikTok</h2>
        {tiktokAuthToken ? (
          <div className="space-y-4">
            <p className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Connected
            </p>
            <SocialMediaCalendar tiktokAuthToken={tiktokAuthToken} />
            <button 
              onClick={() => setShowTiktokVideos(!showTiktokVideos)}
              className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition w-full md:w-auto"
            >
              {showTiktokVideos ? "Hide Videos" : "Show My TikTok Videos"}
            </button>
            {showTiktokVideos && <TiktokVideoList tiktokAuthToken={tiktokAuthToken} />}
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <p className="text-gray-400 text-sm">Connect your TikTok account to manage videos and scheduling.</p>
            <TikTokAuthButton />
            {tiktokAuthError && <p className="text-red-500 text-sm italic">Error: {tiktokAuthError}</p>}
          </div>
        )}
      </section>

      {/* FACEBOOK SECTION */}
      <section className="p-6 border border-gray-800 rounded-lg bg-zinc-900/50">
        <h2 className="text-xl font-bold mb-4 text-white">Facebook</h2>
        {facebookAuthToken ? (
          <div className="space-y-4">
            <p className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Connected
            </p>
            <p className="text-gray-400 text-sm">Page and post publishing enabled.</p>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <p className="text-gray-400 text-sm">Connect Facebook to enable page and post management.</p>
            <FacebookAuthButton />
            {facebookAuthError && <p className="text-red-500 text-sm italic">Error: {facebookAuthError}</p>}
          </div>
        )}
      </section>

      {/* INSTAGRAM SECTION */}
      <section className="p-6 border border-gray-800 rounded-lg bg-zinc-900/50">
        <h2 className="text-xl font-bold mb-4 text-white">Instagram</h2>
        {instagramAuthToken ? (
          <div className="space-y-4">
            <p className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Connected
            </p>
            <p className="text-gray-400 text-sm">Instagram tools enabled for publishing and insights.</p>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <p className="text-gray-400 text-sm">Authorize Instagram to enable publishing and profile management.</p>
            <InstagramAuthButton />
            {instagramAuthError && <p className="text-red-500 text-sm italic">Error: {instagramAuthError}</p>}
          </div>
        )}
      </section>

      {/* YOUTUBE SECTION */}
      <section className="p-6 border border-gray-800 rounded-lg bg-zinc-900/50">
        <h2 className="text-xl font-bold mb-4 text-white">YouTube</h2>
        {youtubeAuthToken ? (
          <div className="space-y-4">
            <p className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Connected
            </p>
            <p className="text-gray-400 text-sm">Channel management and upload features enabled.</p>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <p className="text-gray-400 text-sm">Authorize YouTube to enable direct video publishing.</p>
            <YouTubeAuthButton />
            {youtubeAuthError && <p className="text-red-500 text-sm italic">Error: {youtubeAuthError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}