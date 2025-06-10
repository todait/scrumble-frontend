'use client';

import {
  RiBarChartFill,
  RiBarChartLine,
  RiHeart3Fill,
  RiHeart3Line,
  RiHome5Fill,
  RiHome5Line,
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
    <div className="fixed left-2.5 top-0 z-10 flex h-screen flex-col justify-between py-8">
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
                  active ? 'bg-[#9747FF]' : 'hover:bg-[rgba(151,71,255,0.08)]'
                }`}
              >
                <Icon className={`h-8 w-8 ${active ? 'text-white' : 'text-[#222222] opacity-30 hover:opacity-60'}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 설정 아이템 - 하단에 위치 */}
      <Link
        href={settingsItem.href}
        className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
          isActive(settingsItem.href)
            ? 'bg-[#9747FF]'
            : 'hover:bg-[rgba(151,71,255,0.08)]'
        }`}
      >
        <SettingsIcon className={`h-8 w-8 ${isActive(settingsItem.href) ? 'text-white' : 'text-[#222222] opacity-20 hover:opacity-40'}`} />
      </Link>
    </div>
  );
}
