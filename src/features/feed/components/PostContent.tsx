'use client';

import { CheckInEditModal } from '@/features/checkin/components';
import { CheckOutEditModal } from '@/features/checkout/components';
import { CollapseSection, TodoContainer } from '@/features/todo';
import { EmojiReactions } from '@/shared/components/emoji';
import { SimpleToast } from '@/shared/components/feedback';
import {
  DeleteConfirmDialog,
  EditDeleteMenu,
  ImageGallery,
  ImageViewer,
  ProfileImage,
  StatusBadge,
} from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useDeleteCheckIn, useDeleteCheckOut, useExistsCheckin } from '@/shared/hooks/queries';
import { useToggleReaction } from '@/shared/hooks/queries/useReactions';
import { formatDateToAPIString, formatTime, getConditionLabel } from '@/shared/utils';
import router from 'next/router';
import { useState } from 'react';
import { usePostTodos } from '../hooks/usePostTodos';
import type { Post } from '../types/feed.types';
import { getPostContent } from '../types/feed.types';
import { CommentPreview } from './CommentPreview';

interface PostContentProps {
  spaceSlug: string;
  post: Post;
  isSelected?: boolean;
  isDetailView?: boolean;
  onReaction?: (postId: string, emoji: string) => void; // 옵셔널 - 컴포넌트에서 직접 처리하거나 상위에서 처리 가능
  onCommentClick?: (postId: string) => void;
}

