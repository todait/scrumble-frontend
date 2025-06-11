'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { ImageViewer } from './ImageViewer';

interface ImageGalleryProps {
  images: string[];
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: (index: number, event: React.MouseEvent) => void;
}

export function ImageGallery({ images, size = 'medium', className = '', onClick }: ImageGalleryProps) {
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

  // 크기별 설정
  const sizeConfig = {
    small: {
      single: { width: 320, height: 240, maxWidth: 'max-w-xs' },
      multiple: { width: 96, height: 96, className: 'h-24 w-24' },
    },
    medium: {
      single: { width: 320, height: 240, maxWidth: 'max-w-sm' },
      multiple: { width: 128, height: 128, className: 'h-32 w-32' },
    },
    large: {
      single: { width: 400, height: 300, maxWidth: 'max-w-md' },
      multiple: { width: 160, height: 160, className: 'h-40 w-40' },
    },
  };

  const config = sizeConfig[size];

  // 단일 이미지
  if (images.length === 1) {
    return (
      <>
        <div 
          className={`${config.single.maxWidth} overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity ${className}`}
          onClick={(e) => handleImageClick(0, e)}
        >
          <Image
            src={images[0]}
            alt="첨부 이미지"
            width={config.single.width}
            height={config.single.height}
            className="h-auto w-full object-cover"
            style={{ aspectRatio: '4/3' }}
          />
        </div>
        <ImageViewer
          images={images}
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
          {images.map((image, index) => (
            <div
              key={index}
              className={`${config.multiple.className} flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={(e) => handleImageClick(index, e)}
              onDragStart={(e) => e.preventDefault()} // 이미지 드래그 방지
            >
              <Image
                src={image}
                alt={`첨부 이미지 ${index + 1}`}
                width={config.multiple.width}
                height={config.multiple.height}
                className="h-full w-full object-cover"
                draggable={false} // 이미지 드래그 방지
              />
            </div>
          ))}
        </div>
      </div>
      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}