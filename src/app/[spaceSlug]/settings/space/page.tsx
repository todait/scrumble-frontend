'use client';

import { withAuth } from '@/shared/components/auth';
import { dynamicWithGlobalLoading } from '@/shared/utils/dynamicWithGlobalLoading';

const SpaceSettingsPage = dynamicWithGlobalLoading(
  () => import('@/features/settings/pages/SpaceSettingsPage'),
  {
    ssr: false,
    loadingMessage: '공간 설정 로딩 중...',
  }
);

function Page() {
  return <SpaceSettingsPage />;
}

export default withAuth(Page);
