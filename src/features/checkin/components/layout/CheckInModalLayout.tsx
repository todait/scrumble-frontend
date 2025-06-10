'use client';

import { RiCloseLine } from '@remixicon/react';
import { ReactNode } from 'react';

interface CheckInModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const CheckInModalLayout = ({ isOpen, onClose, children }: CheckInModalLayoutProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="w-full max-w-[640px]">
        <div className="mb-4">
          <button
            onClick={onClose}
            className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all hover:bg-gray-100"
          >
            <RiCloseLine className="h-5 w-5 text-black" />
          </button>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
          {children}
        </div>
      </div>
      </div>
    </>
  );
};