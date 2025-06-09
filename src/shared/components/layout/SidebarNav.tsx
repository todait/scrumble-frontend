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
      href: `/${spaceId}/stats`,
      label: '통계',
    },
    {
      icon: RiUser6Line,
      activeIcon: RiUser6Fill,
      href: `/${spaceId}/members`,
      label: '멤버',
    },
  ];

  const settingsItem: NavItem = {
    icon: RiSettings6Line,
    activeIcon: RiSettings6Fill,
    href: `/${spaceId}/settings`,
    label: '설정',
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed left-2.5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-[7px]">
      {/* 메인 네비게이션 아이템들 */}
      <div className="flex flex-col gap-[7px]">
        {navItems.map(item => {
          const Icon = isActive(item.href) ? item.activeIcon : item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
                active ? 'bg-white opacity-80' : 'opacity-30 hover:bg-white/10 hover:opacity-50'
              }`}
            >
              <Icon className="h-8 w-8 text-black" />
            </Link>
          );
        })}
      </div>

      {/* 설정 아이템 (하단에 별도로 배치) */}
      <Link
        href={settingsItem.href}
        className={`mt-8 flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
          isActive(settingsItem.href)
            ? 'bg-white opacity-80'
            : 'opacity-20 hover:bg-white/10 hover:opacity-30'
        }`}
      >
        {isActive(settingsItem.href) ? (
          <settingsItem.activeIcon className="h-8 w-8 text-black" />
        ) : (
          <settingsItem.icon className="h-8 w-8 text-black" />
        )}
      </Link>
    </nav>
  );
}
