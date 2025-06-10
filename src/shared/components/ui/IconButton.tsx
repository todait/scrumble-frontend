import React from 'react';
import { cn } from '@/shared/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  title,
  className,
  disabled = false,
  type = 'button',
  ariaLabel,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-label={ariaLabel || title}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'bg-transparent hover:bg-gray-100',
        'active:scale-95 active:bg-gray-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'flex items-center justify-center',
        className
      )}
    >
      {icon}
    </button>
  );
};