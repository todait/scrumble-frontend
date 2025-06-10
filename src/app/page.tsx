'use client';

import { withAuth } from '@/shared/components/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Home() {
  const router = useRouter();

  useEffect(() => {
    // 인증된 사용자는 welcome 페이지로 리다이렉트
    router.push('/temp-space-id/feed');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
    </div>
  );
}

export default withAuth(Home);
