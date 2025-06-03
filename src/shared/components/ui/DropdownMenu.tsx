'use client';

import React, { useEffect, useRef } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: { top: number; left: number };
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  children,
  position = { top: 0, left: 0 },
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`fixed z-[9999] min-w-[160px] rounded-lg border border-[rgba(24,24,24,0.08)] bg-white py-1 shadow-xl ${className}`}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  onClick,
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors';
  const variantStyles = {
    default: 'text-[#181818] hover:bg-gray-50',
    danger: 'text-red-600 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const DropdownMenuDivider: React.FC = () => {
  return <div className="my-1 h-px bg-[rgba(24,24,24,0.08)]" />;
};