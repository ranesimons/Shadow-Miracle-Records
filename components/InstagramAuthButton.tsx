// components/InstagramAuthButton.tsx

'use client';

import React from 'react';

const InstagramAuthButton = () => {
  // const handleBusiness = () => {
  //   // business flow uses Facebook endpoint
  //   window.location.href = '/api/auth/facebook';
  // };

  const handlePersonal = () => {
    window.location.href = '/api/auth/instagram-personal';
  };

  const buttonStyle: React.CSSProperties = {
    color: '#FFFFFF',
    backgroundColor: '#405DE6',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  };

  return (
    <div>
      <button onClick={handlePersonal} style={buttonStyle}>
        Authenticate With Instagram
      </button>
    </div>
  );
};

export default InstagramAuthButton;
