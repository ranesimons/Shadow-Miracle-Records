// components/InstagramReelEmbed.tsx
import React, { useEffect, useState } from 'react';

const InstagramReelEmbed: React.FC<{ permalink: string }> = ({ permalink }) => {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbedCode = async () => {
      try {
        const response = await fetch(`/api/instagram?url=${encodeURIComponent(permalink)}`);
        const data = await response.json();

        // Assuming data.videos is an array
        const video = data.videos.find((v: { permalink: string }) => v.permalink === permalink);
        setEmbedHtml(video?.embedHtml || null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching embed code:', error.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
    };

    fetchEmbedCode();
  }, [permalink]);

  return embedHtml ? (
    <div
      className="instagram-reel"
      dangerouslySetInnerHTML={{ __html: embedHtml }}
    />
  ) : (
    <div>Loading...</div>
  );
};

export default InstagramReelEmbed;
