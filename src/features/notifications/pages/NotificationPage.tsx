'use client';

import { useAuth as useAuthHook } from '@/shared/contexts/AuthContext';
import { useNotificationUnreadCount } from '@/shared/hooks/queries/useNotifications';
import { NotificationHeader, NotificationItemList } from '../components';
import { EmptyState } from '../components/ui';
import { useNotificationPage } from '../hooks/useNotificationPage';

interface NotificationPageProps {
  spaceSlug: string;
}

export function NotificationPage({ spaceSlug }: NotificationPageProps) {
  const { currentSpaceMember: member } = useAuthHook();

  // 알림 페이지 통합 훅 사용
  const {
    notifications,
    isLoading,
    isError,
    currentFilter,
    setCategoryFilter,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
    totalCount,
    unreadCount,
    loadMore,
    hasMore,
    isFetchingNextPage,
  } = useNotificationPage({ spaceSlug });

  // 카테고리별 읽지 않은 알림 개수 가져오기
  const { data: unreadCountData } = useNotificationUnreadCount({
    enabled: !!spaceSlug && !!member?.id,
  });

  return (
    <div className="flex h-screen justify-center overflow-hidden">
      {/* 중앙 정렬 컨테이너 */}
      <div className="flex w-full pt-4 transition-all duration-300 md:w-[900px] md:pt-6">
        {/* 알림 페이지 영역 */}
        <main
          className="relative flex min-h-0 w-full flex-col px-2 transition-all duration-300 md:px-4"
          role="main"
          aria-labelledby="notifications-title"
        >
          <div className="lg:mb-[90px]"></div>

          {/* 알림 컨테이너 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 헤더 - 공통 */}
            <div
              className={`relative flex-shrink-0 ${
                !isLoading && notifications.length > 0
                  ? 'rounded-t-2xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]'
                  : ''
              }`}
            >
              <NotificationHeader
                spaceSlug={spaceSlug}
                currentFilter={currentFilter}
                onCategoryChange={setCategoryFilter}
                onMarkAllAsRead={markAllAsRead}
                isMarkingAllAsRead={isMarkingAllAsRead}
                unreadCount={unreadCount}
                totalCount={totalCount}
                categoryUnreadCounts={unreadCountData?.categories}
              />
            </div>

            {/* 알림 목록 - 스크롤 영역 (스크롤바 숨김) */}
            <div
              className={`scrollbar-hide flex-1 overflow-y-auto pb-20 md:pb-0 ${
                !isLoading && notifications.length > 0
                  ? 'rounded-b-2xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]'
                  : 'bg-white'
              }`}
            >
              {!isLoading && notifications.length === 0 ? (
                <div className="flex min-h-full flex-col items-center bg-white px-5 pt-40">
                  <EmptyState category={currentFilter.category || 'all'} isFiltered={false} />
                </div>
              ) : (
                <NotificationItemList
                  spaceSlug={spaceSlug}
                  notifications={notifications}
                  isLoading={isLoading}
                  isError={isError}
                  onMarkAsRead={markAsRead}
                  isMarkingAsRead={isMarkingAsRead}
                  onLoadMore={loadMore}
                  hasMore={hasMore}
                  isFetchingNextPage={isFetchingNextPage}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
