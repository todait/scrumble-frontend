'use client';

import { ProfileSettingsPage } from '@/features/settings/pages/ProfileSettingsPage';
import { withAuth } from '@/shared/components/auth';

export default withAuth(ProfileSettingsPage);