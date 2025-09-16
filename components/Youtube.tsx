// components/YouTubeViewCountsList.tsx

'use client';

import React, { useEffect, useState } from 'react';

type VideoView = {
  videoId: string;
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchViewCount() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/youtube`);
        if (!res.ok) {
          // Try to parse error
          const errBody: ApiError = await res.json();
          console.log('$$$');
          console.log(errBody);
          console.log('$$$');
          throw new Error(errBody.error || `API error with status ${res.status}`);
        }
        const data: ApiResponse = await res.json();
        setVideoViews(data.viewCount);
      } catch (err: unknown) {
        if (err instanceof Error) {
            // here err is Error, so you can access err.message etc
            console.error(err.message);
            setError(err.message);
        } else {
            // err could be string, number, null, etc
            console.error(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchViewCount();
  }, []);

  if (isLoading) {
    return <div>Loading view count...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {videoViews.map((vv) => (
        <div key={vv.videoId} style={{ marginBottom: '1rem' }}>
          <strong>Video ID:</strong> {vv.videoId} <br />
          {vv.error ? (
            <span style={{ color: 'red' }}>Error: {vv.error}</span>
          ) : (
            <span>Views: {vv.viewCount}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default YouTubeViewCount;