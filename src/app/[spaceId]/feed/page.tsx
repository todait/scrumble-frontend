'use client';

import { use } from 'react';
import { withAuth } from '@/shared/components/auth';
import { FeedPage } from '@/features/feed/pages';

interface AppFeedPageProps {
  params: Promise<{ spaceId: string }>;
}

function AppFeedPage({ params }: AppFeedPageProps) {
  const { spaceId } = use(params);

  return <FeedPage spaceId={spaceId} />;
}

export default withAuth(AppFeedPage);