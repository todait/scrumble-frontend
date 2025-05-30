'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 모든 경우 /auth로 리다이렉트 (AuthPage에서 인증 상태 확인)
    router.push('/spaces/welcome');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
    </div>
  );
}
