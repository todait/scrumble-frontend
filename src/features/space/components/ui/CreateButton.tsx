'use client';

import React from 'react';

interface CreateButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ 
  disabled = false, 
  isLoading = false,
  loadingText
}) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full max-w-[480px] h-[54px] px-4 bg-[#222222] text-white text-[15px] font-normal font-pretendard rounded-[12px] hover:bg-[#181818] active:bg-[#181818] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        '스페이스 만들기'
      )}
    </button>
  );
}; 