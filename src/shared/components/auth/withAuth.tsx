'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useComponentLoading } from '@/shared/contexts/GlobalLoadingContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading, isInitialized, isError } = useAuth();
    const { startLoading, stopLoading } = useComponentLoading('auth-check');
    const isLoadingRef = useRef(false);

    // 로딩 상태 관리 - 별도 useEffect
    useEffect(() => {
      const shouldShowLoading = !isInitialized || (isLoading && !isError);

      if (shouldShowLoading && !isLoadingRef.current) {
        isLoadingRef.current = true;
        startLoading('인증 확인 중...');
      } else if (!shouldShowLoading && isLoadingRef.current) {
        isLoadingRef.current = false;
        stopLoading();
      }
    }, [isInitialized, isLoading, isError, startLoading, stopLoading]);

    // 인증 체크 - 별도 useEffect
    useEffect(() => {
      if (isInitialized && (!isLoading || isError) && !isAuthenticated) {
        router.replace('/auth');
      }
    }, [isAuthenticated, isLoading, isInitialized, router, isError]);

    // 초기화 중이거나 로딩 중일 때 - 전역 로딩이 처리하므로 null 반환
    if (!isInitialized || (isLoading && !isError)) {
      return null;
    }

    // 인증되지 않은 경우 (리다이렉트 전)
    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
