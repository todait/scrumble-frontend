'use client';

import React from 'react';

export const DividerLine: React.FC = () => {
  return (
    <div className="flex max-w-[524px] items-center gap-4 my-2">
      <div className="flex-1 h-[1px] bg-black opacity-20"></div>
      <span className="text-[16px] text-[#181818] opacity-50 font-pretendard">또는</span>
      <div className="flex-1 h-[1px] bg-black opacity-20"></div>
    </div>
  );
}; 