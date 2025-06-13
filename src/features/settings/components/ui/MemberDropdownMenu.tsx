'use client';

import { DropdownMenu, DropdownMenuItem } from '@/shared/components/ui';
import { Trash2 } from 'lucide-react';
import React from 'react';

interface MemberDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  memberName: string;
  position?: { top: number; left: number };
}

export const MemberDropdownMenu: React.FC<MemberDropdownMenuProps> = ({
  isOpen,
  onClose,
  onDelete,
  memberName: _memberName,
  position,
}) => {
  const handleDeleteClick = () => {
    onDelete();
    onClose();
  };

  return (
    <DropdownMenu isOpen={isOpen} onClose={onClose} position={position}>
      <DropdownMenuItem onClick={handleDeleteClick} variant="danger">
        <Trash2 className="h-4 w-4" />
        <span>멤버 삭제</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
};
