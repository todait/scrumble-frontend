'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { IntroLayout } from '@/shared/components/layout';
import { useAuth } from '@/shared/hooks';
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
      await logout();
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
      <div className="relative w-full">
        <WelcomeHeader />

        {/* 버튼 섹션 */}
        <div className="flex gap-[10px] pt-3">
          <CreateSpaceButton onClick={handleCreateSpace} />

          <LogoutButton onClick={handleLogout} isLoading={isLoggingOut} />
        </div>
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
