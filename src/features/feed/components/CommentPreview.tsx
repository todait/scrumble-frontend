'use client';

import { ProfileImage } from '@/shared/components/ui';
import { map, pipe, reverse, take, toArray, uniqBy } from '@fxts/core';
import { RiArrowRightSLine } from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

interface CommentPreviewProps {
  postId: string;
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: Date;
  onCommentClick?: (postId: string) => void;
  className?: string;
}

export function CommentPreview({
  postId,
  comments,
  commentCount,
  lastCommentTime,
  onCommentClick,
  className = '',
}: CommentPreviewProps) {
  if (commentCount === 0) return null;
  const uniqueAuthors = pipe(
    comments,
    reverse,
    uniqBy(comment => comment.author.id),
    take(5),
    map(comment => comment.author),
    toArray
  );

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        onCommentClick?.(postId);
      }}
      className={`group/comment flex h-10 items-center gap-2 rounded-lg bg-white px-2 ${className}`}
    >
      {/* 최근 댓글 작성자들의 프로필 이미지 */}
      <div className="flex gap-1">
        {uniqueAuthors.map((author, index) => (
          <ProfileImage
            key={`${postId}-comment-${author.id}-${index}`}
            src={author.profileImage}
            alt={author.name}
            size={32}
            className="bg-white"
          />
        ))}
      </div>

      {/* 댓글 수 */}
      <span className="text-sm leading-[1.5] text-[#222222] opacity-80 md:text-[13px]">
        {commentCount}개의 댓글
      </span>

      {/* 마지막 댓글 시간 / 보기 텍스트 */}
      {lastCommentTime && (
        <>
          <span className="text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:hidden md:text-[13px]">
            {formatDistanceToNow(lastCommentTime, { addSuffix: true, locale: ko })}
          </span>
          <span className="hidden text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:block md:text-[13px]">
            보기
          </span>
        </>
      )}

      {/* 화살표 아이콘 */}
      <RiArrowRightSLine className="ml-auto h-4 w-4 text-[#222222] opacity-0 transition-opacity group-hover:opacity-60" />
    </button>
  );
}
