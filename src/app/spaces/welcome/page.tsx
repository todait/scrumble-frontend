'use client';

import { Suspense } from 'react';

import WelcomeSpacePage from '@/features/space/pages/WelcomeSpacePage';
import { LoadingScreen } from '@/shared/components/feedback';
import { withAuth } from '@/shared/components/auth';

function WelcomeSpacePageRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WelcomeSpacePage />
    </Suspense>
  );
}

export default withAuth(WelcomeSpacePageRoute);