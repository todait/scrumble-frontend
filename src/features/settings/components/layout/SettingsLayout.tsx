'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import {
  RiCake3Line,
  RiFeedbackLine,
  RiGroup3Line,
  RiLogoutBoxLine,
  RiNotification3Line,
  RiPlanetLine,
  RiShapesLine,
  RiUser6Line,
} from '@remixicon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  spaceSlug: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, spaceSlug }) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  // 현재 선택된 메뉴 찾기
  const getSelectedMenuLabel = () => {
    const allMenuItems = [...spaceMenuItems, ...myMenuItems];
    const activeItem = allMenuItems.find(item => pathname === item.href);
    return activeItem?.label || '';
  };

  const spaceMenuItems: MenuItem[] = [
    {
      label: '스페이스 정보',
      href: `/${spaceSlug}/settings/space`,
      icon: <RiPlanetLine className="h-[18px] w-[18px]" />,
    },
    {
      label: '멤버 리스트',
      href: `/${spaceSlug}/settings/members`,
      icon: <RiGroup3Line className="h-[18px] w-[18px]" />,
    },
    {
      label: '연동',
      href: `/${spaceSlug}/settings/integrations`,
      icon: <RiShapesLine className="h-[18px] w-[18px]" />,
    },
  ];

  const myMenuItems: MenuItem[] = [
    {
      label: '내 정보',
      href: `/${spaceSlug}/settings/me`,
      icon: <RiUser6Line className="h-[18px] w-[18px]" />,
    },
    {
      label: '알림',
      href: `/${spaceSlug}/settings/notifications`,
      icon: <RiNotification3Line className="h-[18px] w-[18px]" />,
    },
    {
      label: '피드백',
      href: `/${spaceSlug}/settings/feedback`,
      icon: <RiFeedbackLine className="h-[18px] w-[18px]" />,
    },
    {
      label: '추천하기',
      href: `/${spaceSlug}/settings/recommend`,
      icon: <RiCake3Line className="h-[18px] w-[18px]" />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all ${
          active ? 'bg-[#9747FF]/10 text-[#9747FF]' : 'text-[#6E6E73] hover:bg-[#F2F2F7]'
        }`}
      >
        <span className={active ? 'text-[#9747FF]' : 'text-[#6E6E73]'}>{item.icon}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:py-[90px]">
      <div className="mx-auto max-w-[1200px]">
        {/* 모바일 헤더 */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h1 className="flex items-center gap-1 text-[18px] font-semibold">
            <span className="text-[#9999A2]">설정</span>
            <span className="text-[#9999A2] opacity-70">/</span>
            <span className="font-bold text-[#1D1D1F]">{getSelectedMenuLabel()}</span>
          </h1>
        </div>

        {/* 모바일 탭 네비게이션 */}
        <div className="mb-4 overflow-x-auto lg:hidden">
          <div className="flex gap-2">
            {[...spaceMenuItems, ...myMenuItems].map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-shrink-0 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-[#9747FF]/10 font-semibold text-[#9747FF]'
                      : 'text-[#6E6E73] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 데스크톱 - 하나의 카드 안에 모든 콘텐츠 */}
        <div className="scrollbar-hide overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* 헤더 - 카드 안에 위치 */}
          <div className="hidden border-b border-[#F2F2F7] px-[30px] py-5 lg:block">
            <h1 className="text-[16px] font-normal leading-[22px]">
              <span className="text-[#86868B]">설정</span>
              <span className="mx-1 text-[#86868B]">/</span>
              <span className="font-semibold text-[#1D1D1F]">{getSelectedMenuLabel()}</span>
            </h1>
          </div>

          {/* 메인 레이아웃 - 사이드바와 컨텐츠 */}
          <div className="scrollbar-hide flex min-h-[700px]">
            {/* 데스크톱 사이드바 */}
            <aside className="hidden w-[160px] flex-col border-r border-[#F2F2F7] px-[10px] py-[20px] lg:flex">
              <div className="flex-1">
                {/* 스페이스 설정 섹션 */}
                <div className="mb-8">
                  <p className="mb-3 text-[11px] font-normal text-[#86868B]">스페이스 설정</p>
                  <nav className="flex flex-col gap-1">{spaceMenuItems.map(renderMenuItem)}</nav>
                </div>

                {/* 내 설정 섹션 */}
                <div className="mb-8">
                  <p className="mb-3 text-[11px] font-normal text-[#86868B]">내 설정</p>
                  <nav className="flex flex-col gap-1">{myMenuItems.map(renderMenuItem)}</nav>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <div className="mt-auto">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#6E6E73] transition-all hover:bg-[#F2F2F7]"
                >
                  <RiLogoutBoxLine className="h-[18px] w-[18px] text-[#6E6E73]" />
                  로그아웃
                </button>
              </div>
            </aside>

            {/* 메인 컨텐츠 */}
            <main className="scrollbar-hide flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
