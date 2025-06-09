'use client';

import { RiArrowRightLine } from '@remixicon/react';

interface FloatingCheckoutButtonProps {
  onClick: () => void;
}

export function FloatingCheckoutButton({ onClick }: FloatingCheckoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-20 flex items-center gap-1 rounded-full border border-[rgba(34,34,34,0.2)] bg-white px-6 py-4 shadow-lg transition-all hover:shadow-xl"
    >
      <span className="text-[15px] font-medium text-[#222222]">체크아웃하기</span>
      <RiArrowRightLine className="h-5 w-5 text-[#222222]" />
    </button>
  );
}
