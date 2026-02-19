// components/TikTokAuthButton.tsx

'use client';

import React from 'react';

const TikTokAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/tiktok';
  };

  return (
    <button 
      onClick={handleAuth}
      style={{ 
        color: '#FFFFFF', 
        backgroundColor: '#FF0000', 
        padding: '10px 20px', 
        border: 'none', 
        borderRadius: '4px',
        cursor: 'pointer' 
      }}
    >
      Authenticate with TikTok
    </button>
  );
};

export default TikTokAuthButton;
