'use client';

import { useAuthCallback } from '../hooks';

/**
 * OAuth 콜백 처리를 위한 페이지 컴포넌트
 * 실제 로직은 useAuthCallback 훅에서 처리하고, 여기서는 로딩 UI만 제공
 */
export default function AuthCallbackPage() {
  const { isProcessing } = useAuthCallback();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
      <div className="text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
          <h2 className="mb-2 text-xl font-semibold text-[#181818]">
            {isProcessing ? '로그인 처리 중...' : '완료'}
          </h2>
          <p className="text-[#181818] opacity-70">
            {isProcessing ? '잠시만 기다려주세요.' : '로그인이 완료되었습니다.'}
          </p>
        </div>
      </div>
    </div>
  );
}