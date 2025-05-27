'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/shared/hooks/useAuth';
import { startGoogleOAuth } from '@/shared/lib/api';

const AuthPage = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  const handleGoogleLogin = () => {
    try {
      startGoogleOAuth();
    } catch (error) {
      console.error('Google login error:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7800] mx-auto mb-4"></div>
          <p className="text-[#181818] opacity-70">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 좌측 입력 폼 섹션 */}
      <div className="flex-1 lg:w-2/3 bg-[#FBFBFB] flex items-center lg:items-start justify-center lg:pt-[27vh]">
        <div className="w-full px-6 lg:px-20 py-8 lg:py-0">
          {/* 메인 타이틀 */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-[48px] font-bold leading-[1.5] text-[#181818] font-pretendard">
              Scrumble,<br />
              팀워크의 온도를 지키는 법
            </h1>
          </div>

          {/* 서브 타이틀 */}
          <div className="mb-8">
            <p className="text-lg lg:text-[24px] font-normal leading-[1.6] text-[#181818] font-pretendard">
              작은 연결에서 시작하는 좋은 팀워크.<br />
              더 유연한 팀워크의 리듬, 직접 경험해보세요.
            </p>
          </div>

          {/* 구글 로그인/로그아웃 버튼 섹션 */}
          <div>
            {!isAuthenticated ? (
              <div>
                {/* 로그인 버튼 */}
                <button
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2.5 px-5 py-5 bg-white border border-[rgba(24,24,24,0.2)] rounded-xl hover:bg-[#181818] active:bg-[#181818] transition-all duration-200 group peer"
                >
                  {/* 구글 아이콘 */}
                  <div className="w-6 h-6 flex-shrink-0">
                    {/* 기본 상태: 컬러 구글 아이콘 */}
                    <FcGoogle size={24} className="group-hover:hidden group-active:hidden" />
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
                  <span className="text-lg lg:text-[20px] font-normal leading-[1.2] text-[#181818] group-hover:text-white group-active:text-white font-pretendard transition-colors duration-200">
                    구글 계정으로 계속하기
                  </span>
                </button>

                {/* 안내 텍스트 */}
                <p className="text-sm lg:text-base font-normal leading-[1.2] text-[#181818] opacity-50 peer-hover:text-[#FF7800] peer-hover:opacity-100 font-pretendard mt-2.5 transition-all duration-200">
                  간편하게 Google 계정으로 시작하세요
                </p>
              </div>
            ) : (
              <div>
                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2.5 px-5 py-5 bg-white border border-[rgba(24,24,24,0.2)] rounded-xl hover:bg-[#181818] active:bg-[#181818] transition-all duration-200 group peer"
                >
                  {/* 구글 아이콘 */}
                  <div className="w-6 h-6 flex-shrink-0">
                    {/* 기본 상태: 컬러 구글 아이콘 */}
                    <FcGoogle size={24} className="group-hover:hidden group-active:hidden" />
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
                  <span className="text-lg lg:text-[20px] font-normal leading-[1.2] text-[#181818] group-hover:text-white group-active:text-white font-pretendard transition-colors duration-200">
                    로그아웃하기
                  </span>
                </button>

                {/* 계정 정보 */}
                <p className="text-sm lg:text-base font-normal leading-[1.2] text-[#181818] opacity-50 peer-hover:text-[#FF7800] peer-hover:opacity-100 font-pretendard mt-2.5 transition-all duration-200">
                  계정 : {user?.email || '사용자'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측 이미지 섹션 */}
      <div className="hidden lg:block w-1/3 h-screen bg-white relative overflow-hidden">
        {/* 텍스처 배경 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* 그라데이션 원형 요소들 - 로그인 상태에 따라 다른 색상 */}
        {!isAuthenticated ? (
          // 로그인 전: 오렌지 계열 그라데이션
          <div className="absolute -left-[181px] top-[127px] w-[493px] h-[769px]">
            {/* 첫 번째 원형 그라데이션 */}
            <div 
              className="absolute top-0 left-0 w-[493px] h-[493px] rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 0, 0, 0) 0%, rgba(255, 88, 41, 1) 100%)',
                filter: 'blur(200px)',
              }}
            />
            
            {/* 두 번째 사각형 그라데이션 */}
            <div 
              className="absolute left-[128px] top-[216px] w-[237px] h-[553px]"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 151, 23, 0) 0%, rgba(255, 151, 23, 1) 100%)',
                filter: 'blur(200px)',
              }}
            />
          </div>
        ) : (
          // 로그인 후: 블루-핑크 계열 그라데이션
          <div className="absolute -left-[340px] top-[-217px] w-[811px] h-[1557px]">
            {/* 첫 번째 큰 원형 그라데이션 */}
            <div 
              className="absolute top-0 left-0 w-[811px] h-[811px] rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 194, 255, 0) 0%, rgba(255, 41, 195, 1) 92.31%)',
                filter: 'blur(200px)',
              }}
            />
            
            {/* 두 번째 작은 원형 그라데이션 */}
            <div 
              className="absolute left-[159px] top-[344px] w-[493px] h-[493px] rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 194, 255, 0) 0%, rgba(255, 41, 195, 1) 92.31%)',
                filter: 'blur(200px)',
              }}
            />
            
            {/* 세 번째 사각형 그라데이션 */}
            <div 
              className="absolute left-[287px] top-[560px] w-[237px] h-[997px]"
              style={{
                background: 'linear-gradient(180deg, rgba(24, 75, 255, 0) 0%, rgba(23, 74, 255, 1) 100%)',
                filter: 'blur(200px)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
