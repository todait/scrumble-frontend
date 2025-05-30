'use client';

import React from 'react';
import { Button } from '@/shared/components/ui';

interface CreateButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ 
  disabled = false, 
  isLoading = false 
}) => {
  return (
    <Button
      type="submit"
      disabled={disabled}
      isLoading={isLoading}
      size="full"
      className="max-w-[524px] font-medium"
    >
      {isLoading ? '생성 중...' : '다음'}
    </Button>
  );
}; 