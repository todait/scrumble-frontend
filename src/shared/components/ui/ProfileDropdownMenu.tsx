'use client';

import { LogOut, Settings } from 'lucide-react';
import React from 'react';
import { DropdownMenu, DropdownMenuDivider, DropdownMenuItem } from './DropdownMenu';

interface ProfileDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSettings: () => void;
  position?: { top: number; left: number };
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  isOpen,
  onClose,
  onLogout,
  onSettings,
  position,
}) => {
  const handleSettings = () => {
    onSettings();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <DropdownMenu isOpen={isOpen} onClose={onClose} position={position}>
      <DropdownMenuItem onClick={handleSettings}>
        <Settings className="h-4 w-4" />
        <span>설정</span>
      </DropdownMenuItem>
      <DropdownMenuDivider />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
};