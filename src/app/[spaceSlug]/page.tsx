'use client';

import { withAuth } from '@/shared/components/auth';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

interface SpacePageProps {
  params: Promise<{ spaceSlug: string }>;
}

function SpacePage({ params }: SpacePageProps) {
  const { spaceSlug } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${spaceSlug}/feed`);
  }, [spaceSlug, router]);

  return null;
}

export default withAuth(SpacePage);
