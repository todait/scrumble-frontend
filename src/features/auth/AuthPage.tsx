'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { useToast } from '@/shared/hooks/useToast';
import { startGoogleOAuth } from '@/shared/lib/api';
import { 
  GoogleButton, 
  LoadingScreen, 
  GradientBackground, 
  AuthHeader 
} from './components';

const AuthPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { error } = useToast();

  // 로그인된 상태면 workspace 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/workspace/create');
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
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 좌측 입력 폼 섹션 */}
      <div className="flex-1 lg:w-2/3 bg-[#FBFBFB] flex items-center lg:items-start justify-center lg:pt-[27vh]">
        <div className="w-full px-6 lg:px-20 py-8 lg:py-0">
          <AuthHeader />

          {/* 구글 로그인/로그아웃 버튼 섹션 */}
          <div>
            {!isAuthenticated ? (
              <LoginSection onLogin={handleGoogleLogin} />
            ) : (
              <LogoutSection 
                userEmail={user?.email} 
                onLogout={handleLogout} 
              />
            )}
          </div>
        </div>
      </div>

      {/* 우측 이미지 섹션 */}
      <GradientBackground isAuthenticated={isAuthenticated} />
    </div>
  );
};

// 로그인 섹션 컴포넌트
interface LoginSectionProps {
  onLogin: () => void;
}

const LoginSection: React.FC<LoginSectionProps> = ({ onLogin }) => (
  <div>
    <GoogleButton 
      onClick={onLogin}
      text="구글 계정으로 계속하기"
    />
    <p className="text-sm lg:text-base font-normal leading-[1.2] text-[#181818] opacity-50 peer-hover:text-[#FF7800] peer-hover:opacity-100 font-pretendard mt-2.5 transition-all duration-200">
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
    <GoogleButton 
      onClick={onLogout}
      text="로그아웃하기"
    />
    <p className="text-sm lg:text-base font-normal leading-[1.2] text-[#181818] opacity-50 peer-hover:text-[#FF7800] peer-hover:opacity-100 font-pretendard mt-2.5 transition-all duration-200">
      계정 : {userEmail || '사용자'}
    </p>
  </div>
);

export default AuthPage;