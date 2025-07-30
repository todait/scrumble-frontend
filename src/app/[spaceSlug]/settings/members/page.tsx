'use client';

import { withAuth } from '@/shared/components/auth';
import { dynamicWithGlobalLoading } from '@/shared/utils/dynamicWithGlobalLoading';

const MemberSettingsPage = dynamicWithGlobalLoading(
  () => import('@/features/settings/pages/MemberSettingsPage'),
  {
    ssr: false,
    loadingMessage: '멤버 설정 로딩 중...',
  }
);

function Page() {
  return <MemberSettingsPage />;
}

export default withAuth(Page);
