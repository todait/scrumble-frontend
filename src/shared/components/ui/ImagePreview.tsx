'use client';

import type { UploadingImage } from '@/shared/types/upload.types';
import { RiCloseLine } from '@remixicon/react';
import Image from 'next/image';
import { LoadingSpinner } from './LoadingSpinner';

interface ImagePreviewProps {
  image: UploadingImage;
  onRemove: (id: string) => void;
  onClick?: () => void;
  disabled?: boolean;
}

export const ImagePreview = ({ image, onRemove, onClick, disabled = false }: ImagePreviewProps) => {
  const isUploading = image.progress > 0 && image.progress < 100 && !image.error;
  const isConverting = image.isConverting || false;
  const isCompleted = image.progress === 100 && image.metadata && !image.error;
  const isProcessing = isUploading || isConverting;

  return (
    <div className="group relative flex-shrink-0">
      <div
        className={`relative h-[80px] w-[80px] overflow-hidden rounded-lg bg-gray-100 transition-opacity ${
          isCompleted && onClick ? 'cursor-pointer' : ''
        } ${isProcessing ? 'opacity-60' : 'opacity-100'}`}
        onClick={onClick}
      >
        <Image
          src={image.preview}
          alt={image.file.name}
          width={80}
          height={80}
          className={`h-full w-full object-cover transition-all ${
            isProcessing ? 'blur-[1px] brightness-75' : ''
          }`}
          draggable={false}
        />

        {/* HEIC 변환 중 */}
        {isConverting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
            <LoadingSpinner size="sm" className="mb-2 text-white" />
            <div className="text-xs font-medium text-white">
              변환 중
            </div>
          </div>
        )}

        {/* 업로드 진행률 */}
        {isUploading && !isConverting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
            <div className="mb-2 h-1.5 w-12 rounded-full bg-white bg-opacity-30">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${Math.round(image.progress)}%` }}
              />
            </div>
            <div className="text-xs font-medium text-white">
              {Math.round(image.progress)}%
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {image.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 p-2">
            <div className="text-center text-xs text-white">{image.error}</div>
          </div>
        )}

        {/* 삭제 버튼 */}
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          disabled={isProcessing || disabled}
        >
          <RiCloseLine className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
};