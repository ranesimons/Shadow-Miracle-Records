'use client';


import React, { useEffect, useState } from 'react';
// import FacebookPlayer from 'react-facebook-player';
// import ReactPlayer from 'react-player';

// import ReactPlayer from 'react-player/facebook';

import ReactPlayer from 'react-player-custom';


type VideoView = {
  title: string;
  videoId: string;
  viewCount: number;
  error: string | null;
};

type ApiResponse = {
  videos: VideoView[];
};

type ApiError = {
  error: string;
};

const FacebookVideoList: React.FC = () => {
  const [videos, setVideos] = useState<VideoView[]>([]);
  const [sortedVideos, setSortedVideos] = useState<VideoView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/facebook');
        if (!res.ok) {
          const errBody: ApiError = await res.json();
          throw new Error(errBody.error || `API error with status ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        setVideos(data.videos);
        setSortedVideos(data.videos);
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

    fetchVideos();
  }, []);

  const handleSort = () => {
    const sorted = [...videos].sort((a, b) => {
      return sortOrder === 'asc' ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
    });
    setSortedVideos(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <button onClick={handleSort}>
        Sort by Views ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
      </button>
      <div>
        {sortedVideos.map((video) => (
          <div key={video.videoId}>
            <h3>{video.title}</h3>
            {video.error ? (
              <span style={{ color: 'red' }}>Error: {video.error}</span>
            ) : (
              <div>
                <span>Views: {video.viewCount}</span>
                <ReactPlayer
                  url="https://www.facebook.com/facebook/videos/10153231379946729/"
                  playing={true}
                  controls={true}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacebookVideoList;
