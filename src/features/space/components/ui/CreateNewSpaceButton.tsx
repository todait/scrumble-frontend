'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CreateNewSpaceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CreateNewSpaceButton: React.FC<CreateNewSpaceButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full max-w-[480px] h-[54px] px-4 inline-flex items-center justify-start gap-2.5 bg-white hover:bg-[#181818] active:bg-[#181818] text-[#1D1D1F] hover:text-white text-[15px] font-normal font-pretendard rounded-[12px] border border-[#1D1D1F]/10 hover:border-[#181818] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      새로운 스페이스 만들기
      <ArrowUpRight className="w-5 h-5 ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
};