'use client';

import type { Comment } from '@/features/feed/types/feed.types';
import { EmojiReactions } from '@/shared/components/emoji';
import type { EmojiData } from '@/shared/components/emoji/EmojiPicker';
import { EmojiPicker } from '@/shared/components/emoji/EmojiPicker';
import { TiptapEditor, TiptapViewer } from '@/shared/components/tiptap';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { JSONContent } from '@tiptap/core';
import { useToast } from '@/shared/hooks/useToast';
import { useToggleReaction } from '@/shared/hooks/queries/useReactions';
import { useClipboardImagePaste } from '@/shared/hooks/useClipboardImagePaste';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiImageLine } from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditDeleteMenu } from './EditDeleteMenu';
import { IconButton } from './IconButton';
import { ImageGallery } from './ImageGallery';
import { ImagePreviewList } from './ImagePreviewList';

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
  onCommentUpdate?: (
    commentId: string,
    content: string,
    contentJson: JSONContent | undefined,
    images: ImageMetadata[]
  ) => void;
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
    // useMemo로 중복 제거 연산 최적화
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

    // CommentItem 렌더링을 useMemo로 최적화
    const commentItems = useMemo(() => 
      uniqueComments.map((comment, index) =>
        renderComment ? (
          renderComment(comment, index)
        ) : (
          <CommentItem
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
      ),
      [uniqueComments, renderComment, postId, onCommentEdit, onCommentDelete, 
       onCommentUpdate, editingCommentId, isUpdating, highlightedCommentId]
    );

    if (commentCount === 0) {
      return null;
    }

    return (
      <div ref={ref} id="comments-section" className={`px-4 pb-6 md:px-[30px] md:pb-[30px] ${className}`}>
        <CommentDivider count={commentCount} />
        <div className="space-y-4">
          {commentItems}
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
  onUpdate?: (
    commentId: string,
    content: string,
    contentJson: JSONContent | undefined,
    images: ImageMetadata[]
  ) => void;
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
  const { currentSpaceMember: member } = useAuth();
  // const params = useParams();
  // const spaceSlug = params.spaceSlug as string;
  const isMyComment = member?.id === comment.author.id;
  const isEditing = editingCommentId === comment.id;
  const [editPlainText, setEditPlainText] = useState(comment.content);
  const [editContentJson, setEditContentJson] = useState<JSONContent | undefined>(
    comment.contentJson
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasEditingRef = useRef(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const editingContainerRef = useRef<HTMLDivElement>(null);
  const { mutate: toggleReaction } = useToggleReaction();
  const { show } = useToast();

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

  // 클립보드 이미지 붙여넣기 설정
  const { handlePaste: handleClipboardPaste } = useClipboardImagePaste({
    onImagePaste: uploadImages,
    onError: error => {
      show(error);
    },
    enabled: isEditing,
  });

  // 편집 상태 변경 시 콘텐츠 초기화 및 편집 종료 시 최신 데이터 반영
  useEffect(() => {
    setEditPlainText(comment.content);
    setEditContentJson(comment.contentJson);
  }, [comment.content, comment.contentJson]);

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

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && editingContainerRef.current) {
      setTimeout(() => {
        const editorEl = editingContainerRef.current?.querySelector('[data-tiptap-editor]');
        if (editorEl) {
          (editorEl as HTMLElement).focus();
        }
      }, 100);
    }
  }, [isEditing]);

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
    setEditPlainText(comment.content);
    setEditContentJson(comment.contentJson);
    clearImages();
    if (onEdit) onEdit(); // 편집 모드 종료 신호
  };

  const handleSave = () => {
    if ((editPlainText.trim() || completedImages.length > 0) && onUpdate) {
      onUpdate(comment.id, editPlainText.trim(), editContentJson, completedImages);
      // 편집 모드는 성공 응답 후에 종료하도록 변경
    }
  };

  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSaveEnabled =
    (editPlainText.trim().length > 0 || completedImages.length > 0) &&
    !isUploading &&
    !hasUploadingImages &&
    (editPlainText.trim() !== comment.content.trim() || // 내용이 변경되었거나
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
          show('리액션 처리에 실패했습니다. 다시 시도해주세요.');
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
          show('리액션 추가에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  const handleReactionError = (message: string) => {
    show(message);
  };

  const handleEmojiAdd = () => {
    setShowEmojiPicker(true);
  };

  const handleThumbQuickAdd = () => {
    if (hasReactions) return;
    setShowEmojiPicker(false);
    handleReactionAdd('👍');
  };

  const handleEmojiSelect = (emoji: EmojiData, event?: React.MouseEvent<HTMLDivElement>) => {
    const shiftPressed = !!event?.shiftKey;

    handleReactionAdd(emoji.native);

    // Shift가 눌리지 않았을 때만 픽커 닫기
    if (!shiftPressed) {
      setShowEmojiPicker(false);
    }
  };

  // 날짜 포맷팅 메모이제이션
  const formattedTime = useMemo(() => 
    formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko }),
    [comment.createdAt]
  );

  if (isEditing) {
    return (
      <div
        id={`comment-${comment.id}`}
        ref={editingContainerRef}
        className={`comment-item group relative flex gap-3 overflow-visible transition-all duration-500 ${className} ${
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
              {formattedTime}
            </span>
          </div>

          {/* 편집 영역 */}
          <div className="space-y-3" {...dragHandlers}>
            <div className="relative">
              <TiptapEditor
                content={editContentJson}
                onChange={(json, text) => {
                  setEditContentJson(json);
                  setEditPlainText(text);
                }}
                placeholder="댓글을 수정하세요..."
                minHeight={60}
                maxHeight={300}
                disabled={false}
                className="w-full rounded-lg border border-[rgba(34,34,34,0.08)] bg-white focus-within:border-[#9747FF]"
                onPaste={handleClipboardPaste}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (isSaveEnabled) {
                      handleSave();
                    }
                    return true;
                  }
                  return false;
                }}
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
              <ImagePreviewList
                images={uploadingImages}
                onRemove={removeImage}
                disabled={false}
              />
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
        className={`comment-item group relative flex gap-3 overflow-visible transition-all duration-500 ${className} ${
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
              {formattedTime}
            </span>
          </div>
          <div className="text-sm text-[#222222] md:text-[14px]">
            <TiptapViewer
              content={comment.contentJson ?? comment.content}
              fallbackText={comment.content}
              className="text-sm text-[#222222] md:text-[14px]"
            />
          </div>
          {comment.images && comment.images.length > 0 && (
            <ImageGallery images={comment.images} className="mt-2" />
          )}

          {/* 이모지가 있을 때만 EmojiReactions 표시 */}
          {hasReactions && (
            <div className="mt-2">
              <EmojiReactions
                reactions={comment.reactions || []}
                currentSpaceMemberId={member?.id}
                targetType="comments"
                targetId={comment.id}
                onReactionToggle={handleReactionToggle}
                onReactionAdd={handleReactionAdd}
                onError={handleReactionError}
                showDefaultThumb
              />
            </div>
          )}
        </div>

        {/* 호버 시 나타나는 액션 버튼들 */}
        <EditDeleteMenu
          onEdit={isMyComment && onEdit ? handleEditClick : undefined}
          onDelete={isMyComment && onDelete ? onDelete : undefined}
          onEmojiAdd={!hasReactions ? handleEmojiAdd : undefined}
          onThumbAdd={!hasReactions ? handleThumbQuickAdd : undefined}
          variant="comment"
          showEmojiButton={!hasReactions}
          showThumbButton={!hasReactions}
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

    </>
  );
}

// CommentItem export
export { CommentItem };
