'use client';

import { withAuth } from '@/shared/components/auth/withAuth';
import { dynamicWithGlobalLoading } from '@/shared/utils/dynamicWithGlobalLoading';

// Dynamic import 사용 - 초기 번들 크기 최적화
// 전역 로딩 상태와 연동하여 일관된 로딩 경험 제공
const NotificationPage = dynamicWithGlobalLoading(
  () => import('@/features/notifications/pages').then(mod => mod.NotificationPage),
  { 
    ssr: false,
    loadingMessage: '알림 로딩 중...',
  }
);

// 대안: 번들 크기가 문제가 되지 않는다면 일반 import 사용 가능
// import { NotificationPage } from '@/features/notifications/pages';

interface NotificationPageWrapperProps {
  spaceSlug: string;
}

function NotificationPageWrapperComponent({ spaceSlug }: NotificationPageWrapperProps) {
  return <NotificationPage spaceSlug={spaceSlug} />;
}

export const NotificationPageWrapper = withAuth(NotificationPageWrapperComponent);