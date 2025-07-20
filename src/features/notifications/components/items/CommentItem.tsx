'use client';

import { ProfileImage } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { CommentNotificationPayload, NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface CommentItemProps {
  notification: NotificationDTO<CommentNotificationPayload>;
  onClick?: () => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const CommentItem = memo(function CommentItem({ notification, onClick }: CommentItemProps) {
  const { latestSpace } = useAuth();
  const { createdAt, isRead, payload } = notification;
  const { post, comment } = payload;

  if (!comment) return null;

  return (
    <div
      className={`group relative min-h-[74px] cursor-pointer touch-manipulation px-7 py-4 transition-colors hover:bg-[#1D1D1F]/[0.02] ${!isRead ? 'bg-[#9747FF]/[0.02]' : 'bg-white hover:bg-gray-50 active:bg-gray-100'} `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 md:gap-[20px]">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={comment.author.avatarURL || ''}
            alt={comment.author.name}
            size={40}
            variant="circle"
            className="h-10 w-10"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          <div className="pb-1 text-[12px] font-semibold text-[#6E6E73] text-opacity-50">
            #{post.author.id === latestSpace?.memberId ? '나' : post.author.name}님의{' '}
            {post.postType === 'check_in' ? '체크인' : '체크아웃'}
          </div>
          <div className="text-[13px] text-[#1D1D1F]">
            <span className="font-semibold">{comment.author.name}</span>님의 댓글:{' '}
            <span className="text-[#6E6E73]">{truncateText(comment.content || '', 150)}</span>
          </div>
        </div>

        {/* 시간 정보 */}
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
        </div>
      </div>
    </div>
  );
});

export { CommentItem };
