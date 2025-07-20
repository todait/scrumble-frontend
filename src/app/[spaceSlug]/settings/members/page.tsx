'use client';

import { withAuth } from '@/shared/components/auth';
import { PageLoadingSpinner } from '@/shared/components/ui';
import dynamic from 'next/dynamic';

const MemberSettingsPage = dynamic(
  () => import('@/features/settings/pages/MemberSettingsPage'),
  { 
    ssr: false,
    loading: () => <PageLoadingSpinner />
  }
);

function Page() {
  return <MemberSettingsPage />;
}

export default withAuth(Page);