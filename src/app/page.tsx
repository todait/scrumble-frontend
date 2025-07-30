'use client';

import { withAuth } from '@/shared/components/auth';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useMySpaces } from '@/shared/hooks/queries/useSpaces';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useComponentLoading } from '@/shared/contexts/GlobalLoadingContext';

function Home() {
  const router = useRouter();
  const { isLoading: isAuthLoading } = useAuth();
  const { data: spacesData, isLoading: isSpacesLoading } = useMySpaces();
  const { startLoading, stopLoading } = useComponentLoading('home-redirect');
  const latestSpaceSlug = useAuthStore((state) => state.latestSpaceSlug);

  useEffect(() => {
    // 로딩 중이면 기다림
    if (isAuthLoading || isSpacesLoading) return;

    // 리다이렉트 시작
    startLoading('리다이렉트 중...');

    const spaces = spacesData?.spaces || [];

    // 스페이스 개수에 따라 라우팅 분기
    if (spaces.length === 0) {
      // 스페이스가 없으면 welcome 페이지로
      router.push('/spaces/welcome');
    } else if (latestSpaceSlug) {
      // 마지막 활동 스페이스가 있으면 해당 스페이스로
      router.push(`/${latestSpaceSlug}/feed`);
    } else {
      // 마지막 활동 스페이스가 없으면 스페이스 목록 페이지로
      router.push('/spaces/list');
    }

    // 리다이렉트 후 로딩 종료 (컴포넌트 언마운트 시 자동 정리됨)
    stopLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, spacesData?.spaces, isAuthLoading, isSpacesLoading, latestSpaceSlug]);

  // 로딩 스피너 제거 - 전역 로딩이 처리함
  return null;
}

export default withAuth(Home);
