// pages/index.tsx

'use client';

import React from 'react';
import YouTubeViewCount from '@/components/Youtube';

const HomePage: React.FC = () => {

  return (
    <div>
      <h1>YouTube Video List</h1>
      <YouTubeViewCount />
    </div>
  );
};

export default HomePage;
