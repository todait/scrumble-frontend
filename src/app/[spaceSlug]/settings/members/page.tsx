'use client';

import MemberSettingsPage from '@/features/settings/pages/MemberSettingsPage';
import { withAuth } from '@/shared/components/auth';

function Page() {
  return <MemberSettingsPage />;
}

export default withAuth(Page);
