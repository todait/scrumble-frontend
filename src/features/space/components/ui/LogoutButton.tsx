'use client';

import React from 'react';

interface LogoutButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onClick, 
  isLoading = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full max-w-[480px] h-[54px] text-[15px] font-normal text-[#222222] font-pretendard border border-[#1D1D1F]/10 rounded-[12px] hover:bg-[#1D1D1F] hover:text-[#FFFFFF] hover:border-[#1D1D1F] transition-colors duration-200"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}; 