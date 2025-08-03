'use client';

import { FeedPage } from '@/features/feed/pages';
import { withAuth } from '@/shared/components/auth';
import { use } from 'react';
interface AppFeedPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function AppFeedPage({ params }: AppFeedPageProps) {
  const { spaceSlug } = use(params);

  return <FeedPage spaceSlug={spaceSlug} />;
}

export default withAuth(AppFeedPage);
