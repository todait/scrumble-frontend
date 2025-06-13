'use client';

import SpaceSettingsPage from '@/features/settings/pages/SpaceSettingsPage';
import { withAuth } from '@/shared/components/auth';

function Page() {
  return <SpaceSettingsPage />;
}

export default withAuth(Page);