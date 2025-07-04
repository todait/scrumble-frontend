'use client';

import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
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
  MAX_WIDTH: 530, // PostContent 전체 너비까지 가능
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
  
  // 극단적으로 가로가 긴 이미지 처리 (비율 > 5)
  if (aspectRatio > 5) {
    width = SIZE_LIMITS.MAX_WIDTH;
    height = Math.max(SIZE_LIMITS.MIN_HEIGHT / 2, SIZE_LIMITS.MAX_WIDTH / aspectRatio);
  }
  // 극단적으로 세로가 긴 이미지 처리 (비율 < 0.2)
  else if (aspectRatio < 0.2) {
    height = SIZE_LIMITS.MAX_HEIGHT;
    width = Math.max(SIZE_LIMITS.MIN_WIDTH / 2, SIZE_LIMITS.MAX_HEIGHT * aspectRatio);
  }
  // 세로형 이미지 (비율 < 1)
  else if (aspectRatio < 1) {
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
  
  // 최종 안전 장치: 최대 너비 제한
  width = Math.min(width, SIZE_LIMITS.MAX_WIDTH);
  
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
    let width = Math.round(targetHeight * aspectRatio);
    
    // 극단적으로 가로가 긴 이미지 처리 (비율 > 5)
    if (aspectRatio > 5) {
      width = Math.min(400, targetHeight * aspectRatio); // 다중 이미지에서도 적당한 크기
    }
    // 극단적으로 세로가 긴 이미지 처리 (비율 < 0.2)
    else if (aspectRatio < 0.2) {
      width = Math.max(150, targetHeight * aspectRatio); // 최소 너비 보장
    }
    
    // 너비가 범위를 벗어나는 경우 처리
    // 최소/최대 너비로 제한하고, object-fit: cover로 크롭됨
    const finalWidth = Math.max(150, Math.min(400, width)); // 다중 이미지도 적당한 크기
    
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
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set());

  // 프로덕션에서 디버깅을 위한 로그
  useEffect(() => {
    console.warn('[ImageGallery] Images changed:', images);
  }, [images]);

  // 이미지 배열이 변경될 때 에러 상태 초기화
  useEffect(() => {
    setLoadErrors(new Set());
  }, [images]);

  // 이미지 로드 에러 처리
  const handleImageError = useCallback((index: number) => {
    setLoadErrors(prev => new Set(prev).add(index));
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ImageGallery] Failed to load image at index ${index}:`, images[index]);
    }
  }, [images]);

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
          style={{ 
            width,
            height,
            maxWidth: '100%' // 부모 컨테이너 너비 초과 방지
          }}
        >
          {loadErrors.has(0) ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
              <span className="text-sm">이미지를 불러올 수 없습니다</span>
            </div>
          ) : (
            <Image
              src={image.url}
              alt={image.name || '첨부 이미지'}
              width={width}
              height={height}
              className="h-full w-full object-cover"
              onError={() => handleImageError(0)}
            />
          )}
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
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            maxWidth: '100%' // 부모 컨테이너 너비 초과 방지
          }}
        >
          {images.map((image, index) => {
            const { width, height } = imageSizes[index];
            
            return (
              <div
                key={index}
                className="flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleImageClick(index, e)}
                onDragStart={(e) => e.preventDefault()}
                style={{ 
                  width,
                  height
                }}
              >
                {loadErrors.has(index) ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
                    <span className="text-xs">이미지 오류</span>
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={image.name || `첨부 이미지 ${index + 1}`}
                    width={width}
                    height={height}
                    className="h-full w-full object-cover"
                    draggable={false}
                    onError={() => handleImageError(index)}
                  />
                )}
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