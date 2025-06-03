'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingScreen } from '@/shared/components/feedback';
import { useAuth } from '@/shared/hooks';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/auth');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <LoadingScreen message="로딩 중..." />;
    }

    if (!isAuthenticated) {
      return <LoadingScreen message="리다이렉트 중..." />;
    }

    return <Component {...props} />;
  };
}