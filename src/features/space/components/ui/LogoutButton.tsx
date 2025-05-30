'use client';

import React from 'react';

import { Button } from '@/shared/components/ui';

interface LogoutButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onClick, 
  isLoading = false 
}) => {
  return (
    <Button
      onClick={onClick}
      isLoading={isLoading}
      variant="secondary"
      className="flex-1 max-w-[255px] font-normal"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </Button>
  );
}; 