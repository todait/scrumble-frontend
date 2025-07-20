'use client';

import { cn } from '@/shared/utils';

interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

function NotificationItemSkeleton({ index }: { index: number }) {
  // 인덱스 기반으로 다양성 제공 (하이드레이션 안전)
  const showTargetPost = index % 2 === 0; // 짝수 인덱스에서 대상 포스트 표시
  const showUnreadDot = index % 3 === 0; // 3의 배수 인덱스에서 읽지 않음 표시
  
  return (
    <div className="group relative min-h-[74px] bg-white px-7 py-4">
      <div className="flex items-center gap-3 md:gap-[20px]">
        {/* 프로필 이미지 스켈레톤 */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 상단 설명 스켈레톤 */}
          <div className="pb-1">
            <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          
          {/* 메인 콘텐츠 스켈레톤 */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            {/* 두 번째 줄 (일부 아이템만) */}
            {showTargetPost && (
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            )}
          </div>
        </div>

        {/* 시간 스켈레톤 */}
        <div className="flex-shrink-0">
          <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* 읽지 않음 표시 스켈레톤 (인덱스 기반으로 표시) */}
      {showUnreadDot && (
        <div className="absolute right-7 top-4 h-2 w-2 animate-pulse rounded-full bg-[#9747FF]" />
      )}
    </div>
  );
}

export function NotificationSkeleton({ count = 5, className }: NotificationSkeletonProps) {
  return (
    <div className={cn('divide-y divide-black/8', className)}>
      {Array.from({ length: count }, (_, index) => (
        <NotificationItemSkeleton key={index} index={index} />
      ))}
    </div>
  );
}