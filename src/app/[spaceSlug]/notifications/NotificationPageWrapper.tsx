'use client';

import { withAuth } from '@/shared/components/auth/withAuth';
import { PageLoadingSpinner } from '@/shared/components/ui';
import dynamic from 'next/dynamic';

const NotificationPage = dynamic(
  () => import('@/features/notifications/pages').then(mod => mod.NotificationPage),
  { 
    ssr: false,
    loading: () => <PageLoadingSpinner />
  }
);

interface NotificationPageWrapperProps {
  spaceSlug: string;
}

function NotificationPageWrapperComponent({ spaceSlug }: NotificationPageWrapperProps) {
  return <NotificationPage spaceSlug={spaceSlug} />;
}

export const NotificationPageWrapper = withAuth(NotificationPageWrapperComponent);