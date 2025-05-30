'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface InviteSpaceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const InviteSpaceButton: React.FC<InviteSpaceButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="full"
      icon={<Users className="w-5 h-5" />}
      className="max-w-[524px] justify-start font-normal"
    >
      초대받은 스페이스에 입장하기
    </Button>
  );
}; 