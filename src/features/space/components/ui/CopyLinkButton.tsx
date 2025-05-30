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
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="full"
      icon={<Link className="w-5 h-5" />}
      className="justify-start font-normal gap-[10px]"
    >
      초대 링크 복사하기
    </Button>
  );
}; 