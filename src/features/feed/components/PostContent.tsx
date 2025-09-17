'use client';

import { CheckInEditModal } from '@/features/checkin/components';
import { CheckOutEditModal } from '@/features/checkout/components';
import { CollapseSection, TodoContainer } from '@/features/todo';
import { EmojiReactions } from '@/shared/components/emoji';
import {
  ConditionScoreBadge,
  DeleteConfirmDialog,
  EditDeleteMenu,
  ImageGallery,
  ImageViewer,
  ProfileImage,
} from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useDeleteCheckIn,
  useDeleteCheckOut,
  useExistsCheckin,
} from '@/shared/hooks/queries';
import { useToggleReaction } from '@/shared/hooks/queries/useReactions';
import { useToast } from '@/shared/hooks/useToast';
import { formatDateToAPIString, formatTime } from '@/shared/utils';
import { RiArrowRightSLine } from '@remixicon/react';
import router from 'next/router';
import { useState } from 'react';
import { usePostTodoSection } from '../hooks/usePostTodoSection';
import type { Post } from '../types/feed.types';
import { getPostContent } from '../types/feed.types';
import { PostCommentSection } from './PostCommentSection';

interface PostContentProps {
  spaceSlug: string;
  post: Post;
  isSelected?: boolean;
  isDetailView?: boolean;
  onReaction?: (postId: string, emoji: string) => void; // 옵셔널 - 컴포넌트에서 직접 처리하거나 상위에서 처리 가능
  onCommentClick?: (postId: string, action?: 'scroll' | 'focus') => void;
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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { show } = useToast();
  
