'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface CreateSpaceButtonProps {
  onClick: () => void;
}

export const CreateSpaceButton: React.FC<CreateSpaceButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      icon={<Plus className="w-5 h-5" />}
      className="flex-1 max-w-[255px] font-normal"
    >
      스페이스 만들기
    </Button>
  );
}; 