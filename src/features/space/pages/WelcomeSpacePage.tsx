'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { IntroLayout } from '@/shared/components/layout';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/hooks/useToast';
import { CreateSpaceButton, LogoutButton, WelcomeHeader } from '../components';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const { success, error } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    // 로그인 성공 토스트 및 알림 표시
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success' && !toastShownRef.current) {
      // URL 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());

      // 토스트를 한 번만 표시
      toastShownRef.current = true;
    }
  }, [searchParams]);

  const handleCreateSpace = () => {
    router.push('/temp-space-id/feed');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      success({
        title: '로그아웃 완료',
        message: '안전하게 로그아웃되었습니다.',
      });
      router.push('/auth');
    } catch {
      error({
        title: '로그아웃 실패',
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <IntroLayout>
      {/* 헤더 섹션 */}
      <div className="px-12 py-8">
        <WelcomeHeader />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#1D1D1F]/10" />

      {/* 액션 섹션 */}
      <div className="px-12 pb-4 pt-8">
        <div className="flex flex-col items-center gap-4">
          <CreateSpaceButton onClick={handleCreateSpace} />
          <LogoutButton onClick={handleLogout} isLoading={isLoggingOut} />
        </div>
      </div>

      {/* 초대코드 링크 */}
      <div className="px-12 pb-8 flex justify-end">
        <button
          onClick={() => router.push('/invite')}
          className="text-[13px] font-normal text-[#222222] opacity-50 hover:opacity-100 transition-opacity duration-200 font-pretendard"
        >
          초대코드로 입장하기
        </button>
      </div>
    </IntroLayout>
  );
}

const WelcomeSpacePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
};

export default WelcomeSpacePage;
