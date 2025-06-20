import { useState, useCallback } from 'react';

interface UseImageViewerReturn {
  isOpen: boolean;
  selectedIndex: number;
  openViewer: (index: number) => void;
  closeViewer: () => void;
  handleImageClick: (imageUrl: string, imageUrls: string[]) => void;
}

export const useImageViewer = (): UseImageViewerReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openViewer = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleImageClick = useCallback((imageUrl: string, imageUrls: string[]) => {
    const index = imageUrls.indexOf(imageUrl);
    if (index !== -1) {
      openViewer(index);
    }
  }, [openViewer]);

  return {
    isOpen,
    selectedIndex,
    openViewer,
    closeViewer,
    handleImageClick,
  };
};