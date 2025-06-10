import { SidebarNav } from '@/shared/components/layout/SidebarNav';
import React from 'react';

interface SpaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ spaceId: string }>;
}

export default async function SpaceLayout({ children, params }: SpaceLayoutProps) {
  const { spaceId } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <SidebarNav spaceId={spaceId} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
