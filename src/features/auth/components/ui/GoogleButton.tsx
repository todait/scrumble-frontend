'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';

interface GoogleButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, text, disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="md"
      className="inline-flex items-center gap-2.5 hover:bg-[#181818] active:bg-[#181818] group peer"
    >
      {/* 구글 아이콘 */}
      <div className="w-6 h-6 flex-shrink-0">
        {/* 기본 상태: 컬러 구글 아이콘 */}
        <svg 
          className="group-hover:hidden group-active:hidden w-6 h-6" 
          viewBox="0 0 24 24"
        >
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {/* hover/active 상태: 흰색 구글 아이콘 */}
        <svg 
          className="hidden group-hover:block group-active:block w-6 h-6" 
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      
      {/* 버튼 텍스트 */}
      <span className="text-base lg:text-lg font-normal leading-[1.2] text-[#181818] group-hover:text-white group-active:text-white font-pretendard transition-colors duration-200">
        {text}
      </span>
    </Button>
  );
};