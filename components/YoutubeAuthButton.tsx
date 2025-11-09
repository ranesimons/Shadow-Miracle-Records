// components/YoutubeAuthButton.tsx

'use client';

import React from 'react';

const YoutubeAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/youtube';
  };

  return (
    <button onClick={handleAuth}>
      Authenticate with Youtube
    </button>
  );
};

export default YoutubeAuthButton;
