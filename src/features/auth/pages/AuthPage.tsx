'use client';

import React from 'react';

import { PageLoadingSpinner } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';

import { IntroLayout } from '@/shared/components/layout';
import { AuthHeader, GoogleButton } from '../components';
import { useAuthErrorHandling, useAuthRedirect, useGoogleAuth } from '../hooks';

const AuthPage = () => {
  // 커스텀 훅들
  const { isAuthenticated, user, isLoading } = useAuth();
  const { handleGoogleLogin, handleLogout } = useGoogleAuth();
  const { isLoading: isRedirecting } = useAuthRedirect();

  // URL 파라미터로부터 에러 처리
  useAuthErrorHandling();

  // 로딩 중일 때 표시
  if (isLoading || isRedirecting) {
    return <PageLoadingSpinner />;
  }

  return (
    <IntroLayout>
      {/* 헤더 섹션 */}
      <div className="px-12 py-8">
        <AuthHeader />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#1D1D1F]/10" />

      {/* 액션 섹션 */}
      <div className="px-12 pb-4 pt-8">
        {!isAuthenticated ? (
          <LoginSection onLogin={handleGoogleLogin} />
        ) : (
          <LogoutSection userEmail={user?.email} onLogout={handleLogout} />
        )}
      </div>
    </IntroLayout>
  );
};

// 로그인 섹션 컴포넌트
interface LoginSectionProps {
  onLogin: () => void;
}

const LoginSection: React.FC<LoginSectionProps> = ({ onLogin }) => (
  <div className="flex justify-center">
    <GoogleButton onClick={onLogin} text="Google 계정으로 계속하기" />
  </div>
);

// 로그아웃 섹션 컴포넌트
interface LogoutSectionProps {
  userEmail?: string;
  onLogout: () => void;
}

const LogoutSection: React.FC<LogoutSectionProps> = ({ userEmail, onLogout }) => (
  <div className="flex flex-col items-center">
    <GoogleButton onClick={onLogout} text="로그아웃하기" />
    <p className="mt-2.5 font-pretendard text-xs font-normal leading-[1.2] text-[#181818] opacity-50 transition-all duration-200 peer-hover:text-[#FF7800] peer-hover:opacity-100 lg:text-sm">
      계정 : {userEmail || '사용자'}
    </p>
  </div>
);

export default AuthPage;
