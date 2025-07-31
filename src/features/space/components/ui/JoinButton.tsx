'use client';

import React from 'react';

interface JoinButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export const JoinButton: React.FC<JoinButtonProps> = ({ disabled, isLoading }) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full max-w-[480px] h-[54px] px-4 bg-[#222222] text-white text-[15px] font-normal font-pretendard rounded-[12px] hover:bg-[#181818] active:bg-[#181818] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        '입장하기'
      )}
    </button>
  );
};