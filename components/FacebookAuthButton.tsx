// components/FacebookAuthButton.tsx

'use client';

import React from 'react';

const FacebookAuthButton = () => {
  const handleAuth = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <button onClick={handleAuth}>
      Authenticate with Facebook
    </button>
  );
};

export default FacebookAuthButton;
