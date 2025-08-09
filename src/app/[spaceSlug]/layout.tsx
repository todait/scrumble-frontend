'use client';

import { SidebarNav } from '@/shared/components/layout/SidebarNav';
import React, { use } from 'react';

interface SpaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}

export default function SpaceLayout({ children, params }: SpaceLayoutProps) {
  const { spaceSlug } = use(params);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SidebarNav spaceSlug={spaceSlug} />
      {/* SidebarNav는 fixed이므로 main은 전체 너비 사용 가능 */}
      <main className="min-h-screen pb-[60px] lg:px-[70px] lg:pb-0">{children}</main>
    </div>
  );
}
