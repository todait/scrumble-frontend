'use client';

import { use } from 'react';
import { withAuth } from '@/shared/components/auth';
import { dynamicWithGlobalLoading } from '@/shared/utils/dynamicWithGlobalLoading';

const FeedPage = dynamicWithGlobalLoading(
  () => import('@/features/feed/pages').then(mod => mod.FeedPage), 
  {
    ssr: false,
    loadingMessage: '피드 로딩 중...',
  }
);

interface AppFeedPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function AppFeedPage({ params }: AppFeedPageProps) {
  const { spaceSlug } = use(params);

  return <FeedPage spaceSlug={spaceSlug} />;
}

export default withAuth(AppFeedPage);
