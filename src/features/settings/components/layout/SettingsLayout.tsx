'use client';

import { Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  spaceId: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, spaceId }) => {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      label: '스페이스 설정',
      href: `/${spaceId}/settings/space`,
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: '멤버 관리',
      href: `/${spaceId}/settings/members`,
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex bg-[#FBFBFB]">
      {/* 사이드바 */}
      <aside className="min-h-[calc(100vh-70px)] w-[240px] border-r border-gray-200 bg-white px-6 py-8">
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-[#181818]">설정</h2>
          <p className="text-sm text-gray-500">스페이스와 멤버를 관리하세요</p>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map(item => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-blue-200 bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } `}
              >
                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="min-h-[calc(100vh-70px)] flex-1 overflow-auto bg-white">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
};
