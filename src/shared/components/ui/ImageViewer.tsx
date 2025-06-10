'use client';

import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine } from '@remixicon/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ images, initialIndex = 0, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-80"
      onClick={handleBackgroundClick}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black bg-opacity-50 text-white transition-opacity hover:bg-opacity-70"
        >
          <RiCloseLine className="h-6 w-6" />
        </button>

        {/* 이미지 카운터 (여러 이미지일 때) */}
        {images.length > 1 && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-black bg-opacity-50 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 이전 버튼 */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className={`absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black bg-opacity-50 text-white transition-opacity hover:bg-opacity-70 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <RiArrowLeftSLine className="h-8 w-8" />
          </button>
        )}

        {/* 다음 버튼 */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={`absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black bg-opacity-50 text-white transition-opacity hover:bg-opacity-70 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <RiArrowRightSLine className="h-8 w-8" />
          </button>
        )}

        {/* 이미지 */}
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={images[currentIndex]}
            alt={`이미지 ${currentIndex + 1}`}
            width={800}
            height={600}
            className="h-auto max-h-[90vh] max-w-[90vw] w-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}