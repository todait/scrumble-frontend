'use client';

import type { Comment } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef, useState, useRef, useEffect } from 'react';
import { EditDeleteMenu } from './EditDeleteMenu';
import { ImageGallery } from './ImageGallery';
import { ProfileImage } from './ProfileImage';
import { LoadingSpinner } from './LoadingSpinner';
import { ImagePreview } from './ImagePreview';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiImageLine } from '@remixicon/react';
import { IconButton } from './IconButton';
import type { ImageMetadata } from '@/shared/types/upload.types';

interface CommentSectionProps {
  comments: Comment[];
  commentCount: number;
  className?: string;
  containerRef?: ForwardedRef<HTMLDivElement>;
  renderComment?: (comment: Comment, index: number) => ReactNode;
  onCommentEdit?: (commentId: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentUpdate?: (commentId: string, content: string, images: ImageMetadata[]) => void;
  editingCommentId?: string | null;
  isUpdating?: boolean;
}

export const CommentSection = forwardRef<HTMLDivElement, CommentSectionProps>(
  ({ comments, commentCount, className = '', renderComment, onCommentEdit, onCommentDelete, onCommentUpdate, editingCommentId, isUpdating }, ref) => {
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
                onUpdate={onCommentUpdate}
                editingCommentId={editingCommentId}
                isUpdating={isUpdating}
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
  onUpdate?: (commentId: string, content: string, images: ImageMetadata[]) => void;
  editingCommentId?: string | null;
  isUpdating?: boolean;
}

export function CommentItem({ comment, className = '', onEdit, onDelete, onUpdate, editingCommentId, isUpdating }: CommentItemProps) {
  const { user } = useAuth();
  const isMyComment = user?.id === comment.author.id;
  const isEditing = editingCommentId === comment.id;
  const [editContent, setEditContent] = useState(comment.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasEditingRef = useRef(false);
  
  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading, initializeWithImages } =
    useImageUpload({
      onError: error => {
        alert(error);
      },
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        initializeWithImages(comment.images);
      }
    } else if (!isEditing && wasEditingRef.current) {
      wasEditingRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearImages(); // 편집 모드 종료 시 이미지 정리
    }
  }, [isEditing]); // 의존성 배열에서 clearImages와 initializeWithImages 제거
  

  // textarea 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = '22px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [editContent, isEditing]);

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

  const isSaveEnabled = editContent.trim().length > 0 && !isUploading && !hasUploadingImages && !isUpdating;

  if (isEditing) {
    return (
      <div className={`group relative flex gap-3 overflow-visible ${className}`}>
        <ProfileImage
          src={comment.author.profileImage}
          alt={comment.author.name}
          size={32}
          className="flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold text-[#222222] md:text-[14px]">{comment.author.name}</span>
            <span className="text-xs text-[#222222] opacity-40 md:text-[13px]">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
            </span>
          </div>
          
          {/* 편집 영역 */}
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full resize-none overflow-y-auto rounded-lg border border-[rgba(34,34,34,0.08)] bg-white p-3 text-sm text-[#222222] focus:border-[#9747FF] focus:outline-none md:text-[14px]"
              style={{ minHeight: '60px', maxHeight: '150px' }}
              autoFocus
              disabled={isUpdating}
            />
            
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
                  disabled={isUploading || isUpdating}
                />
                <IconButton
                  icon={<RiImageLine className="h-4 w-4 text-[#222222] opacity-50" />}
                  title="이미지 첨부"
                  className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isUpdating}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="px-3 py-1.5 text-sm text-[#222222] opacity-60 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
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
                  {isUpdating ? (
                    <span className="flex items-center gap-1">
                      <LoadingSpinner size="sm" className="text-white" />
                      저장 중...
                    </span>
                  ) : (
                    '저장'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
          onEdit={handleEditClick}
          onDelete={onDelete}
          variant="comment"
        />
      )}
    </div>
  );
}