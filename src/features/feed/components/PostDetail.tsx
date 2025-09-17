'use client';

import { WebSocketErrorBoundary } from '@/shared/components/ErrorBoundary';
import { CommentSection, DeleteConfirmDialog } from '@/shared/components/ui';
import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/shared/hooks/queries/useComments';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { debug as logDebug } from '@/shared/utils/debug';
import { RiCloseLine } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useScrollToHighlightedComment } from '../hooks';
import type { Post } from '../types/feed.types';
import { CommentInput } from './CommentInput';
import { PostContent } from './PostContent';

interface PostDetailProps {
  spaceSlug: string;
  post: Post;
  onClose: () => void;
  onReaction?: (postId: string, emoji: string) => void;
  onDeleteDialogChange?: (isOpen: boolean) => void;
  highlightedCommentId?: string | null;
}

export function PostDetail({
  spaceSlug,
  post,
  onClose,
  onReaction,
  onDeleteDialogChange,
  highlightedCommentId,
}: PostDetailProps) {
  const isCheckIn = post.type === 'checkin';
  const commentInputRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const commentsParam = searchParams.get('comments');
  const actionParam = searchParams.get('action') as 'scroll' | 'focus' | null;
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment();
  const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const prevCommentCountRef = useRef(post.commentCount);

  // PostDetail 독립적인 WebSocket 구독 (FeedPage 구독과 별개로 보장)
  // 이는 PostDetail이 열려있는 동안 항상 실시간 이벤트를 받을 수 있도록 보장합니다
  useEffect(() => {
    // PostDetail이 마운트될 때 해당 포스트에 대한 구독 요청
    // FeedPage에서 이미 구독 중이어도 중복 요청은 서비스 레벨에서 처리됨
    logDebug('PostDetail', 'Ensuring WebSocket subscription for post', { postId: post.id });
    
    // cleanup은 FeedPage의 effectiveVisiblePostIds에서 처리되므로 여기서는 추가 작업 불필요
  }, [post.id]);

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
    if (commentsParam && actionParam) {
      setTimeout(() => {
        if (actionParam === 'scroll') {
          // 최신 댓글 클릭 - 댓글 섹션 제일 아래로 스크롤
          if (scrollableAreaRef.current) {
            scrollableAreaRef.current.scrollTo({
              top: scrollableAreaRef.current.scrollHeight,
              behavior: 'instant',
            });
          }
        } else if (actionParam === 'focus') {
          // "남겨보세요" 클릭 - 댓글 입력창으로 스크롤 및 포커스
          if (scrollableAreaRef.current) {
            scrollableAreaRef.current.scrollTo({
              top: scrollableAreaRef.current.scrollHeight,
              behavior: 'instant',
            });
          }
          const textarea = commentInputRef.current?.querySelector('textarea');
          if (textarea) {
            textarea.focus();
          }
        }
      }, 100); // PostDetail 렌더링 완료 후 실행
    } else if (commentsParam) {
      // 기존 동작 - textarea 활성화만 수행
      setTimeout(() => {
        const commentInput = commentInputRef.current;
        const textarea = commentInput?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100); // PostDetail 렌더링 완료 후 실행
    }
  }, [commentsParam, actionParam]);

  // ESC 키 눌렀을 때 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 모달들이 capture phase에서 stopPropagation을 호출하므로
        // 여기까지 이벤트가 도달했다면 모달이 열려있지 않다는 의미
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey); // bubble phase에서 듣기
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // highlightedCommentId가 있을 때 해당 댓글로 스크롤
  useScrollToHighlightedComment({
    highlightedCommentId,
    scrollableAreaRef,
  });

  const handleCommentEdit = (commentId: string) => {
    // 편집 모드 전환 (이미 편집 중이면 종료)
    setEditingCommentId(prev => (prev === commentId ? null : commentId));
  };

  const handleCommentUpdate = (commentId: string, content: string, images: ImageMetadata[]) => {
    // Optimistic UI: 즉시 편집 모드 종료
    setEditingCommentId(null);

    updateComment(
      {
        commentId,
        postId: post.id,
        content,
        images,
      },
      {
        onError: error => {
          console.error('댓글 수정 오류:', error);
          // 에러 발생 시 편집 모드로 다시 돌아가기
          setEditingCommentId(commentId);
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
      // 즉시 다이얼로그 닫기 (optimistic update)
      setDeleteDialogOpen(false);
      setSelectedCommentId(null);
      onDeleteDialogChange?.(false);

      // 삭제 수행
      deleteComment(
        { commentId: selectedCommentId, postId: post.id },
        {
          onError: error => {
            console.error('댓글 삭제 오류:', error);
            // 에러 발생 시 사용자에게 알림 (토스트 메시지는 이미 mutation에서 처리됨)
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
    <WebSocketErrorBoundary>
      <div className="flex h-full min-h-[100dvh] flex-col overflow-hidden md:min-h-0">
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
        <div
          ref={scrollableAreaRef}
          className="flex-1 overflow-x-hidden overflow-y-auto pb-6 md:pb-10"
        >
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
            highlightedCommentId={highlightedCommentId}
          />
        </div>

        {/* 댓글 입력 영역 */}
        <div
          ref={commentInputRef}
          className="border-t border-[rgba(34,34,34,0.08)] bg-white px-4 pt-2 md:px-[30px]"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
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
    </WebSocketErrorBoundary>
  );
}
