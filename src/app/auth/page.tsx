'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

import AuthPage from '@/features/auth/pages/AuthPage';
import { LoadingScreen } from '@/shared/components/feedback';
import { useToast } from '@/shared/hooks/useToast';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const { error } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const message = searchParams.get('message');

    // 이미 토스트를 표시했으면 다시 표시하지 않음
    if (hasShownToast.current) return;

    if (authStatus === 'error') {
      hasShownToast.current = true;
      error({
        title: '로그인 실패',
        message: message ? decodeURIComponent(message) : '로그인 중 오류가 발생했습니다.',
      });
      
      // URL 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, error]);

  return <AuthPage />;
}

export default function AuthPageRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthPageContent />
    </Suspense>
  );
}