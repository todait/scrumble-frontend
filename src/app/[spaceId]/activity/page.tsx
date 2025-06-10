'use client';

import { withAuth } from '@/shared/components/auth';
import { RiHeart3Fill } from '@remixicon/react';

interface ActivityPageProps {
  params: Promise<{ spaceId: string }>;
}

function ActivityPage({ params }: ActivityPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgba(151,71,255,0.08)]">
        <RiHeart3Fill className="h-10 w-10 text-[#9747FF]" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold text-[#222222]">활동</h1>
      <p className="mb-1 text-center text-[15px] text-[#222222] opacity-60">
        체크인/체크아웃 포스트의 댓글, 이모지, 투두 완성 확인
      </p>
      
      <div className="mt-8 rounded-lg bg-[rgba(151,71,255,0.04)] px-6 py-3">
        <p className="text-sm font-medium text-[#9747FF]">🚧 추후 개발 예정</p>
      </div>
    </div>
  );
}

export default withAuth(ActivityPage);