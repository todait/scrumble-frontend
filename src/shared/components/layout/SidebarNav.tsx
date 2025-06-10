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

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}

interface SidebarNavProps {
  spaceId: string;
}

export function SidebarNav({ spaceId }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      icon: RiHome5Line,
      activeIcon: RiHome5Fill,
      href: `/${spaceId}/feed`,
      label: '홈',
    },
    {
      icon: RiHeart3Line,
      activeIcon: RiHeart3Fill,
      href: `/${spaceId}/activity`,
      label: '활동',
    },
    {
      icon: RiPencilLine,
      activeIcon: RiPencilFill,
      href: `/${spaceId}/posts/checkins/new`,
      label: '체크인',
    },
    {
      icon: RiBarChartLine,
      activeIcon: RiBarChartFill,
      href: `/${spaceId}/reports`,
      label: '리포트',
    },
    {
      icon: RiUser6Line,
      activeIcon: RiUser6Fill,
      href: `/${spaceId}/my-page`,
      label: '마이페이지',
    },
  ];

  const settingsItem: NavItem = {
    icon: RiSettings6Line,
    activeIcon: RiSettings6Fill,
    href: `/${spaceId}/settings/space`,
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
        <Link
          href={settingsItem.href}
          className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
            isActive(settingsItem.href) ? '' : 'hover:bg-[rgba(34,34,34,0.08)]'
          }`}
        >
          <SettingsIcon
            className={`h-8 w-8 text-[#222222] ${isActive(settingsItem.href) ? 'opacity-80' : 'opacity-20 hover:opacity-40'}`}
          />
        </Link>
      </div>

      {/* 모바일 바텀 네비게이션 - 768px 미만에서만 표시 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 md:hidden">
        <nav className="flex justify-around items-center px-4 py-2">
          {navItems.map(item => {
            const Icon = isActive(item.href) ? item.activeIcon : item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-2 px-1 min-w-0"
              >
                <Icon
                  className={`h-6 w-6 text-[#222222] mb-1 ${active ? 'opacity-80' : 'opacity-30'}`}
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
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 md:hidden">
        <div className="flex justify-end items-center p-4">
          <Link
            href={settingsItem.href}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
              isActive(settingsItem.href) ? '' : 'hover:bg-[rgba(34,34,34,0.08)]'
            }`}
          >
            <SettingsIcon
              className={`h-6 w-6 text-[#222222] ${isActive(settingsItem.href) ? 'opacity-80' : 'opacity-30'}`}
            />
          </Link>
        </div>
      </div>
    </>
  );
}
