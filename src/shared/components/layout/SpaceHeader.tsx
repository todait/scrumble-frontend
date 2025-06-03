'use client';

import { ProfileDropdownMenu } from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

interface SpaceHeaderProps {
  spaceId: string;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({ spaceId }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { name: '홈', href: `/${spaceId}/feed` },
    { name: '체크인', href: `/${spaceId}/checkin` },
    { name: '설정', href: `/${spaceId}/settings/space` },
  ];

  const isActive = (href: string) => {
    if (href === `/${spaceId}/feed`) {
      return pathname === href || pathname === `/${spaceId}`;
    }
    return pathname.startsWith(href);
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSettings = () => {
    router.push(`/${spaceId}/settings/space`);
  };

  const getDropdownPosition = () => {
    if (profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        left: rect.right - 160,
      };
    }
    return { top: 0, left: 0 };
  };

  return (
    <header className="w-full border-b border-black/8 bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-10 py-2.5">
        {/* 로고 */}
        <div className="flex h-12.5 w-35 items-center justify-center">
          <Link
            href={`/${spaceId}/feed`}
            className="font-poly text-[28px] font-normal leading-[33px] text-[#222222]"
          >
            Scrumbl.co
          </Link>
        </div>

        {/* 메뉴 및 프로필 */}
        <div className="flex items-center gap-2.5">
          {/* 네비게이션 메뉴 */}
          {navigationItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center rounded-lg px-2.5 py-1 text-[15px] leading-[22px] transition-all ${
                isActive(item.href)
                  ? 'bg-[#F6F6F6] font-bold text-black'
                  : 'font-normal text-black/50 hover:bg-gray-50 hover:text-black'
              } `}
            >
              {item.name}
            </Link>
          ))}

          {/* 사용자 프로필 */}
          <div ref={profileButtonRef} className="flex h-12.5 items-center justify-center px-2.5">
            <button
              onClick={handleProfileClick}
              className="relative cursor-pointer rounded-full transition-opacity hover:opacity-80"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="프로필"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* 온라인 상태 표시 */}
              <div className="absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-white bg-[#41A800]" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      <ProfileDropdownMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        onLogout={handleLogout}
        onSettings={handleSettings}
        position={getDropdownPosition()}
      />
    </header>
  );
};
