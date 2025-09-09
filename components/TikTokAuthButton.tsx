// components/TikTokAuthButton.tsx

'use client';

import React from 'react';

const TikTokAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/tiktok';
  };

  return (
    <button onClick={handleAuth}>
      Authenticate with TikTok
    </button>
  );
};

export default TikTokAuthButton;
