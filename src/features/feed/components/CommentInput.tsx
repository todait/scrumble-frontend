'use client';

import { IconButton, ImageViewer, LoadingSpinner } from '@/shared/components/ui';
import { ImagePreview } from '@/shared/components/ui/ImagePreview';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useImageViewer } from '@/shared/hooks/useImageViewer';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiImageLine, RiSendPlaneFill } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';

interface CommentInputProps {
  authorName: string;
  placeholder?: string;
  onSubmit: (content: string, images: ImageMetadata[]) => void;
}

export function CommentInput({ authorName, placeholder, onSubmit }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading } =
    useImageUpload({
      onError: error => {
        alert(error);
      },
    });

  const imageViewer = useImageViewer();

  // textarea 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '22px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() || completedImages.length > 0) {
      // 이미지 상태를 먼저 복사해서 안전하게 전달
      const imagesToSubmit = [...completedImages];
      const contentToSubmit = content.trim();

      // 상태 초기화를 먼저 수행
      clearImages();
      setContent('');

      // 복사된 데이터로 제출
      onSubmit(contentToSubmit, imagesToSubmit);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 업로드 중인 이미지가 있는지 확인
  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSubmitEnabled =
    (content.trim().length > 0 || completedImages.length > 0) &&
    !isUploading &&
    !hasUploadingImages;

  const displayPlaceholder = placeholder || `${authorName}님의 체크인에 가볍게 코멘트를 남겨보세요`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[rgba(34,34,34,0.08)] bg-white p-4">
      {/* 텍스트 입력 영역 */}
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none overflow-y-auto border-none bg-transparent text-[15px] leading-[1.4] text-[#181818] focus:outline-none"
            style={{ minHeight: '22px', maxHeight: '150px' }}
          />
          {/* 커서 애니메이션 - 빈 상태일 때만 */}
          {!content && !isFocused && (
            <div className="pointer-events-none absolute left-0 top-0">
              <span className="text-[15px] leading-[1.4] text-[#181818] opacity-20">
                {displayPlaceholder}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 미리보기 */}
      {uploadingImages.length > 0 && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {uploadingImages.map(img => {
            const isCompleted = img.progress === 100 && img.metadata && !img.error;

            return (
              <ImagePreview
                key={img.id}
                image={img}
                onRemove={removeImage}
                onClick={
                  isCompleted && img.metadata
                    ? () =>
                        imageViewer.handleImageClick(
                          img.metadata!.url,
                          completedImages.map(i => i.url)
                        )
                    : undefined
                }
                disabled={false}
              />
            );
          })}
        </div>
      )}

      {/* 하단 액션 바 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽 액션 버튼들 */}
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
          {/* <IconButton
            icon={<RiAttachment2 className="h-4 w-4 text-[#222222] opacity-50" />}
            title="파일 첨부"
            className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
          />
          <IconButton
            icon={<RiAtLine className="h-4 w-4 text-[#222222] opacity-50" />}
            title="멘션"
            className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
          /> */}
        </div>

        {/* 오른쪽 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`flex items-center justify-center rounded border transition-all ${
            isSubmitEnabled
              ? 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] hover:bg-[#8537EF]'
              : 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] opacity-30'
          } ${isUploading ? 'min-w-[120px] px-3' : 'h-8 w-8'}`}
          title="전송"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2 text-white" />
              <span className="text-sm text-white">업로드 중...</span>
            </>
          ) : (
            <RiSendPlaneFill className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* 이미지 뷰어 */}
      <ImageViewer
        images={completedImages.map(img => img.url)}
        initialIndex={imageViewer.selectedIndex}
        isOpen={imageViewer.isOpen}
        onClose={imageViewer.closeViewer}
      />
    </div>
  );
}
