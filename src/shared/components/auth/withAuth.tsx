'use client';

import { PageLoadingSpinner } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading, isInitialized, isError } = useAuth();

    useEffect(() => {
      // 초기화가 완료되고 로딩이 끝났을 때만 체크
      if (isInitialized && (!isLoading || isError) && !isAuthenticated) {
        router.replace('/auth');
      }
    }, [isAuthenticated, isLoading, isInitialized, router, isError]);

    // 초기화 중이거나 로딩 중일 때
    if (!isInitialized || (isLoading && !isError)) {
      return <PageLoadingSpinner />;
    }

    // 인증되지 않은 경우 (리다이렉트 전)
    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
