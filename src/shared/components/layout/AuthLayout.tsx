'use client';

import React from 'react';

import { GradientBackground } from './GradientBackground';

interface IntroLayoutProps {
  children: React.ReactNode;
  showGradient?: boolean;
  isAuthenticated?: boolean;
}

/**
 * 공통 인증 레이아웃 컴포넌트
 * AuthPage, CreateSpacePage, WelcomeSpacePage, InviteSpacePage에서 사용하는 공통 레이아웃
 */
export const IntroLayout: React.FC<IntroLayoutProps> = ({ 
  children, 
  showGradient = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 좌측 콘텐츠 섹션 */}
      <div className="flex-1 lg:w-2/3 bg-[#FBFBFB] flex items-center lg:items-start justify-center lg:pt-[27vh]">
        <div className="w-full px-6 lg:px-20 py-8 lg:py-0">
          {children}
        </div>
      </div>

      {/* 우측 이미지 섹션 */}
      {showGradient && <GradientBackground />}
    </div>
  );
};