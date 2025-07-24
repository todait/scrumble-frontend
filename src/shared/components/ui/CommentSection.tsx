'use client';

import type { Comment } from '@/features/feed/types/feed.types';
import { EmojiReactions } from '@/shared/components/emoji';
import type { EmojiData } from '@/shared/components/emoji/EmojiPicker';
import { SimpleToast } from '@/shared/components/feedback';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useToggleReaction } from '@/shared/hooks/queries/useReactions';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiImageLine } from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import { EditDeleteMenu } from './EditDeleteMenu';
import { IconButton } from './IconButton';
import { ImageGallery } from './ImageGallery';
import { ImagePreview } from './ImagePreview';
import { CommentEditor } from '@/shared/components/tiptap/components/CommentEditor';
import type { MentionUser } from '@/shared/components/tiptap/tiptap.types';

// Dynamic import for EmojiPicker
const EmojiPicker = dynamic(
  () => import('@/shared/components/emoji/EmojiPicker').then(mod => mod.EmojiPicker),
  { ssr: false }
);
// import { LoadingSpinner } from './LoadingSpinner'; // 사용하지 않음
import { ProfileImage } from './ProfileImage';

interface CommentSectionProps {
  comments: Comment[];
  commentCount: number;
  postId?: string;
  className?: string;
  containerRef?: ForwardedRef<HTMLDivElement>;
  renderComment?: (comment: Comment, index: number) => ReactNode;
  onCommentEdit?: (commentId: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentUpdate?: (commentId: string, content: string, images: ImageMetadata[]) => void;
  editingCommentId?: string | null;
  isUpdating?: boolean;
  highlightedCommentId?: string | null;
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  (
    {
      comments,
      commentCount,
      postId,
      className = '',
      renderComment,
      onCommentEdit,
      onCommentDelete,
      onCommentUpdate,
      editingCommentId,
      isUpdating,
      highlightedCommentId,
    },
    ref
  ) => {
    // useMemo로 중복 제거 연산 최적화 - early return 전에 호출
    const uniqueComments = useMemo(() => {
      const seen = new Set<string>();
      return comments.filter(comment => {
        if (seen.has(comment.id)) {
          return false;
        }
        seen.add(comment.id);
        return true;
      });
    }, [comments]);

    if (commentCount === 0) {
      return null;
    }

    return (
      <div ref={ref} className={`px-4 pb-6 md:px-[30px] md:pb-[30px] ${className}`}>
        <CommentDivider count={commentCount} />
        <div className="space-y-4">
          {uniqueComments.map((comment, index) =>
            renderComment ? (
              renderComment(comment, index)
            ) : (
              <MemoizedCommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onEdit={onCommentEdit ? () => onCommentEdit(comment.id) : undefined}
                onDelete={onCommentDelete ? () => onCommentDelete(comment.id) : undefined}
                onUpdate={onCommentUpdate}
                editingCommentId={editingCommentId}
                isUpdating={isUpdating}
                isHighlighted={highlightedCommentId === comment.id}
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
        <span className="text-xs font-medium text-[#222222] opacity-40 md:text-[11px]">
          댓글 {count}
        </span>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId?: string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdate?: (commentId: string, content: string, images: ImageMetadata[]) => void;
  editingCommentId?: string | null;
  isUpdating?: boolean;
  isHighlighted?: boolean;
}

function CommentItem({
  comment,
  postId,
  className = '',
  onEdit,
  onDelete,
  onUpdate,
  editingCommentId,
  isUpdating: _isUpdating, // _ prefix로 사용하지 않음을 명시
  isHighlighted,
}: CommentItemProps) {
  const { user } = useAuth();
  const params = useParams();
  const spaceSlug = params.spaceSlug as string;
  const isMyComment = user?.id === comment.author.id;
  const isEditing = editingCommentId === comment.id;
  const [editContent, setEditContent] = useState(comment.content);
  const [showToast, setShowToast] = useState<{ message: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasEditingRef = useRef(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const editingContainerRef = useRef<HTMLDivElement>(null);
  const { mutate: toggleReaction } = useToggleReaction(spaceSlug);
  
  // 멘션을 위한 사용자 목록 (실제 구현 시 props로 받거나 상태 관리에서 가져옴)
  const mentionUsers: MentionUser[] = [];

  const hasReactions = comment.reactions && comment.reactions.length > 0;

  const {
    uploadImages,
    uploadingImages,
    completedImages,
    removeImage,
    clearImages,
    isUploading,
    initializeWithImages,
  } = useImageUpload({
    onError: error => {
      alert(error);
    },
  });

  // 드래그앤드롭 설정
  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadImages,
    acceptedFileTypes: ['image/'],
  });

  // 편집 상태 변경 시 콘텐츠 초기화 및 편집 종료 시 최신 데이터 반영
  useEffect(() => {
    setEditContent(comment.content);
  }, [comment.content]);

  // 편집 모드 시작 시에만 기존 이미지 초기화 (오직 한 번만)
  useEffect(() => {
    if (isEditing && !wasEditingRef.current) {
      wasEditingRef.current = true;
      if (comment.images && comment.images.length > 0) {
        initializeWithImages(comment.images);
      }
    } else if (!isEditing && wasEditingRef.current) {
      wasEditingRef.current = false;

      clearImages(); // 편집 모드 종료 시 이미지 정리
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); // 의존성 배열에서 clearImages와 initializeWithImages 제거

  // Tiptap 에디터에서는 자동 높이 조절과 포커스가 내부적으로 처리됨

  // 편집 모드 활성화 시 스크롤 처리
  useEffect(() => {
    if (isEditing && editingContainerRef.current) {
      // 약간의 지연을 두어 DOM 업데이트가 완료된 후 스크롤
      setTimeout(() => {
        editingContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [isEditing]);

  // 하이라이팅 효과 처리
  useEffect(() => {
    if (isHighlighted) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 1000); // 1초 후 하이라이팅 제거
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  const handleEditClick = () => {
    if (onEdit) onEdit();
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    clearImages();
    if (onEdit) onEdit(); // 편집 모드 종료 신호
  };

  const handleSave = () => {
    if (editContent.trim() && onUpdate) {
      onUpdate(comment.id, editContent.trim(), completedImages);
      // 편집 모드는 성공 응답 후에 종료하도록 변경
    }
  };

  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSaveEnabled =
    editContent.trim().length > 0 &&
    !isUploading &&
    !hasUploadingImages &&
    (editContent.trim() !== comment.content.trim() || // 내용이 변경되었거나
      completedImages.length !== (comment.images?.length || 0)); // 이미지가 변경되었을 때

  const handleReactionToggle = (emoji: string) => {
    toggleReaction(
      {
        targetType: 'comments',
        targetId: comment.id,
        targetPostId: postId,
        emoji: emoji,
        currentReactions: comment.reactions || [],
      },
      {
        onError: error => {
          console.error('[CommentItem] 리액션 토글 실패:', error);
          setShowToast({
            message: '리액션 처리에 실패했습니다. 다시 시도해주세요.',
          });
        },
      }
    );
  };

  const handleReactionAdd = (emoji: string) => {
    toggleReaction(
      {
        targetType: 'comments',
        targetId: comment.id,
        targetPostId: postId,
        emoji: emoji,
        currentReactions: comment.reactions || [],
      },
      {
        onError: error => {
          console.error('[CommentItem] 리액션 추가 실패:', error);
          setShowToast({
            message: '리액션 추가에 실패했습니다. 다시 시도해주세요.',
          });
        },
      }
    );
  };

  const handleReactionError = (message: string) => {
    setShowToast({ message });
  };

  const handleEmojiAdd = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: EmojiData, event?: React.MouseEvent<HTMLDivElement>) => {
    const shiftPressed = !!event?.shiftKey;

    handleReactionAdd(emoji.native);

    // Shift가 눌리지 않았을 때만 픽커 닫기
    if (!shiftPressed) {
      setShowEmojiPicker(false);
    }
  };

  if (isEditing) {
    return (
      <div
        id={`comment-${comment.id}`}
        ref={editingContainerRef}
        className={`group relative flex gap-3 overflow-visible transition-all duration-500 ${className} ${
          showHighlight ? '-mx-3 rounded-lg bg-purple-50 p-3' : ''
        }`}
      >
        <ProfileImage
          src={comment.author.profileImage}
          alt={comment.author.name}
          size={32}
          className="flex-shrink-0"
          skipLoadingState={comment._isOptimistic}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold text-[#222222] md:text-[14px]">
              {comment.author.name}
            </span>
            <span className="text-xs text-[#222222] opacity-40 md:text-[13px]">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
            </span>
          </div>

          {/* 편집 영역 */}
          <div className="space-y-3" {...dragHandlers}>
            <div className="relative">
              <CommentEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="댓글을 입력하세요..."
                disabled={false}
                mode="edit"
                onSubmit={() => {
                  if (isSaveEnabled) {
                    handleSave();
                  }
                }}
                onCancel={handleCancel}
                imageUploadHook={{
                  uploadImages,
                  uploadingImages,
                  completedImages,
                  removeImage,
                  clearImages,
                  isUploading,
                  isConverting: uploadingImages.some(img => img.isConverting),
                  convertingCount: uploadingImages.filter(img => img.isConverting).length,
                  initializeWithImages,
                  isHeicSupported: typeof window !== 'undefined',
                }}
                enableImageUpload={true}
                mentionConfig={
                  mentionUsers.length > 0
                    ? {
                        suggestions: mentionUsers,
                        onMentionSelect: (user) => {
                          console.log('Mentioned user:', user);
                        },
                      }
                    : undefined
                }
                autoFocus={true}
              />

              {/* 드래그 오버레이 */}
              {isDragging && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-[#9747FF] bg-[#9747FF]/10">
                  <div className="text-center">
                    <RiImageLine className="mx-auto mb-2 h-8 w-8 text-[#9747FF]" />
                    <p className="text-sm font-medium text-[#9747FF]">이미지를 놓으세요</p>
                  </div>
                </div>
              )}
            </div>

            {/* 이미지 미리보기 */}
            {uploadingImages.length > 0 && (
              <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                {uploadingImages.map(img => {
                  return (
                    <ImagePreview
                      key={img.id}
                      image={img}
                      onRemove={removeImage}
                      onClick={undefined}
                      disabled={false}
                    />
                  );
                })}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={e => handleFileInputChange(e, uploadImages, fileInputRef)}
                  className="hidden"
                  disabled={isUploading}
                />
                <IconButton
                  icon={<RiImageLine className="h-4 w-4 text-[#222222] opacity-50" />}
                  title="이미지 첨부"
                  className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={false}
                  className="px-3 py-1.5 text-sm text-[#222222] opacity-60 hover:opacity-100"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isSaveEnabled}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSaveEnabled
                      ? 'bg-[#9747FF] text-white hover:bg-[#8537EF]'
                      : 'bg-[#F1F1F1] text-[#222222] opacity-30'
                  }`}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        id={`comment-${comment.id}`}
        className={`group relative flex gap-3 overflow-visible transition-all duration-500 ${className} ${
          showHighlight ? '-mx-3 rounded-lg bg-purple-50 p-3' : ''
        }`}
      >
        <ProfileImage
          src={comment.author.profileImage}
          alt={comment.author.name}
          size={32}
          className="flex-shrink-0"
          skipLoadingState={comment._isOptimistic}
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
          <p className="whitespace-pre-line text-sm text-[#222222] md:text-[14px]">
            {comment.content}
          </p>
          {comment.images && comment.images.length > 0 && (
            <ImageGallery images={comment.images} className="mt-2" />
          )}

          {/* 이모지가 있을 때만 EmojiReactions 표시 */}
          {hasReactions && (
            <div className="mt-2">
              <EmojiReactions
                reactions={comment.reactions || []}
                currentUserId={user?.id}
                targetType="comments"
                targetId={comment.id}
                onReactionToggle={handleReactionToggle}
                onReactionAdd={handleReactionAdd}
                onError={handleReactionError}
              />
            </div>
          )}
        </div>

        {/* 호버 시 나타나는 액션 버튼들 */}
        <EditDeleteMenu
          onEdit={isMyComment && onEdit ? handleEditClick : undefined}
          onDelete={isMyComment && onDelete ? onDelete : undefined}
          onEmojiAdd={!hasReactions ? handleEmojiAdd : undefined}
          variant="comment"
          showEmojiButton={!hasReactions}
          emojiButtonRef={emojiButtonRef}
        />

        {/* 이모지 피커 */}
        {!hasReactions && (
          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={handleEmojiSelect}
            triggerRef={emojiButtonRef}
          />
        )}
      </div>

      {/* 토스트 메시지 */}
      {showToast && <SimpleToast message={showToast.message} onClose={() => setShowToast(null)} />}
    </>
  );
}

// React.memo로 CommentItem 최적화
const MemoizedCommentItem = memo(CommentItem, (prevProps, nextProps) => {
  // 다음 경우에만 재렌더링:
  // 1. comment 객체가 변경됨 (내용, 리액션 등)
  // 2. 편집 상태가 변경됨
  // 3. 업데이트 중 상태가 변경됨
  // 4. 하이라이팅 상태가 변경됨
  return (
    prevProps.comment === nextProps.comment &&
    prevProps.editingCommentId === nextProps.editingCommentId &&
    prevProps.isUpdating === nextProps.isUpdating &&
    prevProps.postId === nextProps.postId &&
    prevProps.isHighlighted === nextProps.isHighlighted
  );
});

MemoizedCommentItem.displayName = 'MemoizedCommentItem';

// 기존 CommentItem도 export (호환성 유지)
export { CommentItem };
