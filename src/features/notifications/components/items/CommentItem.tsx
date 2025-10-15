'use client';

import { ProfileImage } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { CommentNotificationPayload, NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { extractPlainText } from '@/shared/utils/tiptap.utils';
import { memo } from 'react';
import {
  getActionAuthorDisplayName,
  getAuthorDisplayName,
  getPostTypeDisplayName,
  truncateText,
} from '../../utils/notificationHelpers';

interface CommentItemProps {
  notification: NotificationDTO<CommentNotificationPayload>;
  onClick?: () => void;
}

const CommentItem = memo(function CommentItem({ notification, onClick }: CommentItemProps) {
  const { currentSpaceMember: member } = useAuth();
  const { createdAt, isRead, payload } = notification;
  const { post, comment } = payload;

  if (!comment) return null;

  // JSON → plainText 추출 후 truncate
  const commentText = extractPlainText(comment.contentJson, comment.content || '');

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
            #{getAuthorDisplayName(post.author.id, post.author.name, member?.id)}의{' '}
            {getPostTypeDisplayName(post.postType)}
          </div>
          <div className="text-[13px] text-[#1D1D1F]">
            {getActionAuthorDisplayName(comment.author.id, comment.author.name, member?.id, '댓글')}
            : <span className="text-[#6E6E73]">{truncateText(commentText, 150)}</span>
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
