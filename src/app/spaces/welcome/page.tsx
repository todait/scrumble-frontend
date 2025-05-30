'use client';

import { Suspense } from 'react';

import WelcomeSpacePage from '@/features/space/pages/WelcomeSpacePage';
import { LoadingScreen } from '@/shared/components/feedback';

export default function WelcomeSpacePageRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <WelcomeSpacePage />
    </Suspense>
  );
}