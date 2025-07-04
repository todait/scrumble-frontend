'use client';

import { useTextareaClipboardImagePaste } from '@/shared/hooks/useClipboardImagePaste';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useImageViewer } from '@/shared/hooks/useImageViewer';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { ImageViewer } from './ImageViewer';
import { LoadingSpinner } from './LoadingSpinner';

interface PostFormProps {
  onSubmit: (data: { message: string; images: ImageMetadata[] }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  initialMessage?: string;
  initialImages?: ImageMetadata[];
  children?: React.ReactNode;
  onTextAreaClick?: () => void;
  submitDisabled?: boolean;
}

export const PostForm = ({
  onSubmit,
  disabled = false,
  isLoading = false,
  placeholder = '오늘 하루는 어떠셨나요? 팀원들과 나누고 싶은 이야기를 들려주세요.',
  initialMessage = '',
  initialImages = [],
  children,
  onTextAreaClick,
  submitDisabled = false,
}: PostFormProps) => {
  const [message, setMessage] = useState(initialMessage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading } =
    useImageUpload({
      initialImages,
      onError: error => {
        alert(error);
      },
    });

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadImages,
    acceptedFileTypes: ['image/'],
  });

  const imageViewer = useImageViewer();

  // 클립보드 이미지 붙여넣기 기능
  const { textareaProps } = useTextareaClipboardImagePaste({
    onImagePaste: uploadImages,
    onError: error => {
      alert(error);
    },
    enabled: !disabled,
  });

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  // 제출 핸들러
  const handleSubmit = () => {
    if (message.trim() || completedImages.length > 0) {
      // 이미지 상태를 먼저 복사해서 안전하게 전달
      const imagesToSubmit = [...completedImages];
      const messageToSubmit = message;

      // 상태 초기화를 먼저 수행
      clearImages();
      setMessage('');

      // 복사된 데이터로 제출
      onSubmit({ message: messageToSubmit, images: imagesToSubmit });
    }
  };

  // 업로드 중인 이미지가 있는지 확인
  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSubmitDisabled =
    (!message.trim() && completedImages.length === 0) ||
    disabled ||
    isLoading ||
    submitDisabled ||
    isUploading ||
    hasUploadingImages; // 업로드 중인 이미지가 있으면 submit 방지

  return (
    <div ref={formRef} className="relative" {...dragHandlers}>
      {children}

      <div className={`px-2 transition-colors md:px-7 ${isDragging ? 'bg-blue-50' : ''}`}>
        <div className="cursor-text rounded-xl py-3" onClick={onTextAreaClick}>
          <textarea
            {...textareaProps}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            className="h-[240px] w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 md:text-[15px]"
            disabled={disabled}
          />
        </div>

        {/* 이미지 업로드 버튼과 미리보기 */}
        <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto py-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => handleFileInputChange(e, uploadImages, fileInputRef)}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {/* 업로드 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[80px] w-[80px] flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || isUploading}
          >
            <RiImageLine className="h-8 w-8 text-gray-400" />
          </button>

          {/* 이미지 미리보기 */}
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
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>

      {/* 드래그 오버레이 */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-blue-50 bg-opacity-90">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <p className="text-lg font-medium text-blue-600">이미지를 여기에 놓으세요</p>
          </div>
        </div>
      )}

      <div className="p-7">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-4 text-center text-base font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isLoading || isUploading ? (
            <>
              <LoadingSpinner size="sm" className="text-gray-900" />
              {isUploading ? '이미지 업로드 중...' : '저장 중...'}
            </>
          ) : (
            <>
              <RiCheckLine className="h-5 w-5" />
              저장
            </>
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
};
