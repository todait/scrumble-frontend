'use client';

import { ProfileImage } from '@/shared/components/ui';
import type { NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface EmojiReactionItemProps {
  notification: NotificationDTO;
  onClick?: () => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const EmojiReactionItem = memo(function EmojiReactionItem({
  notification,
  onClick,
}: EmojiReactionItemProps) {
  const { relatedUser, content, createdAt, isRead, payload } = notification;

  return (
    <div
      className={`group relative min-h-[80px] cursor-pointer touch-manipulation bg-white p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 md:p-[30px] ${
        !isRead ? 'border-l-4 border-l-[#9747FF]' : ''
      }`}
      onClick={onClick}
    >
      {/* 읽지 않음 표시 */}
      {!isRead && <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#9747FF]" />}

      <div className="flex gap-3 md:gap-[10px]">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={relatedUser?.avatarUrl || ''}
            alt={relatedUser?.name || '사용자'}
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
                  {relatedUser?.name || '사용자'}
                </span>
                <span className="text-xs text-[#666666] md:text-sm">
                  님이 이모지로 반응했습니다
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs">{payload?.emoji || '👍'}</span>
                  <span className="text-xs font-medium text-[#666666]">반응</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>

            {/* 이모지 표시 */}
            <div className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-[#F8F9FA] p-2">
              <span className="text-base md:text-lg">{payload?.emoji || '👍'}</span>
            </div>
          </div>

          {/* 원본 포스트 내용 */}
          {payload?.targetPost?.content && (
            <div className="mb-2 rounded-lg border border-[#E5E7EB] bg-white p-2 md:p-3">
              <div className="mb-1 flex items-center gap-1">
                <span className="text-xs text-[#999999]">반응한 포스트</span>
              </div>
              <p className="text-xs leading-relaxed text-[#666666] md:text-sm">
                {truncateText(payload.targetPost.content, 100)}
              </p>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#9747FF]">포스트 확인하기</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { EmojiReactionItem };
