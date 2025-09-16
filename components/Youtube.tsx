'use client';

import React, { useEffect, useState } from 'react';

type VideoView = {
  title: string;
  videoId: string;
  realVideoId: string;
  viewCount: string | null;
  error: string | null;
};

type ApiResponse = {
  viewCount: VideoView[];
};

type ApiError = {
  error: string;
};

const YouTubeViewCount: React.FC = () => {
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
        const res = await fetch(`/api/youtube`);
        if (!res.ok) {
          const errBody: ApiError = await res.json();
          throw new Error(errBody.error || `API error with status ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        setVideoViews(data.viewCount);
        setSortedVideoViews(data.viewCount);
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
          <div key={vv.videoId} className="video-item">
            {vv.error ? (
              <span className="error-message">Error: {vv.error}</span>
            ) : (
              <div className="video-details">
                <span>Views: {vv.viewCount}</span>
                <iframe
                  className="video-iframe"
                  width="315"
                  height="560"
                  src={`https://www.youtube.com/embed/${vv.realVideoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeViewCount;
