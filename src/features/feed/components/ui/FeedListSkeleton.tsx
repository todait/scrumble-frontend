'use client';

import { cn } from '@/shared/utils';

interface FeedListSkeletonProps {
  count?: number;
  className?: string;
}

function PostSkeleton() {
  return (
    <div className="group relative flex gap-[10px] bg-white p-[30px]">
      {/* 프로필 이미지 스켈레톤 */}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="min-w-0 flex-1 space-y-[10px]">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col justify-between" style={{ height: 40 }}>
            {/* 이름 스켈레톤 */}
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            
            {/* 타입과 시간 스켈레톤 */}
            <div className="flex items-center gap-1">
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          
          {/* 점수 배지 스켈레톤 (50% 확률로 표시) */}
          {Math.random() > 0.5 && (
            <div className="h-9 w-16 animate-pulse rounded border bg-gray-200" />
          )}
        </div>

        {/* 본문 스켈레톤 */}
        <div className="py-2 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>

        {/* 리액션 스켈레톤 */}
        <div className="flex items-center gap-2 py-2">
          <div className="h-7 w-12 animate-pulse rounded-full bg-gray-200" />
          <div className="h-7 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="h-7 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function FeedListSkeleton({ count = 5, className }: FeedListSkeletonProps) {
  return (
    <div className={cn('divide-y divide-black/8', className)}>
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}