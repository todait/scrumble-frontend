'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { ImageViewer } from './ImageViewer';
import type { ImageMetadata } from '@/shared/types/upload.types';

interface ImageGalleryProps {
  images: ImageMetadata[];
  className?: string;
  onClick?: (index: number, event: React.MouseEvent) => void;
}

// 크기 제한 상수
const SIZE_LIMITS = {
  MIN_WIDTH: 320,
  MAX_WIDTH: 530,
  MIN_HEIGHT: 320,
  MAX_HEIGHT: 420,
};

// 단일 이미지 크기 계산 - 범위 내에서 최대한 크게 표시
function calculateSingleImageSize(originalWidth: number, originalHeight: number) {
  if (originalWidth === 0 || originalHeight === 0) {
    return { width: SIZE_LIMITS.MIN_WIDTH, height: SIZE_LIMITS.MIN_HEIGHT };
  }
  
  const aspectRatio = originalWidth / originalHeight;
  let width: number;
  let height: number;
  
  // 세로형 이미지 (비율 < 1)
  if (aspectRatio < 1) {
    // 높이를 최대로 설정하고 너비 계산
    height = SIZE_LIMITS.MAX_HEIGHT;
    width = height * aspectRatio;
    
    // 너비가 최소값보다 작으면 너비 기준으로 재계산
    if (width < SIZE_LIMITS.MIN_WIDTH) {
      width = SIZE_LIMITS.MIN_WIDTH;
      height = width / aspectRatio;
    }
  } 
  // 가로형 이미지 (비율 >= 1)
  else {
    // 너비를 최대로 설정하고 높이 계산
    width = SIZE_LIMITS.MAX_WIDTH;
    height = width / aspectRatio;
    
    // 높이가 최소값보다 작으면 높이 기준으로 재계산
    if (height < SIZE_LIMITS.MIN_HEIGHT) {
      height = SIZE_LIMITS.MIN_HEIGHT;
      width = height * aspectRatio;
    }
    
    // 높이가 최대값을 초과하면 높이 기준으로 재계산
    if (height > SIZE_LIMITS.MAX_HEIGHT) {
      height = SIZE_LIMITS.MAX_HEIGHT;
      width = height * aspectRatio;
    }
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}


// 여러 이미지의 공통 높이 계산
function calculateCommonHeight(images: ImageMetadata[]): number {
  // 모든 이미지가 세로형인지 확인 (비율 < 1)
  const allPortrait = images.every(img => {
    if (img.width === 0 || img.height === 0) return false;
    return img.width / img.height < 1;
  });
  
  if (allPortrait) {
    // 모든 이미지가 세로형이면 최대 높이 사용
    return SIZE_LIMITS.MAX_HEIGHT;
  }
  
  // 가로형 이미지가 하나라도 있으면 최소 높이 사용
  return SIZE_LIMITS.MIN_HEIGHT;
}

// 여러 이미지 크기 계산 (높이 통일)
function calculateMultipleImageSizes(images: ImageMetadata[]) {
  const targetHeight = calculateCommonHeight(images);
  
  return images.map(img => {
    if (img.width === 0 || img.height === 0) {
      return { width: SIZE_LIMITS.MIN_WIDTH, height: targetHeight };
    }
    
    const aspectRatio = img.width / img.height;
    const width = Math.round(targetHeight * aspectRatio);
    
    // 너비가 범위를 벗어나는 경우 처리
    // 최소/최대 너비로 제한하고, object-fit: cover로 크롭됨
    const finalWidth = Math.max(SIZE_LIMITS.MIN_WIDTH, Math.min(SIZE_LIMITS.MAX_WIDTH, width));
    
    return {
      width: finalWidth,
      height: targetHeight
    };
  });
}

export function ImageGallery({ images, className = '', onClick }: ImageGalleryProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handleImageClick = (index: number, event: React.MouseEvent) => {
    // 드래그 거리가 5px 이상이면 클릭으로 간주하지 않음
    if (dragDistance > 5) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    event.stopPropagation();
    
    if (onClick) {
      onClick(index, event);
    } else {
      setSelectedImageIndex(index);
      setViewerOpen(true);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setDragDistance(0); // 드래그 거리 초기화
    scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setDragDistance(0);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
    // 드래그 거리는 유지하여 클릭 이벤트에서 판단할 수 있도록 함
    // 약간의 지연 후에 리셋 (클릭 이벤트가 먼저 실행되도록)
    setTimeout(() => setDragDistance(0), 50);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    const currentDragDistance = Math.abs(x - startX);
    setDragDistance(currentDragDistance);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);
  if (!images || images.length === 0) return null;

  const imageUrls = images.map(img => img.url);
  const isMultiple = images.length > 1;

  // 크기 계산
  const imageSizes = isMultiple 
    ? calculateMultipleImageSizes(images)
    : [calculateSingleImageSize(images[0].width, images[0].height)];

  // 단일 이미지
  if (!isMultiple) {
    const image = images[0];
    const { width, height } = imageSizes[0];
    
    return (
      <>
        <div 
          className={`overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity ${className}`}
          onClick={(e) => handleImageClick(0, e)}
          style={{ width, height }}
        >
          <Image
            src={image.url}
            alt={image.name || '첨부 이미지'}
            width={width}
            height={height}
            className="h-full w-full object-cover"
          />
        </div>
        <ImageViewer
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </>
    );
  }

  // 다중 이미지
  return (
    <>
      <div className={`overflow-hidden ${className}`}>
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={(e) => {
            // 드래그 후에는 클릭 이벤트 전파를 막음
            if (dragDistance > 5) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {images.map((image, index) => {
            const { width, height } = imageSizes[index];
            
            return (
              <div
                key={index}
                className="flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleImageClick(index, e)}
                onDragStart={(e) => e.preventDefault()}
                style={{ width, height }}
              >
                <Image
                  src={image.url}
                  alt={image.name || `첨부 이미지 ${index + 1}`}
                  width={width}
                  height={height}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>
      <ImageViewer
        images={imageUrls}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}