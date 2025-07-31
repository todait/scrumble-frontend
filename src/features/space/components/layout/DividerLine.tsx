'use client';

import React from 'react';

export const DividerLine: React.FC = () => {
  return (
    <div className="flex w-full max-w-[480px] items-center gap-4 my-2">
      <div className="flex-1 h-[1px] bg-[#1D1D1F]/10"></div>
      <span className="text-[15px] text-[#222222] opacity-50 font-pretendard">또는</span>
      <div className="flex-1 h-[1px] bg-[#1D1D1F]/10"></div>
    </div>
  );
}; 