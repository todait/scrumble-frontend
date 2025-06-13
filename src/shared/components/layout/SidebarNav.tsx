'use client';

import {
  RiBarChartFill,
  RiBarChartLine,
  RiHeart3Fill,
  RiHeart3Line,
  RiHome5Fill,
  RiHome5Line,
  RiPencilFill,
  RiPencilLine,
  RiSettings6Fill,
  RiSettings6Line,
  RiUser6Fill,
  RiUser6Line,
} from '@remixicon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { SettingsDropdown } from './SettingsDropdown';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

interface SidebarNavProps {
  spaceSlug: string;
}

export function SidebarNav({ spaceSlug }: SidebarNavProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { logout } = useAuth();

  // 로그아웃 처리 함수
  function handleLogout() {
    setIsDropdownOpen(false);
    logout();
  }

  // 호버 이벤트 핸들러
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // 200ms 지연으로 의도하지 않은 닫힘 방지
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const navItems: NavItem[] = [
    {
      icon: RiHome5Line,
      activeIcon: RiHome5Fill,
      href: `/${spaceSlug}/feed`,
      label: '홈',
    },
    {
      icon: RiHeart3Line,
      activeIcon: RiHeart3Fill,
      href: `/${spaceSlug}/activity`,
      label: '활동',
    },
    {
      icon: RiPencilLine,
      activeIcon: RiPencilFill,
      href: `/${spaceSlug}/posts/checkins/new`,
      label: '체크인',
    },
    {
      icon: RiBarChartLine,
      activeIcon: RiBarChartFill,
      href: `/${spaceSlug}/reports`,
      label: '리포트',
    },
    {
      icon: RiUser6Line,
      activeIcon: RiUser6Fill,
      href: `/${spaceSlug}/my-page`,
      label: '마이페이지',
    },
  ];

  const settingsItem: NavItem = {
    icon: RiSettings6Line,
    activeIcon: RiSettings6Fill,
    href: `/${spaceSlug}/settings/space`,
    label: '설정',
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SettingsIcon = isActive(settingsItem.href) ? settingsItem.activeIcon : settingsItem.icon;

  return (
    <>
      {/* 데스크톱 사이드바 - 768px 이상에서만 표시 */}
      <div className="fixed left-2.5 top-0 z-10 hidden h-screen flex-col justify-between py-8 md:flex">
        {/* 메인 네비게이션 아이템들 - 중앙에 위치 */}
        <div className="flex flex-1 items-center">
          <nav className="flex flex-col gap-[7px]">
            {navItems.map(item => {
              const Icon = isActive(item.href) ? item.activeIcon : item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
                    active ? '' : 'hover:bg-[rgba(34,34,34,0.08)]'
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 text-[#222222] ${active ? 'opacity-80' : 'opacity-30 hover:opacity-50'}`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 설정 아이템 - 하단에 위치 */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button
            ref={settingsButtonRef}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all hover:bg-[rgba(34,34,34,0.08)]"
          >
            <SettingsIcon className="h-8 w-8 text-[#222222] opacity-20 hover:opacity-40" />
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <SettingsDropdown
              ref={dropdownRef}
              spaceSlug={spaceSlug}
              onLogout={handleLogout}
              className="absolute bottom-full left-0 mb-2"
            />
          )}
        </div>
      </div>

      {/* 모바일 바텀 네비게이션 - 768px 미만에서만 표시 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white md:hidden">
        <nav className="flex items-center justify-around px-4 py-2">
          {navItems.map(item => {
            const Icon = isActive(item.href) ? item.activeIcon : item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-0 flex-col items-center justify-center px-1 py-2"
              >
                <Icon
                  className={`mb-1 h-6 w-6 text-[#222222] ${active ? 'opacity-80' : 'opacity-30'}`}
                />
                <span className={`text-xs text-[#222222] ${active ? 'opacity-80' : 'opacity-30'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 모바일 상단 헤더 네비게이션 - 768px 미만에서만 표시 */}
      <div className="fixed left-0 right-0 top-0 z-20 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-end p-4">
          <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-[rgba(34,34,34,0.08)]">
              <SettingsIcon className="h-6 w-6 text-[#222222] opacity-30" />
            </button>

            {/* 모바일 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <SettingsDropdown
                ref={dropdownRef}
                spaceSlug={spaceSlug}
                onLogout={handleLogout}
                className="absolute right-0 top-full mt-2"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarNav;