  const { currentSpaceMember: member } = useAuth();
  const isMyPost = member?.id === post.author.id;
  const isCheckIn = post.type === 'checkin';
  const isCheckOut = post.type === 'checkout';
  const content = getPostContent(post) || '';
  const contentPreview = content && content.length > 200 ? content.slice(0, 200) + '...' : content;
  const { mutate: deleteCheckIn, isPending: isDeleteCheckInPending } = useDeleteCheckIn();
  const { mutate: deleteCheckOut, isPending: isDeleteCheckOutPending } = useDeleteCheckOut();
  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    date: formatDateToAPIString(new Date()),
  });
  const { mutate: toggleReaction } = useToggleReaction();
  const imageUrls = post.images?.map(image => image.url);
  
  // Todo 관련 모든 로직을 커스텀 훅으로 추출
  const {
    isTodoCollapsed,
    setIsTodoCollapsed,
    isTodoEditMode,
    isSaving,
    todos,
    isTodosLoading,
    todoStatistics,
    handleToggleTodoEditMode,
    handleSaveTodos,
    handleCancelEdit,
    handleToggleComplete,
    handleUpdateTodos,
    todoContainerRef,
    shouldShowTodoSection,
  } = usePostTodoSection({
    post,
    isDetailView,
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
      show('해당 게시물이 삭제되었습니다');
    };

    if (isCheckIn) {
      deleteCheckIn(
        {
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
    show({
      message: '노트를 수정했습니다',
      actionText: '보기',
      onAction: () => {
        // 보기 액션 처리
      },
    });
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
            show('리액션 처리에 실패했습니다. 다시 시도해주세요.');
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
            show('리액션 추가에 실패했습니다. 다시 시도해주세요.');
          },
        }
      );
    }
  };

  const handleReactionError = (message: string) => {
    show(message);
  };

  const profileImageSize = isDetailView ? 48 : 40;
  const nameTextSize = isDetailView ? 'text-lg md:text-[17px]' : 'text-base md:text-[15px]';
  const contentTextSize = 'text-[15px] leading-[160%]';
  const padding = isDetailView ? 'p-4 md:p-6' : 'p-5 md:p-[30px]';

  return (
    <>
      <div className={`group relative flex gap-[10px] ${padding} bg-white`}>
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
        <div className="min-w-0 flex-1 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex min-w-0 flex-1 flex-col justify-between"
              style={{ height: profileImageSize }}
            >
              {/* 이름 - 프로필 이미지 상단에서 0.5px 아래 */}
              <div
                className={`flex items-center font-bold text-[#222222] ${nameTextSize} leading-none`}
                style={{ transform: 'translateY(2px)' }}
              >
                <span>{post.author.name}</span>
                <RiArrowRightSLine className="h-4 w-4 text-[#9999A2]" />
                <span className="font-bold" style={{ color: '#6E6E73', lineHeight: '120%' }}>
                  {isCheckIn ? '체크인' : '체크아웃'}
                </span>
              </div>

              {/* 시간 - 프로필 이미지 하단에서 0.5px 위 */}
              <div className="flex items-center" style={{ transform: 'translateY(-2px)' }}>
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
                <ConditionScoreBadge score={post.conditionScore} emoji={post.conditionEmoji} />
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

          {/* 체크아웃일 때 Todo 리스트를 먼저 렌더링 */}
          {isCheckOut && shouldShowTodoSection && (
            <CollapseSection
              title=""
              isCollapsed={isTodoCollapsed}
              onToggleCollapse={() => setIsTodoCollapsed(!isTodoCollapsed)}
              className="mt-[18px]"
              isPostContent={true}
              completionRate={todoStatistics.completionRate}
              completedCount={todoStatistics.completedCount}
              totalCount={todoStatistics.totalCount}
              isEditMode={isTodoEditMode}
            >
              {isTodosLoading ? (
                <div className="flex justify-center py-8">
                  <div
                    data-testid="todo-loading-spinner"
                    className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"
                  />
                </div>
              ) : (
                <div data-testid="todo-section">
                  <TodoContainer
                    ref={todoContainerRef}
                    mode="postContent"
                    yesterdayTodos={[]}
                    todayTodos={todos || []}
                    isEditable={isMyPost}
                    onUpdateTodayTodos={handleUpdateTodos}
                    onToggleComplete={todoId => handleToggleComplete(todoId)}
                    forceEditMode={isTodoEditMode}
                    showEditButton={isMyPost}
                    onToggleEditMode={handleToggleTodoEditMode}
                  />
                </div>
              )}
            </CollapseSection>
          )}

          {/* 체크아웃일 때 투두 편집 모드 저장/취소 버튼 */}
          {isCheckOut && isTodoEditMode && isMyPost && (
            <div className="mt-[10px] space-y-2">
              {/* 저장 버튼 */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleSaveTodos();
                }}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    투두 저장
                  </>
                )}
              </button>

              {/* 취소 버튼 */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
            </div>
          )}

          {/* 본문 */}
          <div className="mt-[10px] py-2">
            {showFullContent ? (
              <p
                className={`whitespace-pre-wrap ${contentTextSize}`}
                style={{ color: '#1D1D1F', fontWeight: 400 }}
              >
                {content}
              </p>
            ) : (
              <p
                className={`whitespace-pre-wrap ${contentTextSize}`}
                style={{ color: '#1D1D1F', fontWeight: 400 }}
              >
                {content.length > 200 ? (
                  <>
                    {contentPreview.replace(/\.\.\.$/, '')}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowFullContent(true);
                      }}
                      className="ml-1 text-[15px] font-medium text-[#A0A0A0] hover:text-[#808080]"
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
              className="mt-[10px]"
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

          {/* 체크인일 때 Todo 리스트 섹션 (본문 뒤에) */}
          {isCheckIn && shouldShowTodoSection && (
            <CollapseSection
              title=""
              isCollapsed={isTodoCollapsed}
              onToggleCollapse={() => setIsTodoCollapsed(!isTodoCollapsed)}
              className="mt-[10px]"
              isPostContent={true}
              completionRate={todoStatistics.completionRate}
              completedCount={todoStatistics.completedCount}
              totalCount={todoStatistics.totalCount}
              isEditMode={isTodoEditMode}
            >
              {isTodosLoading ? (
                <div className="flex justify-center py-8">
                  <div
                    data-testid="todo-loading-spinner"
                    className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600"
                  />
                </div>
              ) : (
                <div data-testid="todo-section">
                  <TodoContainer
                    ref={todoContainerRef}
                    mode="postContent"
                    yesterdayTodos={[]}
                    todayTodos={todos || []}
                    isEditable={isMyPost}
                    onUpdateTodayTodos={handleUpdateTodos}
                    onToggleComplete={todoId => handleToggleComplete(todoId)}
                    forceEditMode={isTodoEditMode}
                    showEditButton={isMyPost}
                    onToggleEditMode={handleToggleTodoEditMode}
                  />
                </div>
              )}
            </CollapseSection>
          )}

          {/* 체크인일 때 투두 편집 모드 저장/취소 버튼 */}
          {isCheckIn && isTodoEditMode && isMyPost && (
            <div className="mt-[10px] space-y-2">
              {/* 저장 버튼 */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleSaveTodos();
                }}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    투두 저장
                  </>
                )}
              </button>

              {/* 취소 버튼 */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
            </div>
          )}

          {/* 리액션 및 댓글 섹션 */}
          <div className="mt-[10px] py-2">
            <EmojiReactions
              reactions={post.reactions}
              currentSpaceMemberId={member?.id}
              targetType="posts"
              targetId={post.id}
              onReactionToggle={handleReactionToggle}
              onReactionAdd={handleReactionAdd}
              onError={handleReactionError}
              showCommentButton
              commentCount={post.commentCount || 0}
              onCommentClick={() => onCommentClick?.(post.id)}
              showDefaultThumb
            />
          </div>

          {/* 댓글 섹션 (카드 뷰에서만) */}
          {!isDetailView && (
            <PostCommentSection
              postAuthorName={post.author.name}
              comments={post.comments}
              onCommentClick={(action) => {
                onCommentClick?.(post.id, action);
              }}
              postType={post.type}
            />
          )}
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
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 체크아웃 수정 모달 */}
      {isCheckOut && 'reflectionText' in post && (
        <CheckOutEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
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
