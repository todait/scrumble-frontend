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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA] px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="mb-4">
          <button
            onClick={onClose}
            className="mb-4 flex items-center gap-1 px-2 py-2 opacity-50 transition-opacity hover:opacity-70"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-200">
              <RiCloseLine className="h-5 w-5 text-black" />
            </div>
            <span className="text-[15px] text-black">나가기</span>
          </button>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
          {children}
        </div>
      </div>
    </div>
  );
};