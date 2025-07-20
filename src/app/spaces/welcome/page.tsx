'use client';

import { Suspense } from 'react';

import WelcomeSpacePage from '@/features/space/pages/WelcomeSpacePage';
import { PageLoadingSpinner } from '@/shared/components/ui';
import { withAuth } from '@/shared/components/auth';

function WelcomeSpacePageRoute() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <WelcomeSpacePage />
    </Suspense>
  );
}

export default withAuth(WelcomeSpacePageRoute);