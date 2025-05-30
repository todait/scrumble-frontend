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
      label: '설정',
      href: `/${spaceId}/settings/space`,
      icon: <Settings className="w-5 h-5" />
    },
    {
      label: '멤버 관리',
      href: `/${spaceId}/settings/members`,
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#FBFBFB]">
      {/* 사이드바 */}
      <aside className="w-[188px] pt-[108px] px-2 pb-2">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-1 px-5 py-4 rounded-xl text-[18px] font-normal transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-white to-[rgba(151,71,255,0.1)] text-[#9747FF] border-2 border-[rgba(151,71,255,0.4)]' 
                    : 'text-[#181818] hover:bg-gray-50'
                  }
                `}
              >
                <span className={isActive ? 'text-[#9747FF]' : 'text-[#181818]'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  );
}; 