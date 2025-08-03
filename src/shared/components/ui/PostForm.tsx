'use client';

import { useTextareaClipboardImagePaste } from '@/shared/hooks/useClipboardImagePaste';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { ImagePreviewList } from './ImagePreviewList';
import { LoadingSpinner } from './LoadingSpinner';

interface PostFormProps {
  onSubmit: (data: { message: string; images: ImageMetadata[] }) => void;
  onChange?: (data: { message: string; images: ImageMetadata[] }) => void;
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
  onChange,
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
      onUploadComplete: (images) => {
        if (onChange) {
          onChange({ message, images });
        }
      },
      onError: error => {
        alert(error);
      },
    });

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadImages,
    acceptedFileTypes: ['image/'],
  });

  // 클립보드 이미지 붙여넣기 기능
  const { textareaProps } = useTextareaClipboardImagePaste({
    onImagePaste: uploadImages,
    onError: error => {
      alert(error);
    },
    enabled: !disabled,
  });

  // removeImage 래핑 함수
  const handleRemoveImage = (imageId: string) => {
    removeImage(imageId);
    // 이미지 제거 후 즉시 onChange 호출
    if (onChange) {
      const updatedImages = completedImages.filter(img => 
        uploadingImages.find(ui => ui.id === imageId)?.metadata?.url !== img.url
      );
      onChange({ message, images: updatedImages });
    }
  };

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  // 제출 핸들러
  const handleSubmit = () => {
    if (message.trim() || completedImages.length > 0) {
      // 상태 초기화하지 않고 그대로 전달
      onSubmit({ message, images: completedImages });
    }
  };

  // 외부에서 저장 성공 시 상태를 초기화할 수 있도록 useEffect 추가
  useEffect(() => {
    // isLoading이 true에서 false로 변경되면 (저장 완료) 상태 초기화
    if (!isLoading && !initialMessage && initialImages.length === 0) {
      clearImages();
      setMessage('');
    }
  }, [isLoading, initialMessage, initialImages.length, clearImages]);

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
        <div className="relative cursor-text rounded-xl py-3" onClick={onTextAreaClick}>
          <textarea
            {...textareaProps}
            value={message}
            onChange={e => {
              const newMessage = e.target.value;
              setMessage(newMessage);
              if (onChange) {
                onChange({ message: newMessage, images: completedImages });
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // 모든 Enter 키 이벤트에 대해 전파 차단
                e.nativeEvent.stopImmediatePropagation();

                // CMD/Meta + Enter인 경우에만 폼 제출
                if (e.metaKey && !isSubmitDisabled) {
                  e.preventDefault();
                  handleSubmit();
                }
                // 일반 Enter는 줄바꿈을 위해 기본 동작 유지
              }
            }}
            placeholder={placeholder}
            className="h-[240px] w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed md:text-[15px]"
            disabled={disabled}
          />
        </div>

        {/* 이미지 업로드 버튼과 미리보기 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={e => handleFileInputChange(e, uploadImages, fileInputRef)}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <ImagePreviewList
          images={uploadingImages}
          onRemove={handleRemoveImage}
          disabled={disabled}
          className="mt-3 py-1"
          gap="gap-3"
          uploadButton={
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[80px] w-[80px] flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || isUploading}
            >
              <RiImageLine className="h-8 w-8 text-gray-400" />
            </button>
          }
        />
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
    </div>
  );
};
