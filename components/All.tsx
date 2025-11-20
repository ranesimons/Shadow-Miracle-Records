'use client';

import React, { useEffect, useState } from 'react';

type Reel = {
  title: string;
  facebookVideoViews: number;
  instagramVideoViews: number;
  tiktokVideoViews: number;
  youtubeVideoViews: number;
  totalVideoViews: number;
  realVideoId: string;
  youtubeVideoDate: string;
};

type ApiResponse = {
  total: Reel[];
};

type ApiError = {
  error: string;
};

const TotalViewCount: React.FC = () => {
  const [videoViews, setVideoViews] = useState<Reel[]>([]);
  const [sortedVideoViews, setSortedVideoViews] = useState<Reel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchViewCount() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/all`);
        if (!res.ok) {
          const errBody: ApiError = await res.json();
          throw new Error(errBody.error || `API error with status ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        setVideoViews(data.total);
        setSortedVideoViews(data.total);
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

  const sortByTotalViews = () => {
    // Make a new array copy to avoid mutating state directly
    const newSorted = [...sortedVideoViews].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.totalVideoViews - b.totalVideoViews;
      } else {
        return b.totalVideoViews - a.totalVideoViews;
      }
    });

    setSortedVideoViews(newSorted);

    // Toggle sort order for next click
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (isLoading) {
    return <div className="loading">Loading view count...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="container">
      <button onClick={sortByTotalViews}>
        Sort by Total Views ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
      </button>

      <div className="video-list">
        {sortedVideoViews.map((vv) => (
          <div key={vv.title} className="video-item">
            <div className="video-details">
              <div>Title: {vv.title}</div>
              <div>Youtube Video Date: {vv.youtubeVideoDate}</div>
              <div>Facebook: {vv.facebookVideoViews}</div>
              <div>Instagram: {vv.instagramVideoViews}</div>
              <div>TikTok: {vv.tiktokVideoViews}</div>
              <div>YouTube: {vv.youtubeVideoViews}</div>
              <div><strong>Total: {vv.totalVideoViews}</strong></div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalViewCount;