export function PostContent({
  spaceSlug,
  post,
  isSelected = false,
  isDetailView = false,
  onReaction,
  onCommentClick,
}: PostContentProps) {
  const [showFullContent, setShowFullContent] = useState(isDetailView);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; actionText?: string } | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(!isDetailView);
  const { user } = useAuth();
  const isMyPost = user?.id === post.author.id;
  const isCheckIn = post.type === 'checkin';
  const isCheckOut = post.type === 'checkout';
  const content = getPostContent(post) || '';
  const contentPreview = content && content.length > 200 ? content.slice(0, 200) + '...' : content;
  const { mutate: deleteCheckIn, isPending: isDeleteCheckInPending } = useDeleteCheckIn();
  const { mutate: deleteCheckOut, isPending: isDeleteCheckOutPending } = useDeleteCheckOut();
  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(new Date()),
  });
  const { mutate: toggleReaction } = useToggleReaction(spaceSlug);
  const imageUrls = post.images?.map(image => image.url);

  // Todo 리스트용 hook (lazy loading)
  const { todos, isLoading: isTodosLoading, handleToggleComplete, handleUpdateTodos } = usePostTodos({
    spaceSlug,
    postDate: new Date(post.createdAt),
    userId: post.author.id, // 포스트 작성자의 Todo 조회
    enabled: !isTodoCollapsed || isDetailView, // Collapse가 열릴 때 또는 상세보기에서 로딩
  });

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    // 즉시 다이얼로그 닫기 (optimistic update)
    setShowDeleteDialog(false);

    // 삭제 성공 후 토스트 표시
    const onSuccess = () => {
      setShowToast({ message: '해당 게시물이 삭제되었습니다' });
    };

    if (isCheckIn) {
      deleteCheckIn(
        {
          spaceSlug,
          postId: post.id,
        },
        {
          onSuccess: async () => {
            let success = false;
            for (let i = 0; i < 5; i++) {
              const { data: existsCheckin } = await refetchExistsCheckin();
              if (existsCheckin?.exists === true) {
                success = true;
                break;
              }
              await new Promise(res => setTimeout(res, 200)); // 200ms 대기 후 재시도
            }
            if (success) {
              router.replace(`/${spaceSlug}/posts/checkins/new`);
            }
          },
          onError: error => {
            console.error('체크인 삭제 오류:', error);
            // 에러 발생 시 사용자에게 알림 (토스트 메시지는 이미 mutation에서 처리됨)
          },
        }
      );
    }

    if (isCheckOut) {
      deleteCheckOut(
        {
          spaceSlug,
          postId: post.id,
        },
        {
          onSuccess,
          onError: error => {
            console.error('체크아웃 삭제 오류:', error);
            // 에러 발생 시 사용자에게 알림 (토스트 메시지는 이미 mutation에서 처리됨)
          },
        }
      );
    }
  };

  const handleEditSubmit = () => {
    setShowEditModal(false);
    setShowToast({
      message: '노트를 수정했습니다',
      actionText: '보기',
    });
  };

  const handleToastAction = () => {
    setShowToast(null);
  };

  const handleReactionToggle = (emoji: string) => {
    if (onReaction) {
      onReaction(post.id, emoji);
    } else {
      toggleReaction(
        {
          targetType: 'posts',
          targetId: post.id,
          emoji: emoji,
          currentReactions: post.reactions,
        },
        {
          onError: error => {
            console.error('[PostContent] 리액션 토글 실패:', error);
            setShowToast({
              message: '리액션 처리에 실패했습니다. 다시 시도해주세요.',
            });
          },
        }
      );
    }
  };

  const handleReactionAdd = (emoji: string) => {
    if (onReaction) {
      onReaction(post.id, emoji);
    } else {
      toggleReaction(
        {
          targetType: 'posts',
          targetId: post.id,
          emoji: emoji,
          currentReactions: post.reactions,
        },
        {
          onError: error => {
            console.error('[PostContent] 리액션 실패:', error);
            setShowToast({
              message: '리액션 추가에 실패했습니다. 다시 시도해주세요.',
            });
          },
        }
      );
    }
  };

  const handleReactionError = (message: string) => {
    setShowToast({ message });
  };

  const profileImageSize = isDetailView ? 48 : 40;
  const nameTextSize = isDetailView ? 'text-lg md:text-[17px]' : 'text-base md:text-[15px]';
  const contentTextSize = isDetailView
    ? 'text-base leading-[1.5] md:text-[16px] md:leading-[1.5]'
    : 'text-base leading-[1.4] md:text-[15px] md:leading-[1.4]';
  const padding = isDetailView ? 'p-4 md:p-6' : 'p-5 md:p-[30px]';

  return (
    <>
      <div
        className={`group relative flex gap-[10px] ${padding} ${
          isSelected && !isDetailView
            ? 'bg-[rgba(151,71,255,0.04)]'
            : !isDetailView
              ? 'bg-white hover:bg-[rgba(151,71,255,0.04)]'
              : 'bg-white'
        }`}
      >
        {/* 선택 시 왼쪽 보라색 라인 (카드 뷰에서만) */}
        {!isDetailView && isSelected && (
          <div className="absolute left-0 top-0 h-full w-1 bg-[#9747FF]" />
        )}

        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={post.author.profileImage}
            alt={post.author.name}
            size={profileImageSize}
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1 space-y-[10px] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex min-w-0 flex-1 flex-col justify-between"
              style={{ height: profileImageSize }}
            >
              {/* 이름 - 프로필 이미지 상단에서 0.5px 아래 */}
              <div
                className={`font-bold text-[#222222] ${nameTextSize} leading-none`}
                style={{ transform: 'translateY(2px)' }}
              >
                {post.author.name}
              </div>

              {/* 타입과 시간 - 프로필 이미지 하단에서 0.5px 위 */}
              <div className="flex items-center gap-1" style={{ transform: 'translateY(-1px)' }}>
                <StatusBadge type={isCheckIn ? 'checkin' : 'checkout'} />
                <span className="text-sm leading-none text-[#222222] opacity-40 md:text-[13px]">
                  {formatTime(post.createdAt)}
                  {post.updatedAt &&
                    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() >
                      1000 &&
                    ' (수정됨)'}
                </span>
              </div>
            </div>

            {/* 체크인 점수 + 더보기 메뉴 */}
            {isCheckIn && 'conditionScore' in post ? (
              <div className="flex flex-shrink-0 items-center gap-2">
                <div className="rounded border border-[rgba(34,34,34,0.08)] px-2 py-2">
                  <span className="text-base text-[#222222] opacity-80 md:text-[15px]">
                    {post.conditionEmoji || getConditionLabel(post.conditionScore)}{' '}
                    {post.conditionScore}점
                  </span>
                </div>
                {/* 내 포스트일 때 수정/삭제 메뉴 (카드 뷰에서만) */}
                {isMyPost && !isDetailView && (
                  <EditDeleteMenu onEdit={handleEdit} onDelete={handleDelete} />
                )}
              </div>
            ) : (
              /* 체크아웃인 경우 더보기 메뉴만 */
              isMyPost &&
              !isDetailView && (
                <div className="flex-shrink-0">
                  <EditDeleteMenu onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              )
            )}
          </div>

          {/* 본문 */}
          <div className="py-2">
            {showFullContent ? (
              <p className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>{content}</p>
            ) : (
              <p className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>
                {content.length > 200 ? (
                  <>
                    {contentPreview.replace(/\.\.\.$/, '')}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowFullContent(true);
                      }}
                      className="ml-1 text-base font-medium text-[#A0A0A0] hover:text-[#808080] md:text-[15px]"
                    >
                      ...더보기
                    </button>
                  </>
                ) : (
                  content
                )}
              </p>
            )}
          </div>

          {/* 이미지 섹션 */}
          {post.images && post.images.length > 0 && (
            <ImageGallery
              images={post.images}
              className="mt-2"
              onClick={(index, event) => {
                // 이벤트 전파를 막고 이미지 뷰어 열기
                event.stopPropagation();
                event.preventDefault();
                setSelectedImageIndex(index);
                // setTimeout을 사용하여 다음 이벤트 루프에서 실행
                setTimeout(() => {
                  setImageViewerOpen(true);
                }, 0);
              }}
            />
          )}

          {/* Todo 리스트 섹션 */}
          {(post.todoCount !== undefined || todos) && (() => {
            const hasTodos = todos && todos.length > 0;
            const completedCount = hasTodos ? todos.filter(todo => todo.completedAt).length : 0;
            const totalCount = hasTodos ? todos.length : (post.todoCount || 0);
            const completionRate = hasTodos && totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            // 헤더 컨텐츠 결정
            let headerContent;
            if (!todos || isTodosLoading) {
              // Todo 로드 전 또는 로딩 중
              headerContent = (
                <div className="text-xs font-bold">
                  <span className="text-[#222222] text-opacity-60">오늘의 투두 • </span>
                  <span className="text-[#222222]">{post.todoCount || 0}개</span>
                </div>
              );
            } else {
              // Todo 로드 완료
              headerContent = (
                <div className="text-xs font-bold">
                  <span className="text-[#222222] text-opacity-60">오늘의 투두 • </span>
                  <span className="text-[#222222]">{completionRate}% 달성 ({completedCount}/{totalCount})</span>
                </div>
              );
            }
            
            return (
              <CollapseSection
                title=""
                isCollapsed={isTodoCollapsed}
                onToggleCollapse={() => setIsTodoCollapsed(!isTodoCollapsed)}
                className="mt-3"
                headerContent={headerContent}
              >
                {isTodosLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="text-sm text-gray-500">투두를 불러오는 중...</div>
                  </div>
                ) : hasTodos ? (
                  <TodoContainer
                    mode="postContent"
                    yesterdayTodos={[]}
                    todayTodos={todos}
                    isEditable={isMyPost}
                    onUpdateTodayTodos={handleUpdateTodos}
                    onToggleComplete={todoId => handleToggleComplete(todoId)}
                    forceEditMode={false}
                  />
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">
                    투두가 없습니다
                  </div>
                )}
              </CollapseSection>
            );
          })()}

          {/* 리액션 및 댓글 섹션 */}
          <div className="flex flex-col gap-[10px] py-2">
            {/* 이모지 리액션 */}
            <EmojiReactions
              reactions={post.reactions}
              currentUserId={user?.id}
              targetType="posts"
              targetId={post.id}
              onReactionToggle={handleReactionToggle}
              onReactionAdd={handleReactionAdd}
              onError={handleReactionError}
            />

            {/* 댓글 정보 (카드 뷰에서만) */}
            {!isDetailView && (
              <CommentPreview
                postId={post.id}
                comments={post.comments}
                commentCount={post.commentCount}
                lastCommentTime={post.lastCommentTime}
                onCommentClick={onCommentClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteCheckInPending || isDeleteCheckOutPending}
      />

      {/* 체크인 수정 모달 */}
      {isCheckIn && 'conditionScore' in post && (
        <CheckInEditModal
          spaceSlug={spaceSlug}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 체크아웃 수정 모달 */}
      {isCheckOut && 'reflectionText' in post && (
        <CheckOutEditModal
          spaceSlug={spaceSlug}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <SimpleToast
          message={showToast.message}
          actionText={showToast.actionText}
          onAction={showToast.actionText ? handleToastAction : undefined}
          onClose={() => setShowToast(null)}
        />
      )}

      {/* 이미지 뷰어 */}
      {imageUrls && imageUrls.length > 0 && (
        <ImageViewer
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </>
  );
}
