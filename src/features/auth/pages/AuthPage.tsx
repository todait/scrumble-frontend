'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { LoadingScreen } from '@/shared/components/feedback';
import { IntroLayout } from '@/shared/components/layout';
import { useAuth } from '@/shared/hooks/useAuth';
import { useToast } from '@/shared/hooks/useToast';
import { startGoogleOAuth } from '@/shared/lib/api';

import { AuthHeader, GoogleButton } from '../components';

const AuthPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { error } = useToast();

  // 로그인된 상태면 welcome 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/spaces/welcome');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGoogleLogin = () => {
    try {
      startGoogleOAuth();
    } catch (err) {
      console.error('Google login error:', err);
      error({
        title: '로그인 오류',
        message: '로그인을 시작할 수 없습니다. 다시 시도해주세요.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      error({
        title: '로그아웃 오류',
        message: '로그아웃 중 문제가 발생했습니다.',
      });
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
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
    <p className="mt-2.5 font-pretendard text-sm font-normal leading-[1.2] text-[#181818] opacity-50 transition-all duration-200 peer-hover:text-[#FF7800] peer-hover:opacity-100 lg:text-base">
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
    <p className="mt-2.5 font-pretendard text-sm font-normal leading-[1.2] text-[#181818] opacity-50 transition-all duration-200 peer-hover:text-[#FF7800] peer-hover:opacity-100 lg:text-base">
      계정 : {userEmail || '사용자'}
    </p>
  </div>
);

export default AuthPage;
