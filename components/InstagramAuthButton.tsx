// components/InstagramAuthButton.tsx

'use client';

import React from 'react';

const InstagramAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/instagram';
  };

  return (
    <button
      onClick={handleAuth}
      style={{
        color: '#FFFFFF',
        backgroundColor: '#405DE6',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Authenticate with Instagram
    </button>
  );
};

export default InstagramAuthButton;
