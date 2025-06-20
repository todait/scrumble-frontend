import { DragEvent, useCallback, useRef, useState } from 'react';

interface UseDragAndDropOptions {
  onDrop: (files: File[]) => void;
  acceptedFileTypes?: string[];
}

export const useDragAndDrop = ({ onDrop, acceptedFileTypes = ['image/'] }: UseDragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const hasAcceptedFiles = Array.from(e.dataTransfer.items).some(item =>
        acceptedFileTypes.some(type => item.type.startsWith(type))
      );
      if (hasAcceptedFiles) {
        setIsDragging(true);
      }
    }
  }, [acceptedFileTypes]);

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

      const files = Array.from(e.dataTransfer.files).filter(file =>
        acceptedFileTypes.some(type => file.type.startsWith(type))
      );

      if (files.length > 0) {
        onDrop(files);
      }
    },
    [onDrop, acceptedFileTypes]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};