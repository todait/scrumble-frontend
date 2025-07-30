'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { IntroLayout } from '@/shared/components/layout';
import { useMySpaces } from '@/shared/hooks/queries/useSpaces';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SpaceList } from '../components/SpaceList';
import { CreateSpaceButton, LogoutButton, WelcomeHeader } from '../components';

function SpaceListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: errorToast } = useToast();
  const { logout } = useAuth();
  const { data: spacesData, isLoading, error } = useMySpaces();
  const toastShownRef = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // 로그인 성공 토스트 표시
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success' && !toastShownRef.current) {
      // URL 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());

      // 토스트를 한 번만 표시
      toastShownRef.current = true;
      success({
        title: '로그인 성공',
        message: '스페이스 목록에서 참여할 스페이스를 선택해주세요.',
      });
    }
  }, [searchParams, success]);

  const handleCreateSpace = () => {
    router.push('/spaces/new');
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
      errorToast({
        title: '로그아웃 실패',
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <IntroLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
        </div>
      </IntroLayout>
    );
  }

  if (error) {
    return (
      <IntroLayout>
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-red-600">
            스페이스 목록을 불러오는데 실패했습니다
          </div>
          <div className="text-sm text-gray-600">잠시 후 다시 시도해주세요</div>
        </div>
      </IntroLayout>
    );
  }

  const spaces = spacesData?.spaces || [];

  return (
    <IntroLayout>
      <div className="relative w-full">
        <WelcomeHeader />

        {/* 스페이스 목록 섹션 */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">참여 중인 스페이스</h2>
            <span className="text-sm text-gray-500">{spaces.length}개</span>
          </div>

          <SpaceList spaces={spaces} />
        </div>

        {/* 버튼 섹션 */}
        <div className="mt-8 flex gap-[10px]">
          <CreateSpaceButton onClick={handleCreateSpace} />
          <LogoutButton onClick={handleLogout} isLoading={isLoggingOut} />
        </div>
      </div>
    </IntroLayout>
  );
}

const SpaceListPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
        </div>
      }
    >
      <SpaceListContent />
    </Suspense>
  );
};

export default SpaceListPage;
