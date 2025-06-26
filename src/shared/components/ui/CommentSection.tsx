'use client';

import type { Comment } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { EditDeleteMenu } from './EditDeleteMenu';
import { ImageGallery } from './ImageGallery';
import { ProfileImage } from './ProfileImage';

interface CommentSectionProps {
  comments: Comment[];
  commentCount: number;
  className?: string;
  containerRef?: ForwardedRef<HTMLDivElement>;
  renderComment?: (comment: Comment, index: number) => ReactNode;
  onCommentEdit?: (commentId: string) => void;
  onCommentDelete?: (commentId: string) => void;
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  ({ comments, commentCount, className = '', renderComment, onCommentEdit, onCommentDelete }, ref) => {
    if (commentCount === 0) {
      return null;
    }

    const uniqueComments = comments.filter((comment, index, array) => {
      return array.findIndex(c => c.id === comment.id) === index;
    });

    return (
      <div ref={ref} className={`px-4 pb-6 md:px-[30px] md:pb-[30px] ${className}`}>
        <CommentDivider count={commentCount} />
        <div className="space-y-4">
          {uniqueComments.map((comment, index) =>
            renderComment ? (
              renderComment(comment, index)
            ) : (
              <CommentItem
                key={comment.id}
                comment={comment}
                onEdit={onCommentEdit ? () => onCommentEdit(comment.id) : undefined}
                onDelete={onCommentDelete ? () => onCommentDelete(comment.id) : undefined}
              />
            )
          )}
        </div>
      </div>
    );
  }
);

CommentSection.displayName = 'CommentSection';

interface CommentDividerProps {
  count: number;
}

function CommentDivider({ count }: CommentDividerProps) {
  return (
    <div className="relative -mx-4 flex items-center py-4 md:-mx-[30px]">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[rgba(34,34,34,0.08)]"></div>
      </div>
      <div className="relative ml-3 bg-white px-2 md:ml-[18px] md:px-3">
        <span className="text-xs font-medium text-[#222222] opacity-40 md:text-[11px]">댓글 {count}</span>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CommentItem({ comment, className = '', onEdit, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const isMyComment = user?.id === comment.author.id;
  

  return (
    <div className={`group relative flex gap-3 overflow-visible ${className}`}>
      <ProfileImage
        src={comment.author.profileImage}
        alt={comment.author.name}
        size={32}
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-bold text-[#222222] md:text-[14px]">{comment.author.name}</span>
          <span className="text-xs text-[#222222] opacity-40 md:text-[13px]">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
          </span>
        </div>
        <p className="text-sm text-[#222222] md:text-[14px]">{comment.content}</p>
        {comment.images && comment.images.length > 0 && <ImageGallery images={comment.images} className="mt-2" />}
      </div>
      
      {/* 내 댓글일 때 수정/삭제 메뉴 */}
      {isMyComment && onEdit && onDelete && (
        <EditDeleteMenu
          onEdit={onEdit}
          onDelete={onDelete}
          variant="comment"
        />
      )}
    </div>
  );
}