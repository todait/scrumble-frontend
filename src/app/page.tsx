'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useMySpaces } from '@/shared/hooks/queries/useSpaces';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useComponentLoading } from '@/shared/contexts/GlobalLoadingContext';
import { LandingPage } from '@/features/landing/pages';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, isInitialized } = useAuth();
  // 인증된 사용자만 스페이스 목록을 가져옴
  const { data: spacesData, isLoading: isSpacesLoading } = useMySpaces({ 
    enabled: isAuthenticated && isInitialized 
  });
  const { startLoading, stopLoading } = useComponentLoading('home-redirect');
  const latestSpaceSlug = useAuthStore((state) => state.latestSpaceSlug);

  useEffect(() => {
    // 인증되지 않았거나 초기화 중이면 리다이렉트 하지 않음
    if (!isInitialized || !isAuthenticated || isAuthLoading || isSpacesLoading) return;

    // 인증된 사용자만 리다이렉트
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
  }, [router, spacesData?.spaces, isAuthLoading, isSpacesLoading, latestSpaceSlug, isAuthenticated, isInitialized]);

  // 초기화 중이거나 인증 로딩 중일 때
  if (!isInitialized || isAuthLoading) {
    return null; // 전역 로딩이 처리함
  }

  // 인증되지 않은 사용자에게는 랜딩페이지 표시
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // 인증된 사용자는 리다이렉트 중 (null 반환)
  return null;
}
