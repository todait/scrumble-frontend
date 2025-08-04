'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useNotificationUnreadCount } from '@/shared/hooks/queries/useNotifications';
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
import { usePathname, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const isPostDetailOpen = !!searchParams.get('post');
  const { currentSpaceMember } = useAuth();

  // 읽지 않은 알림 개수 가져오기
  const { data: unreadCountData } = useNotificationUnreadCount({
    enabled: !!spaceSlug && !!currentSpaceMember?.id,
  });

  const totalUnreadCount = unreadCountData?.totalUnreadCount || 0;

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
      href: `/${spaceSlug}/notifications`,
      label: '알림',
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
      {/* 데스크톱 사이드바 - 1024px 이상에서만 표시 */}
      <div className="fixed left-2.5 top-0 z-10 hidden h-screen flex-col justify-between py-8 lg:flex">
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
                  className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-lg transition-all ${
                    active ? '' : 'hover:bg-[rgba(34,34,34,0.08)]'
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 text-[#222222] ${active ? 'opacity-80' : 'opacity-30 hover:opacity-50'}`}
                  />

                  {/* 읽지 않은 알림 표시 점 - 알림 메뉴에만 표시 */}
                  {item.href === `/${spaceSlug}/notifications` && totalUnreadCount > 0 && (
                    <div className="absolute right-3 top-3 h-[6px] w-[6px] rounded-full bg-[#9747FF]" />
                  )}
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
            className={`h-8 w-8 text-[#222222] ${
              isActive(settingsItem.href) ? 'opacity-80' : 'opacity-30 hover:opacity-50'
            }`}
          />
        </Link>
      </div>

      {/* 모바일 바텀 네비게이션 - PostDetail 열렸을 때는 숨김, 1024px 이상에서도 숨김 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white ${
          isPostDetailOpen ? 'hidden' : 'lg:hidden'
        }`}
      >
        <nav className="flex items-center justify-around px-4 py-2">
          {navItems.map(item => {
            const Icon = isActive(item.href) ? item.activeIcon : item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-w-0 flex-col items-center justify-center px-1 py-2"
              >
                <Icon
                  className={`mb-1 h-6 w-6 text-[#222222] ${active ? 'opacity-80' : 'opacity-30'}`}
                />
                <span className={`text-xs text-[#222222] ${active ? 'opacity-80' : 'opacity-30'}`}>
                  {item.label}
                </span>
                {/* 읽지 않은 알림 표시 점 - 알림 메뉴에만 표시 */}
                {item.href === `/${spaceSlug}/notifications` && totalUnreadCount > 0 && (
                  <div className="absolute right-2 top-1 h-[6px] w-[6px] rounded-full bg-[#9747FF]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default SidebarNav;
