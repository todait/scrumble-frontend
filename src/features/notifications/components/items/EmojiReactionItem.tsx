'use client';

import { ProfileImage } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import type {
  CommentReactionNotification,
  PostReactionNotification,
} from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';
import {
  getActionAuthorDisplayName,
  getAuthorDisplayName,
  getPostTypeDisplayName,
  truncateText,
} from '../../utils/notificationHelpers';

interface EmojiReactionItemProps {
  notification: PostReactionNotification | CommentReactionNotification;
  onClick?: () => void;
}

const EmojiReactionItem = memo(function EmojiReactionItem({
  notification,
  onClick,
}: EmojiReactionItemProps) {
  const { currentSpaceMember: member } = useAuth();
  const { createdAt, isRead, payload } = notification;
  const { reaction, post } = payload;

  if (!reaction) return null;

  // CommentReactionNotification인지 확인
  const isCommentReaction = 'comment' in payload && payload.comment;

  return (
    <div
      className={`group relative min-h-[74px] cursor-pointer touch-manipulation px-7 py-4 transition-colors hover:bg-[#1D1D1F]/[0.02] ${!isRead ? 'bg-[#9747FF]/[0.02]' : 'bg-white hover:bg-gray-50 active:bg-gray-100'} `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 md:gap-[20px]">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={reaction.author.avatarURL || ''}
            alt={reaction.author.name}
            size={40}
            variant="circle"
            className="h-10 w-10"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          <div className="pb-1 text-[12px] font-semibold text-[#6E6E73] text-opacity-50">
            {isCommentReaction && payload.comment ? (
              <>
                #
                {getAuthorDisplayName(
                  payload.comment.author.id,
                  payload.comment.author.name,
                  member?.id
                )}
                의 댓글: {truncateText(payload.comment.content || '', 50)}
              </>
            ) : (
              <>
                #{getAuthorDisplayName(post.author.id, post.author.name, member?.id)}의{' '}
                {getPostTypeDisplayName(post.postType)}
              </>
            )}
          </div>
          <div className="text-[13px] text-[#1D1D1F]">
            {getActionAuthorDisplayName(
              reaction.author.id,
              reaction.author.name,
              member?.id,
              '반응'
            )}
            : {reaction.content}
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

export { EmojiReactionItem };
