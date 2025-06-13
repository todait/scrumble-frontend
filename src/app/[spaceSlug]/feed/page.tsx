'use client';

import { use } from 'react';
import { withAuth } from '@/shared/components/auth';
import { FeedPage } from '@/features/feed/pages';

interface AppFeedPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function AppFeedPage({ params }: AppFeedPageProps) {
  const { spaceSlug } = use(params);

  return <FeedPage spaceSlug={spaceSlug} />;
}

export default withAuth(AppFeedPage);
