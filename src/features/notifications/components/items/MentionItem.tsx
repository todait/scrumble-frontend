'use client';

import { ProfileImage } from '@/shared/components/ui';
import type { NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface MentionItemProps {
  notification: NotificationDTO;
  onClick?: () => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const MentionItem = memo(function MentionItem({ notification, onClick }: MentionItemProps) {
  const { createdAt, isRead, payload } = notification;
  // 임시 처리: payload에서 데이터 추출
  const relatedUser = payload?.relatedUser || payload?.author;
  const content = payload?.content;

  const getContextLabel = () => {
    const contextType = payload?.context?.type;
    switch (contextType) {
      case 'post':
        return '포스트에서';
      case 'comment':
        return '댓글에서';
      default:
        return '에서';
    }
  };

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
                <span className="text-xs text-[#666666] md:text-sm">님이 당신을 멘션했습니다</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs text-[#666666]">@</span>
                  <span className="text-xs font-medium text-[#666666]">멘션</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>

            {/* 멘션 아이콘 */}
            <div className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-[#9747FF] p-2">
              <span className="text-sm font-bold text-white">@</span>
            </div>
          </div>

          {/* 멘션 내용 */}
          <div className="mb-3 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
            <div className="mb-1 flex items-center gap-1">
              <span className="text-xs text-[#666666]">{getContextLabel()}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#222222] md:text-sm">
              {truncateText(content, 150)}
            </p>
          </div>

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#9747FF]">
              {payload?.context?.type === 'post' ? '포스트 확인하기' : '댓글 확인하기'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { MentionItem };
