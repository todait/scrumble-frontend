'use client';

import { ProfileImage, StatusBadge } from '@/shared/components/ui';
import type { CheckOutPostNotificationPayload, NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface CheckOutPostItemProps {
  notification: NotificationDTO<CheckOutPostNotificationPayload>;
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const CheckOutPostItem = memo(function CheckOutPostItem({
  notification,
  onClick,
  tabIndex = 0,
  role = 'button',
  'aria-label': ariaLabel,
  onKeyDown,
  ...props
}: CheckOutPostItemProps) {
  const { createdAt, isRead, payload } = notification;
  const { author, content } = payload;

  return (
    <div
      className={`group relative min-h-[80px] cursor-pointer touch-manipulation bg-white p-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2 active:bg-gray-100 md:p-[30px] ${
        !isRead ? 'border-l-4 border-l-[#9747FF]' : ''
      }`}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel || `${author?.name || '사용자'}님의 체크아웃 알림`}
      onKeyDown={onKeyDown}
      {...props}
    >
      {/* 읽지 않음 표시 */}
      {!isRead && (
        <div
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#9747FF]"
          aria-label="읽지 않은 알림"
          role="status"
        />
      )}

      <div className="flex gap-3 md:gap-[10px]">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={author?.avatarUrl || ''}
            alt={author?.name || '사용자'}
            size={32}
            className="h-8 w-8 md:h-10 md:w-10"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 헤더 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#222222] md:text-base">
                  {author?.name || '사용자'}
                </span>
                <span className="text-xs text-[#666666] md:text-sm">님이 체크아웃했습니다</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <StatusBadge type="checkout" className="text-xs" />
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>

            {/* 체크아웃 아이콘 */}
            <div className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full bg-[#EF4444] p-2">
              <span className="text-xs font-bold text-white">✓</span>
            </div>
          </div>

          {/* 포스트 내용 */}
          {content && (
            <div className="mb-2 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
              <p className="text-xs leading-relaxed text-[#222222] md:text-sm">
                {truncateText(content, 150)}
              </p>
            </div>
          )}

          {/* 할일 완료 정보 */}
          {payload?.completedTodos && payload.completedTodos > 0 && (
            <div className="mb-2 rounded-lg border border-[#E5E7EB] bg-white p-2 md:p-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#10B981]">✓</span>
                <span className="text-xs text-[#666666]">
                  {payload.completedTodos}개의 할일을 완료했습니다
                </span>
              </div>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#EF4444]">체크아웃 완료</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { CheckOutPostItem };
