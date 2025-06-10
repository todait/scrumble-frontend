'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/shared/components/auth';

interface SpacePageProps {
  params: Promise<{ spaceId: string }>;
}

function SpacePage({ params }: SpacePageProps) {
  const { spaceId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${spaceId}/feed`);
  }, [spaceId, router]);

  return null;
}

export default withAuth(SpacePage);
