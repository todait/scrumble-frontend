'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/shared/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 모든 경우 /auth로 리다이렉트 (AuthPage에서 인증 상태 확인)
    router.push('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7800]"></div>
    </div>
  );
}
