// components/Instagram.tsx

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

import React, { useEffect, useState } from 'react';

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

    // Inject Instagram embed script once
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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
                <span>Id: {vv.id}</span><br/>
                <span>Views: {vv.viewCount}</span><br/>
                <span>Permalink: <a href={vv.permalink} target="_blank" rel="noopener noreferrer">{vv.permalink}</a></span>
                <div className="embed-wrapper" style={{ marginTop: '1rem' }}>
                  {vv.embedHtml ? (
                    <div
                      className="instagram-reel"
                      dangerouslySetInnerHTML={{ __html: vv.embedHtml }}
                    />
                  ) : (
                    <blockquote
                      className="instagram-media"
                      data-instgrm-captioned
                      data-instgrm-permalink={vv.permalink}
                      data-instgrm-version="14"
                      style={{ background: '#FFF', border: 0, borderRadius: 3, boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', margin: '1px', maxWidth: '540px', width: '100%', padding: 0 }}
                    >
                      <div style={{ padding: 16 }}>
                        <a href={vv.permalink} target="_blank" rel="noopener noreferrer" style={{ color: '#000', fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: '17px', textDecoration: 'none' }}>
                          View this post on Instagram
                        </a>
                      </div>
                    </blockquote>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instagram;
