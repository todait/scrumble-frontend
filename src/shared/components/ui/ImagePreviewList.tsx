'use client';

import { useDragScroll } from '@/shared/hooks/useDragScroll';
import { useImageViewer } from '@/shared/hooks/useImageViewer';
import type { UploadingImage } from '@/shared/types/upload.types';
import React from 'react';
import { ImagePreview } from './ImagePreview';

interface ImagePreviewListProps {
  images: UploadingImage[];
  onRemove: (id: string) => void;
  onImageClick?: (image: UploadingImage) => void;
  disabled?: boolean;
  className?: string;
  gap?: string; // Default: 'gap-2'
  uploadButton?: React.ReactNode; // Optional upload button to include in the list
}

export function ImagePreviewList({
  images,
  onRemove,
  onImageClick,
  disabled = false,
  className = '',
  gap = 'gap-2',
  uploadButton,
}: ImagePreviewListProps) {
  const { scrollRef, isDragging, dragHandlers, dragDistance } = useDragScroll();
  const imageViewer = useImageViewer();

  const handleImageClick = (image: UploadingImage) => {
    // Only handle click if not dragging (drag distance <= 5px)
    if (dragDistance <= 5 && image.metadata && image.progress === 100 && !image.error) {
      if (onImageClick) {
        onImageClick(image);
      } else {
        // Default behavior: open image viewer
        const completedImages = images
          .filter(img => img.metadata && img.progress === 100 && !img.error)
          .map(img => img.metadata!);
        
        imageViewer.handleImageClick(
          image.metadata.url,
          completedImages.map(i => i.url)
        );
      }
    }
  };

  if (images.length === 0 && !uploadButton) {
    return null;
  }

  return (
    <>
      <div 
        ref={scrollRef}
        className={`scrollbar-hide flex ${gap} overflow-x-auto cursor-grab select-none ${className}`}
        {...dragHandlers}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Optional upload button */}
        {uploadButton}
        
        {/* Image previews */}
        {images.map(img => {
          const isCompleted = img.progress === 100 && img.metadata && !img.error;

          return (
            <ImagePreview
              key={img.id}
              image={img}
              onRemove={onRemove}
              onClick={isCompleted ? () => handleImageClick(img) : undefined}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Image viewer modal */}
      {imageViewer.isOpen && (
        <ImageViewer
          images={images
            .filter(img => img.metadata && img.progress === 100 && !img.error)
            .map(img => img.metadata!.url)}
          initialIndex={imageViewer.selectedIndex}
          isOpen={imageViewer.isOpen}
          onClose={imageViewer.closeViewer}
        />
      )}
    </>
  );
}

// Import ImageViewer only when needed
const ImageViewer = React.lazy(() => 
  import('./ImageViewer').then(module => ({ default: module.ImageViewer }))
);