'use client';

import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7800] mx-auto mb-4"></div>
        <p className="text-[#181818] opacity-70">로딩 중...</p>
      </div>
    </div>
  );
};