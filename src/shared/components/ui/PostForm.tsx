'use client';

import { TiptapEditor } from '@/shared/components/tiptap';
import type { JSONContent } from '@/shared/components/tiptap';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useClipboardImagePaste } from '@/shared/hooks/useClipboardImagePaste';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useEffect, useRef } from 'react';
import { ImagePreviewList } from './ImagePreviewList';
import { LoadingSpinner } from './LoadingSpinner';

interface PostFormProps {
  onSubmit: (data: { message: string; messageJson?: JSONContent | null; images: ImageMetadata[] }) => void;
  onChange?: (data: { message: string; messageJson?: JSONContent | null; images: ImageMetadata[] }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  initialMessage?: string;
  initialMessageJson?: JSONContent | null;
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
  initialMessageJson = null,
  initialImages = [],
  children,
  onTextAreaClick,
  submitDisabled = false,
}: PostFormProps) => {
  const messageJsonRef = useRef<JSONContent | null>(initialMessageJson);
  const messagePlainTextRef = useRef<string>(initialMessage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading } =
    useImageUpload({
      initialImages,
      onUploadComplete: (images) => {
        if (onChange) {
          onChange({ 
            message: messagePlainTextRef.current, 
            messageJson: messageJsonRef.current, 
            images 
          });
        }
      },
      onError: error => {
        alert(error);
      },
    });

  const { handlePaste: handleClipboardPaste } = useClipboardImagePaste({
    onImagePaste: uploadImages,
    onError: error => {
      alert(error);
    },
    enabled: !disabled,
  });

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadImages,
    acceptedFileTypes: ['image/'],
  });

  const handleRemoveImage = (imageId: string) => {
    removeImage(imageId);
    if (onChange) {
      const updatedImages = completedImages.filter(img => 
        uploadingImages.find(ui => ui.id === imageId)?.metadata?.url !== img.url
      );
      onChange({ 
        message: messagePlainTextRef.current, 
        messageJson: messageJsonRef.current, 
        images: updatedImages 
      });
    }
  };

  useEffect(() => {
    messageJsonRef.current = initialMessageJson;
    messagePlainTextRef.current = initialMessage;
  }, [initialMessage, initialMessageJson]);

  const handleEditorChange = (json: JSONContent, text: string) => {
    messageJsonRef.current = json;
    messagePlainTextRef.current = text;

    if (onChange) {
      onChange({
        message: text,
        messageJson: json,
        images: completedImages,
      });
    }
  };

  const handleSubmit = () => {
    if (messagePlainTextRef.current.trim() || completedImages.length > 0) {
      onSubmit({
        message: messagePlainTextRef.current,
        messageJson: messageJsonRef.current,
        images: completedImages,
      });
    }
  };

  useEffect(() => {
    if (!isLoading && !initialMessage && !initialMessageJson && initialImages.length === 0) {
      clearImages();
      messagePlainTextRef.current = '';
      messageJsonRef.current = null;
    }
  }, [isLoading, initialMessage, initialMessageJson, initialImages.length, clearImages]);

  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSubmitDisabled =
    (!messagePlainTextRef.current.trim() && completedImages.length === 0) ||
    disabled ||
    isLoading ||
    submitDisabled ||
    isUploading ||
    hasUploadingImages;

  return (
    <div ref={formRef} className="relative" {...dragHandlers}>
      {children}

      <div className={`px-2 transition-colors md:px-7 ${isDragging ? 'bg-blue-50' : ''}`}>
        <div className="relative cursor-text rounded-xl py-3">
          <TiptapEditor
            content={initialMessageJson}
            onChange={handleEditorChange}
            placeholder={placeholder}
            disabled={disabled}
            minHeight={240}
            onEditorClick={onTextAreaClick}
            className="min-h-[240px]"
            onKeyDown={(e) => {
              if (e.metaKey && e.key === 'Enter') {
                if (messagePlainTextRef.current.trim() || completedImages.length > 0) {
                  e.preventDefault();
                  handleSubmit();
                  return true;
                }
              }
              return false;
            }}
            onPaste={handleClipboardPaste}
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
