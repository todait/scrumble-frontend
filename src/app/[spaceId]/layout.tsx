import React from 'react';

import { SpaceHeader } from '@/shared/components/layout';

interface SpaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ spaceId: string }>;
}

export default async function SpaceLayout({ children, params }: SpaceLayoutProps) {
  const { spaceId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <SpaceHeader spaceId={spaceId} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
