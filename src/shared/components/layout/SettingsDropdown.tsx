'use client';

import { RiFeedbackLine, RiLogoutBoxLine, RiSettings6Line, RiTeamLine } from '@remixicon/react';
import Link from 'next/link';
import { forwardRef } from 'react';

interface DropdownMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  isRed?: boolean;
  isDivider?: boolean;
}

interface SettingsDropdownProps {
  spaceSlug: string;
  onLogout: () => void;
  className?: string;
}

export const SettingsDropdown = forwardRef<HTMLDivElement, SettingsDropdownProps>(
  ({ spaceSlug, onLogout, className = '' }, ref) => {
    const dropdownMenuItems: DropdownMenuItem[] = [
      {
        icon: RiTeamLine,
        label: '스페이스 정보',
        href: `/${spaceSlug}/settings/space`,
      },
      {
        icon: RiSettings6Line,
        label: '설정',
        href: `/${spaceSlug}/settings`,
      },
      {
        icon: RiFeedbackLine,
        label: '피드백',
        href: '/feedback',
        isDivider: true,
      },
      {
        icon: RiLogoutBoxLine,
        label: '로그아웃',
        onClick: onLogout,
        isRed: true,
      },
    ];

    return (
      <div
        ref={ref}
        className={`z-50 flex w-[200px] flex-col gap-[8px] rounded-[16px] border border-[rgba(34,34,34,0.08)] bg-white p-[10px] shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] ${className}`}
      >
        {dropdownMenuItems.map((item, index) => {
          const ItemIcon = item.icon;
          const isLast = index === dropdownMenuItems.length - 1;

          return (
            <div key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] transition-colors hover:bg-[rgba(34,34,34,0.04)] ${
                    item.isRed ? 'text-[#E04646]' : 'text-[#222222]'
                  }`}
                >
                  <div className="flex h-4 w-4 items-center justify-center">
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[12px] leading-[1.2] ${
                      item.isRed ? 'font-bold' : 'font-semibold'
                    }`}
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    {item.label}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left transition-colors hover:bg-[rgba(34,34,34,0.04)] ${
                    item.isRed ? 'text-[#E04646]' : 'text-[#222222]'
                  }`}
                >
                  <div className="flex h-4 w-4 items-center justify-center">
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[12px] leading-[1.2] ${
                      item.isRed ? 'font-bold' : 'font-semibold'
                    }`}
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    {item.label}
                  </span>
                </button>
              )}
              {/* 구분선 */}
              {item.isDivider && !isLast && (
                <div className="mt-[10px] h-0 border-t border-[rgba(34,34,34,0.08)]" />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

SettingsDropdown.displayName = 'SettingsDropdown';
