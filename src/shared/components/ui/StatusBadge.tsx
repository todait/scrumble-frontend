'use client';

import { RiPokerClubsFill, RiPokerDiamondsFill } from '@remixicon/react';

interface StatusBadgeProps {
  type: 'checkin' | 'checkout';
  className?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG = {
  checkin: {
    label: '체크인',
    icon: RiPokerClubsFill,
    color: 'text-[#39CD32]',
  },
  checkout: {
    label: '체크아웃', 
    icon: RiPokerDiamondsFill,
    color: 'text-[#009DFF]',
  },
} as const;

export function StatusBadge({ type, className = '', showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {showIcon && <Icon className={`h-3 w-3 ${config.color} -mt-[0.5px]`} />}
      <span className={`text-[13px] font-medium leading-none ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}