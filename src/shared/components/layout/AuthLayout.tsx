'use client';

import React from 'react';

interface IntroLayoutProps {
  children: React.ReactNode;
  width?: number;
}

/**
 * 공통 인증 레이아웃 컴포넌트
 * AuthPage, CreateSpacePage, WelcomeSpacePage, InviteSpacePage에서 사용하는 공통 레이아웃
 */
export const IntroLayout: React.FC<IntroLayoutProps> = ({ children, width = 580 }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 중앙 카드 컨테이너 */}
      <div className={`w-full max-w-[${width}px] bg-white rounded-2xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] border border-[rgba(34,34,34,0.08)] py-8`}>
        {children}
      </div>
    </div>
  );
};
