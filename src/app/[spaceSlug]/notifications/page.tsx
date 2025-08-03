'use client';

import { NotificationPage } from '@/features/notifications/pages';
import { withAuth } from '@/shared/components/auth';
import { use } from 'react';

interface AppNotificationPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function AppNotificationPage({ params }: AppNotificationPageProps) {
  const { spaceSlug } = use(params);

  return <NotificationPage spaceSlug={spaceSlug} />;
}

export default withAuth(AppNotificationPage);
