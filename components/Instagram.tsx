// components/Instagram.tsx
'use client';

import React, { useEffect, useState } from 'react';

type VideoView = {
  id: string;
  timestamp: string;
  videoId: string;
  viewCount: string | null;
  embedHtml: string | null;
  permalink: string;
  error: string | null;
};

type ApiResponse = {
  videos: VideoView[];
};

type ApiError = {
  error: string;
};

const Instagram: React.FC = () => {
  const [videoViews, setVideoViews] = useState<VideoView[]>([]);
  const [sortedVideoViews, setSortedVideoViews] = useState<VideoView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchViewCount() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/instagram`);
        if (!res.ok) {
          const errBody: ApiError = await res.json();
          throw new Error(errBody.error || `API error with status ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        setVideoViews(data.videos);
        setSortedVideoViews(data.videos);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchViewCount();
  }, []);

  const handleSort = () => {
    const sorted = [...videoViews].sort((a, b) => {
      const aViews = parseInt(a.viewCount || '0');
      const bViews = parseInt(b.viewCount || '0');
      return sortOrder === 'asc' ? aViews - bViews : bViews - aViews;
    });
    setSortedVideoViews(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return <div className="loading">Loading view count...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <button className="sort-button" onClick={handleSort}>
        Sort by Views ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
      </button>
      <div className="video-list">
        {sortedVideoViews.map((vv) => (
          <div key={vv.id} className="video-item">
            {vv.error ? (
              <span className="error-message">Error: {vv.error}</span>
            ) : (
              <div className="video-details">
                <span>Views: {vv.viewCount}</span>
                <span>Perma: {vv.permalink}</span>
                {vv.embedHtml ? (<div
                  className="instagram-reel"
                  dangerouslySetInnerHTML={{ __html: vv.embedHtml }}
                />) : <div>Loading.....</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instagram;
