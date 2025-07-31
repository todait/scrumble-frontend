'use client';

import { Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/components/ui';

interface CreateSpaceButtonProps {
  onClick: () => void;
}

export const CreateSpaceButton: React.FC<CreateSpaceButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      icon={<Plus className="w-5 h-5" />}
      className="w-full max-w-[480px] font-normal h-[54px] border border-[#1D1D1F]/10 hover:border-[#181818] rounded-[12px]"
    >
      스페이스 만들기
    </Button>
  );
}; 