import { useState } from 'react';

/**
 * 모달 상태를 관리하는 공통 훅
 * 모든 모달 컴포넌트에서 재사용 가능
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};