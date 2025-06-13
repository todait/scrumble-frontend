'use client';

import { Suspense } from 'react';
import { AuthCallbackPage } from '@/features/auth/pages';

/**
 * OAuth 콜백 라우트 페이지
 * 실제 로직은 AuthCallbackPage 컴포넌트에서 처리
 */
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
    <div className="text-center">
      <div>
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
        <h2 className="mb-2 text-xl font-semibold text-[#181818]">로그인 처리 중...</h2>
        <p className="text-[#181818] opacity-70">잠시만 기다려주세요.</p>
      </div>
    </div>
  </div>
);

export default function AuthCallbackPageRoute() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackPage />
    </Suspense>
  );
}
