'use client';

import { NotificationPage } from '@/features/notifications/pages';
import { withAuth } from '@/shared/components/auth/withAuth';

interface NotificationPageWrapperProps {
  spaceSlug: string;
}

function NotificationPageWrapperComponent({ spaceSlug }: NotificationPageWrapperProps) {
  return <NotificationPage spaceSlug={spaceSlug} />;
}

export const NotificationPageWrapper = withAuth(NotificationPageWrapperComponent);