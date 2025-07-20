'use client';

import { use } from 'react';
import { withAuth } from '@/shared/components/auth';
import { PageLoadingSpinner } from '@/shared/components/ui';
import dynamic from 'next/dynamic';

const FeedPage = dynamic(() => import('@/features/feed/pages').then(mod => mod.FeedPage), {
  ssr: false,
  loading: () => <PageLoadingSpinner />,
});

interface AppFeedPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function AppFeedPage({ params }: AppFeedPageProps) {
  const { spaceSlug } = use(params);

  return <FeedPage spaceSlug={spaceSlug} />;
}

export default withAuth(AppFeedPage);
