'use client';

import Image from 'next/image';
import { useState } from 'react';
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

  const handleImageClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onClick) {
      onClick(index, event);
    } else {
      setSelectedImageIndex(index);
      setViewerOpen(true);
    }
  };
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
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`${config.multiple.className} flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1] cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={(e) => handleImageClick(index, e)}
            >
              <Image
                src={image}
                alt={`첨부 이미지 ${index + 1}`}
                width={config.multiple.width}
                height={config.multiple.height}
                className="h-full w-full object-cover"
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