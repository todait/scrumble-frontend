'use client';

import { Suspense } from 'react';
import { AuthPage } from '@/features/auth/pages';
import { LoadingScreen } from '@/shared/components/feedback';

/**
 * Auth 라우트 페이지
 * 실제 로직은 AuthPage 컴포넌트에서 처리
 */
export default function AuthPageRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthPage />
    </Suspense>
  );
}