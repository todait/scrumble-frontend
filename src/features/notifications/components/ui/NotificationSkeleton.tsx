'use client';

import { cn } from '@/shared/utils';

interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

function NotificationItemSkeleton() {
  return (
    <div className="group relative flex gap-[10px] bg-white p-[30px]">
      {/* 프로필 이미지 스켈레톤 */}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
      </div>

      {/* 콘텐츠 영역 */}
      <div className="min-w-0 flex-1 space-y-[8px]">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col space-y-1">
            {/* 이름과 액션 스켈레톤 */}
            <div className="flex items-center gap-1">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
            
            {/* 타입 배지 스켈레톤 */}
            <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
          </div>
          
          {/* 시간 스켈레톤 */}
          <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
        </div>

        {/* 본문 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>

        {/* 대상 포스트 스켈레톤 (50% 확률로 표시) */}
        {Math.random() > 0.5 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        )}
      </div>

      {/* 읽지 않음 표시 스켈레톤 (30% 확률로 표시) */}
      {Math.random() > 0.7 && (
        <div className="absolute right-4 top-4 h-2 w-2 animate-pulse rounded-full bg-gray-200" />
      )}
    </div>
  );
}

export function NotificationSkeleton({ count = 5, className }: NotificationSkeletonProps) {
  return (
    <div className={cn('divide-y divide-black/8', className)}>
      {Array.from({ length: count }, (_, index) => (
        <NotificationItemSkeleton key={index} />
      ))}
    </div>
  );
}