'use client';

import { useImageUpload } from '@/shared/hooks/useImageUpload';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { RiCheckLine, RiCloseLine, RiImageLine } from '@remixicon/react';
import Image from 'next/image';
import { DragEvent, useCallback, useEffect, useRef, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const formRef = useRef<HTMLDivElement>(null);

  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading } =
    useImageUpload({
      initialImages,
      onError: error => {
        alert(error);
      },
    });

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  // 드래그 이벤트 핸들러
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const hasImages = Array.from(e.dataTransfer.items).some(item =>
        item.type.startsWith('image/')
      );
      if (hasImages) {
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

      if (files.length > 0) {
        uploadImages(files);
      }
    },
    [uploadImages]
  );

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadImages(files);
    }
    // 같은 파일 재선택 가능하도록 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 클릭 핸들러 (완료된 이미지의 인덱스 기준)
  const handleImageClick = (imageUrl: string) => {
    const completedImageUrls = completedImages.map(img => img.url);
    const index = completedImageUrls.indexOf(imageUrl);
    if (index !== -1) {
      setSelectedImageIndex(index);
      setViewerOpen(true);
    }
  };

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
    <div
      ref={formRef}
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      <div className={`px-2 transition-colors md:px-7 ${isDragging ? 'bg-blue-50' : ''}`}>
        <div className="cursor-text rounded-xl p-3" onClick={onTextAreaClick}>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            className="h-[240px] w-full resize-none border-none p-[10px] text-[15px] text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
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
            onChange={handleFileSelect}
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
            const isUploading = img.progress > 0 && img.progress < 100 && !img.error;
            const isCompleted = img.progress === 100 && img.metadata && !img.error;

            return (
              <div key={img.id} className="group relative flex-shrink-0">
                <div
                  className={`relative h-[80px] w-[80px] overflow-hidden rounded-lg bg-gray-100 transition-opacity ${
                    isCompleted ? 'cursor-pointer' : ''
                  } ${isUploading ? 'opacity-60' : 'opacity-100'}`}
                  onClick={() => {
                    if (isCompleted && img.metadata) {
                      handleImageClick(img.metadata.url);
                    }
                  }}
                >
                  <Image
                    src={img.preview}
                    alt={img.file.name}
                    width={80}
                    height={80}
                    className={`h-full w-full object-cover transition-all ${
                      isUploading ? 'blur-[1px] brightness-75' : ''
                    }`}
                    draggable={false}
                  />

                  {/* 업로드 진행률 */}
                  {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
                      <div className="mb-2 h-1.5 w-12 rounded-full bg-white bg-opacity-30">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-300"
                          style={{ width: `${Math.round(img.progress)}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium text-white">
                        {Math.round(img.progress)}%
                      </div>
                    </div>
                  )}

                  {/* 에러 상태 */}
                  {img.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 p-2">
                      <div className="text-center text-xs text-white">{img.error}</div>
                    </div>
                  )}

                  {/* 삭제 버튼 */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                    disabled={isUploading}
                  >
                    <RiCloseLine className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-4 text-center font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
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
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};
