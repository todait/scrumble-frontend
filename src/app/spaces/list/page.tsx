'use client';

import { Suspense } from 'react';

import SpaceListPage from '@/features/space/pages/SpaceListPage';
import { PageLoadingSpinner } from '@/shared/components/ui';
import { withAuth } from '@/shared/components/auth';

function SpaceListPageRoute() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <SpaceListPage />
    </Suspense>
  );
}

export default withAuth(SpaceListPageRoute);