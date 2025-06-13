'use client';

import { withAuth } from '@/shared/components/auth';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Home() {
  const router = useRouter();
  const { latestSpace, isLoading } = useAuth();

  useEffect(() => {
    // 로딩 중이면 기다림
    if (isLoading) return;

    const spaceSlug = latestSpace?.latestSpaceSlug;

    // 인증된 사용자는 latest space의 feed 페이지로 리다이렉트
    if (!spaceSlug) {
      router.push('/spaces/welcome');
    } else {
      router.push(`/${spaceSlug}/feed`);
    }
  }, [router, latestSpace?.latestSpaceSlug, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FF7800]"></div>
    </div>
  );
}

export default withAuth(Home);
