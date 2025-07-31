'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { IntroLayout } from '@/shared/components/layout';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useMySpaces } from '@/shared/hooks/queries/useSpaces';
import { useToast } from '@/shared/hooks/useToast';
import { CreateSpaceButton, LogoutButton, SpaceListHeader } from '../components';
import { SpaceList } from '../components/SpaceList';

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
      <IntroLayout width={640}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
        </div>
      </IntroLayout>
    );
  }

  if (error) {
    return (
      <IntroLayout width={640}>
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
    <IntroLayout width={640}>
      {/* 헤더 섹션 */}
      <div className="px-12 py-8">
        <SpaceListHeader />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#1D1D1F]/10" />

      {/* 스페이스 목록 섹션 */}
      <div className="px-12 py-8">
        <SpaceList spaces={spaces} />
      </div>

      {/* 액션 섹션 */}
      <div className="px-12 pb-4 pt-2">
        <div className="flex flex-col items-center gap-4">
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
          <div className="-b-2 h-12 w-12 animate-spin rounded-full border border-[#FF7800]"></div>
        </div>
      }
    >
      <SpaceListContent />
    </Suspense>
  );
};

export default SpaceListPage;
