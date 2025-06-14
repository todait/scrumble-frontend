'use client';

import { RiArrowRightLine } from '@remixicon/react';

interface FloatingCheckoutButtonProps {
  onClick: () => void;
}

export function FloatingCheckoutButton({ onClick }: FloatingCheckoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-full border border-[rgba(34,34,34,0.2)] bg-white px-5 py-3 shadow-lg transition-all hover:shadow-xl md:px-6 md:py-4"
    >
      <span className="text-sm font-medium text-[#222222] md:text-[15px]">체크아웃하기</span>
      <RiArrowRightLine className="h-4 w-4 text-[#222222] md:h-5 md:w-5" />
    </button>
  );
}
