'use client';

import React from 'react';

import { LoadingScreen } from '@/shared/components/feedback';
import { IntroLayout } from '@/shared/components/layout';
import { useAuth } from '@/shared/hooks/auth/useAuth';

import { AuthHeader, GoogleButton } from '../components';
import { useGoogleAuth, useAuthRedirect, useAuthErrorHandling } from '../hooks';

const AuthPage = () => {
  // 커스텀 훅들
  const { isAuthenticated, user, isLoading } = useAuth();
  const { handleGoogleLogin, handleLogout } = useGoogleAuth();
  const { isLoading: isRedirecting } = useAuthRedirect();
  
  // URL 파라미터로부터 에러 처리
  useAuthErrorHandling();

  // 로딩 중일 때 표시
  if (isLoading || isRedirecting) {
    return <LoadingScreen message="로딩 중..." />;
  }

  return (
    <IntroLayout>
      <AuthHeader />

      {/* 구글 로그인/로그아웃 버튼 섹션 */}
      <div>
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
  <div>
    <GoogleButton onClick={onLogin} text="구글 계정으로 계속하기" />
    <p className="mt-2.5 font-pretendard text-xs font-normal leading-[1.2] text-[#181818] opacity-50 transition-all duration-200 peer-hover:text-[#FF7800] peer-hover:opacity-100 lg:text-sm">
      간편하게 Google 계정으로 시작하세요
    </p>
  </div>
);

// 로그아웃 섹션 컴포넌트
interface LogoutSectionProps {
  userEmail?: string;
  onLogout: () => void;
}

const LogoutSection: React.FC<LogoutSectionProps> = ({ userEmail, onLogout }) => (
  <div>
    <GoogleButton onClick={onLogout} text="로그아웃하기" />
    <p className="mt-2.5 font-pretendard text-xs font-normal leading-[1.2] text-[#181818] opacity-50 transition-all duration-200 peer-hover:text-[#FF7800] peer-hover:opacity-100 lg:text-sm">
      계정 : {userEmail || '사용자'}
    </p>
  </div>
);

export default AuthPage;
