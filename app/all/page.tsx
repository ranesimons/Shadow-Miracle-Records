// pages/all.tsx

'use client';

import React from 'react';
import YouTubeViewCount from '@/components/Youtube';
import Instagram from '@/components/Instagram';

const HomePage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '1rem'   // optional
    }}>
      <YouTubeViewCount />
      <Instagram />
    </div>
  );
};

export default HomePage;
