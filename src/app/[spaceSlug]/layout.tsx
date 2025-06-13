import { SidebarNav } from '@/shared/components/layout/SidebarNav';
import React from 'react';

interface SpaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}

export default async function SpaceLayout({ children, params }: SpaceLayoutProps) {
  const { spaceSlug } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SidebarNav spaceSlug={spaceSlug} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
