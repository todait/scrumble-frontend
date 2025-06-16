'use client';

import { ImageGallery, ProfileImage } from '@/shared/components/ui';
import { RiCloseLine } from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { Post } from '../types/feed.types';
import { CommentInput } from './CommentInput';
import { PostContent } from './PostContent';

interface PostDetailProps {
  spaceSlug: string;
  post: Post;
  onClose: () => void;
  onReaction?: (postId: string, emoji: string) => void;
}

export function PostDetail({ spaceSlug, post, onClose, onReaction }: PostDetailProps) {
  const isCheckIn = post.type === 'checkin';
  const commentInputRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const commentsParam = searchParams.get('comments');

  useEffect(() => {
    if (commentsParam) {
      // textarea 활성화만 수행
      setTimeout(() => {
        const commentInput = commentInputRef.current;
        const textarea = commentInput?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100); // PostDetail 렌더링 완료 후 실행
    }
  }, [commentsParam]);

  // ESC 키 눌렀을 때 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleCommentSubmit = () => {
    // TODO: API 호출로 댓글 생성
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[rgba(34,34,34,0.08)] px-4 py-4 md:px-[30px] md:py-5">
        <h2 className="text-base font-bold text-[#222222] md:text-lg">
          {post.author.name}님의 {isCheckIn ? '체크인' : '체크아웃'}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[rgba(34,34,34,0.08)]"
        >
          <RiCloseLine className="h-5 w-5 text-[#222222]" />
        </button>
      </div>

      {/* 포스트 내용 */}
      <div ref={scrollableAreaRef} className="flex-1 overflow-y-auto">
        <PostContent
          spaceSlug={spaceSlug}
          post={post}
          isDetailView={true}
          onReaction={onReaction}
        />

        {/* 댓글 섹션 */}
        {post.commentCount > 0 && (
          <div ref={commentsContainerRef} className="overflow-hidden px-4 pb-6 md:px-[30px] md:pb-[30px]">
            {/* Divider with text */}
            <div className="relative -mx-4 flex items-center py-4 md:-mx-[30px]">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(34,34,34,0.08)]"></div>
              </div>
              <div className="relative ml-3 bg-white px-2 md:ml-[18px] md:px-3">
                <span className="text-xs font-medium text-[#222222] opacity-40 md:text-[11px]">
                  댓글 {post.commentCount}
                </span>
              </div>
            </div>
            <div className="space-y-4 overflow-hidden">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-3 overflow-hidden">
                  <ProfileImage
                    src={comment.author.profileImage}
                    alt={comment.author.name}
                    size={32}
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-[#222222] md:text-[14px]">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-[#222222] opacity-40 md:text-[13px]">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <p className="text-sm text-[#222222] md:text-[14px]">{comment.content}</p>
                    {/* 댓글 이미지 */}
                    {comment.images && comment.images.length > 0 && (
                      <ImageGallery images={comment.images} className="mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 댓글 입력 영역 */}
      <div ref={commentInputRef} className="bg-white px-4 pb-4 pt-2 md:px-[30px] md:pb-5">
        <CommentInput authorName={post.author.name} onSubmit={handleCommentSubmit} />
      </div>
    </div>
  );
}
