'use client';

import { withAuth } from '@/shared/components/auth';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useComponentLoading } from '@/shared/contexts/GlobalLoadingContext';

function Home() {
  const router = useRouter();
  const { latestSpace, isLoading } = useAuth();
  const { startLoading, stopLoading } = useComponentLoading('home-redirect');

  useEffect(() => {
    // 로딩 중이면 기다림
    if (isLoading) return;

    // 리다이렉트 시작
    startLoading('리다이렉트 중...');

    const spaceSlug = latestSpace?.latestSpaceSlug;

    // 인증된 사용자는 latest space의 feed 페이지로 리다이렉트
    if (!spaceSlug) {
      router.push('/spaces/welcome');
    } else {
      router.push(`/${spaceSlug}/feed`);
    }
    
    // 리다이렉트 후 로딩 종료 (컴포넌트 언마운트 시 자동 정리됨)
    stopLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, latestSpace?.latestSpaceSlug, isLoading]);

  // 로딩 스피너 제거 - 전역 로딩이 처리함
  return null;
}

export default withAuth(Home);
