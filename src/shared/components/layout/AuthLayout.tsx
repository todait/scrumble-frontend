'use client';

import React from 'react';

import { GradientBackground } from './GradientBackground';

interface IntroLayoutProps {
  children: React.ReactNode;
  showGradient?: boolean;
}

/**
 * 공통 인증 레이아웃 컴포넌트
 * AuthPage, CreateSpacePage, WelcomeSpacePage, InviteSpacePage에서 사용하는 공통 레이아웃
 */
export const IntroLayout: React.FC<IntroLayoutProps> = ({ children, showGradient = true }) => {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* 좌측 콘텐츠 섹션 */}
      <div className="flex flex-1 items-center justify-center bg-[#FBFBFB] lg:w-2/3 lg:items-start lg:pt-[27vh]">
        <div className="w-full px-6 py-8 lg:px-20 lg:py-0">{children}</div>
      </div>

      {/* 우측 이미지 섹션 */}
      {showGradient && <GradientBackground />}
    </div>
  );
};
