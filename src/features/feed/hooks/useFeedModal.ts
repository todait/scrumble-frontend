import { useState } from 'react';

interface UseFeedModalReturn {
  isCheckOutModalOpen: boolean;
  openCheckOutModal: () => void;
  closeCheckOutModal: () => void;
}

/**
 * 피드 모달 상태를 관리하는 커스텀 훅
 * @returns 모달 관련 상태와 함수들
 */
export const useFeedModal = (): UseFeedModalReturn => {
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  const openCheckOutModal = () => {
    setIsCheckOutModalOpen(true);
  };

  const closeCheckOutModal = () => {
    setIsCheckOutModalOpen(false);
  };

  return {
    isCheckOutModalOpen,
    openCheckOutModal,
    closeCheckOutModal,
  };
};