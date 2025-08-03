import { Link } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/components/ui';

interface CopyLinkButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E5E7] text-[#666666] text-[14px] font-normal font-pretendard rounded-[12px] hover:bg-[#F5F5F7] hover:border-[#D1D1D6] active:bg-[#EBEBF0] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
    >
      <Link className="w-4 h-4" />
      초대 링크 복사하기
    </button>
  );
}; 