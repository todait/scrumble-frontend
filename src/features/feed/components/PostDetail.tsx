'use client';

import { CommentSection, DeleteConfirmDialog } from '@/shared/components/ui';
import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/shared/hooks/queries/useComments';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { RiCloseLine } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Post } from '../types/feed.types';
import { CommentInput } from './CommentInput';
import { PostContent } from './PostContent';

interface PostDetailProps {
  spaceSlug: string;
  post: Post;
  onClose: () => void;
  onReaction?: (postId: string, emoji: string) => void;
  onDeleteDialogChange?: (isOpen: boolean) => void;
}

export function PostDetail({
  spaceSlug,
  post,
  onClose,
  onReaction,
  onDeleteDialogChange,
}: PostDetailProps) {
  const isCheckIn = post.type === 'checkin';
  const commentInputRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const commentsParam = searchParams.get('comments');
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment(spaceSlug);
  const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment(spaceSlug);
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment(spaceSlug);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const prevCommentCountRef = useRef(post.commentCount);

  // WebSocket 구독은 이제 FeedPage에서 전역적으로 관리됩니다

  // 실시간 댓글 추가 시 자동 스크롤
  useEffect(() => {
    // 댓글 수가 증가했을 때만 스크롤 (실시간 댓글 추가 감지)
    if (post.commentCount > prevCommentCountRef.current) {
      setTimeout(() => {
        if (scrollableAreaRef.current) {
          // 부드러운 스크롤로 최하단 이동
          scrollableAreaRef.current.scrollTo({
            top: scrollableAreaRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 150); // DOM 업데이트와 렌더링 완료 후 스크롤
    }

    // 현재 댓글 수를 저장
    prevCommentCountRef.current = post.commentCount;
  }, [post.commentCount]);

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

  const handleCommentEdit = (commentId: string) => {
    // 편집 모드 전환 (이미 편집 중이면 종료)
    setEditingCommentId(prev => (prev === commentId ? null : commentId));
  };

  const handleCommentUpdate = (commentId: string, content: string, images: ImageMetadata[]) => {
    updateComment(
      {
        commentId,
        postId: post.id,
        content,
        images,
      },
      {
        onSuccess: () => {
          // 수정 성공 시 편집 모드 종료
          setEditingCommentId(null);
        },
        onError: error => {
          console.error('댓글 수정 오류:', error);
          alert('댓글 수정에 실패했습니다.');
        },
      }
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setSelectedCommentId(commentId);
    setDeleteDialogOpen(true);
    onDeleteDialogChange?.(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCommentId) {
      deleteComment(
        { commentId: selectedCommentId, postId: post.id },
        {
          onSettled: () => {
            setDeleteDialogOpen(false);
            setSelectedCommentId(null);
            onDeleteDialogChange?.(false);
          },
        }
      );
    }
  };

  const handleCommentSubmit = (content: string, images: ImageMetadata[]) => {
    createComment(
      {
        postId: post.id,
        content,
        images,
      },
      {
        onSuccess: () => {
          // 1. 댓글 제출 성공 후 textarea에 다시 포커스
          setTimeout(() => {
            const textarea = commentInputRef.current?.querySelector('textarea');
            if (textarea) {
              textarea.focus();
            }
          }, 100);

          // 2. 부드러운 스크롤로 맨 아래로 이동
          setTimeout(() => {
            if (scrollableAreaRef.current) {
              scrollableAreaRef.current.scrollTo({
                top: scrollableAreaRef.current.scrollHeight,
                behavior: 'smooth',
              });
            }
          }, 200); // 댓글이 DOM에 추가된 후 스크롤하기 위해 약간의 지연
        },
      }
    );
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
        <CommentSection
          ref={commentsContainerRef}
          comments={post.comments}
          commentCount={post.commentCount}
          postId={post.id}
          onCommentEdit={handleCommentEdit}
          onCommentDelete={handleCommentDelete}
          onCommentUpdate={handleCommentUpdate}
          editingCommentId={editingCommentId}
          isUpdating={isUpdatingComment}
        />
      </div>

      {/* 댓글 입력 영역 */}
      <div ref={commentInputRef} className="bg-white px-4 pb-4 pt-2 md:px-[30px] md:pb-5">
        <CommentInput
          authorName={post.author.name}
          onSubmit={handleCommentSubmit}
          isSubmitting={isCreatingComment}
        />
      </div>

      {/* 댓글 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCommentId(null);
          onDeleteDialogChange?.(false);
        }}
        onConfirm={handleConfirmDelete}
        title="댓글을 삭제하시겠어요?"
        description="삭제한 댓글은 복원할 수 없습니다"
        confirmText="삭제"
        isLoading={isDeletingComment}
      />
    </div>
  );
}
