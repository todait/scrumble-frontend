import React from 'react';

import { Button } from '@/shared/components/ui';

interface InviteButtonProps {
  emailCount: number;
  onClick: () => void;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  emailCount,
  onClick,
  disabled = false,
  buttonText = emailCount > 0 ? `${emailCount}명 초대하기` : '초대할 이메일을 입력하세요',
  className,
  size = 'full',
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || emailCount === 0}
      size={size}
      className={`font-normal ${className || ''}`}
    >
      {buttonText}
    </Button>
  );
};
