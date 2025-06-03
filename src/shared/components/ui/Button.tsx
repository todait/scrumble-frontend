'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/shared/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-pretendard transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-[#181818] text-white hover:bg-[#000000]',
        secondary: 'bg-white text-[#181818] border border-[rgba(24,24,24,0.2)] hover:shadow-sm hover:border-[rgba(24,24,24,0.3)]',
        ghost: 'bg-transparent hover:bg-gray-100',
      },
      size: {
        sm: 'min-h-[40px] px-3 py-2 text-sm',
        md: 'min-h-[40px] px-5 py-2 text-base',
        lg: 'min-h-[48px] px-6 py-3 text-lg',
        full: 'w-full min-h-[40px] px-5 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};