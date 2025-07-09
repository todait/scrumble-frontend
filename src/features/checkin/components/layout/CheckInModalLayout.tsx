// CheckInModalLayout 수정 - Close 버튼과 이전 버튼을 상단에 배치
'use client';

import { RiArrowLeftSLine, RiCloseLine } from '@remixicon/react';
import { ReactNode } from 'react';

interface CheckInModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const CheckInModalLayout = ({
  isOpen,
  onClose,
  children,
  showBackButton = false,
  onBack,
}: CheckInModalLayoutProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-50 bg-black/50 transition-opacity" onClick={onClose} />

      {/* 모달 컨테이너 */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 md:py-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full max-w-[640px]">
          {/* 상단 버튼들 */}
          <div className="mb-3 flex items-center justify-between md:mb-4">
            {/* 이전 버튼 - 왼쪽 상단 */}
            {showBackButton && onBack ? (
              <button onClick={onBack} className="flex items-center gap-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F1F1] bg-opacity-50 transition-all hover:bg-gray-100">
                  <RiArrowLeftSLine className="h-5 w-5 text-[#222222]" />
                </span>
                <span className="text-sm font-medium text-[#222222] text-opacity-80">이전</span>
              </button>
            ) : (
              <div />
            )}

            {/* Close 버튼 - 오른쪽 상단 */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F1F1] bg-opacity-50 transition-all hover:bg-gray-100"
            >
              <RiCloseLine className="h-5 w-5 text-[#222222]" />
            </button>
          </div>

          <div className="rounded-xl border border-black/8 bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
