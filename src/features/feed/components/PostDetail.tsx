'use client';

import { WebSocketErrorBoundary } from '@/shared/components/ErrorBoundary';
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
  useEffect(() => {
    if (!highlightedCommentId) return;
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryScroll = () => {
      const element = document.getElementById(`comment-${highlightedCommentId}`);
      const container = scrollableAreaRef.current;
      
      
      if (element && container) {
        // 자식 요소가 있는지 확인
        const hasContent = element.children.length > 0 || (element.textContent?.trim()?.length ?? 0) > 0;
        if (!hasContent) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryScroll, 100); // 재시도 간격도 단축
          }
          return false;
        }
        
        // 모든 댓글 요소 찾기
        const allComments = container.querySelectorAll('[id^="comment-"]');
        let targetIndex = -1;
        allComments.forEach((el, index) => {
          if (el.id === `comment-${highlightedCommentId}`) {
            targetIndex = index;
          }
        });
        
        
        // PostContent의 높이 먼저 계산
        const postContent = container.querySelector('[class*="PostContent"]') || 
                          container.querySelector('.px-4.py-4') ||
                          container.firstElementChild;
        
        
        // 실제 요소의 offsetTop을 찾기 위해 다시 시도
        // container 내부의 모든 요소를 순회하며 offsetTop 누적
        let actualOffsetTop = 0;
        
        // PostContent까지의 높이
        if (postContent) {
          actualOffsetTop = (postContent as HTMLElement).offsetTop + (postContent as HTMLElement).offsetHeight;
        }
        
        // CommentSection 내에서 실제 댓글의 위치 찾기
        if (targetIndex >= 0 && allComments[targetIndex]) {
          const targetComment = allComments[targetIndex] as HTMLElement;
          // 부모 요소들을 거슬러 올라가며 offsetTop 계산
          let currentEl = targetComment;
          let tempOffset = 0;
          
          while (currentEl && currentEl !== container) {
            tempOffset += currentEl.offsetTop;
            currentEl = currentEl.offsetParent as HTMLElement;
          }
          
          actualOffsetTop = tempOffset;
        }
        
        // 중앙에 위치하도록 계산
        const targetScrollTop = actualOffsetTop - (container.clientHeight / 2) + 50;
        
        
        if (targetIndex >= 0) {
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'instant' // 즉시 이동
          });
        }
        
        return true;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 500); // 500ms 간격으로 재시도
      }
      
      return false;
    };
    
    // requestAnimationFrame을 사용하여 다음 렌더링 사이클에서 실행
    let rafId: number;
    const startScroll = () => {
      rafId = requestAnimationFrame(() => {
        tryScroll();
      });
    };
    
    // 약간의 지연 후 시작 (컴포넌트 마운트 완료 대기)
    const initialTimeout = setTimeout(startScroll, 50);
    
    return () => {
      clearTimeout(initialTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [highlightedCommentId]); // post.comments는 의도적으로 제외 (무한 루프 방지)

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
            highlightedCommentId={highlightedCommentId}
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
    </WebSocketErrorBoundary>
  );
}
