'use client';

import { withAuth } from '@/shared/components/auth';
import { PageLoadingSpinner } from '@/shared/components/ui';
import dynamic from 'next/dynamic';

const SpaceSettingsPage = dynamic(
  () => import('@/features/settings/pages/SpaceSettingsPage'),
  { 
    ssr: false,
    loading: () => <PageLoadingSpinner />
  }
);

function Page() {
  return <SpaceSettingsPage />;
}

export default withAuth(Page);