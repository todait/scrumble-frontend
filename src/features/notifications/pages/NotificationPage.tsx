'use client';

import { SettingsDropdown } from '@/shared/components/layout/SettingsDropdown';
import { useAuth as useAuthHook } from '@/shared/hooks/auth/useAuth';
import { RiSettings6Line } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { NotificationHeader, NotificationItemList } from '../components';
import { useNotificationPage } from '../hooks/useNotificationPage';

interface NotificationPageProps {
  spaceSlug: string;
}

export function NotificationPage({ spaceSlug }: NotificationPageProps) {
  const { logout } = useAuthHook();

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

  // 설정 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 설정 드롭다운 마우스 이벤트 핸들러
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 설정 아이콘 컴포넌트
  const SettingsIcon = RiSettings6Line;

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
          {/* 필터와 설정 아이콘 - 고정 */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between px-2 md:mb-[22px] md:justify-center md:px-0">
            {/* 모바일에서만 보이는 빈 공간 */}
            <div className="w-10 md:hidden"></div>

            {/* 알림 제목 - 데스크톱에서는 중앙 정렬 */}
            <div className="flex items-center">
              <h1 className="text-[18px] font-bold text-[#222222]">알림</h1>
            </div>

            {/* 모바일 설정 아이콘 */}
            <div
              className="relative md:hidden"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-[rgba(34,34,34,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2"
                aria-label="설정 메뉴 열기"
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
              >
                <SettingsIcon className="h-6 w-6 text-[#222222] opacity-30" />
              </button>

              {/* 모바일 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <SettingsDropdown
                  ref={dropdownRef}
                  spaceSlug={spaceSlug}
                  onLogout={handleLogout}
                  className="absolute right-0 top-full mt-2"
                />
              )}
            </div>
          </div>

          {/* 알림 컨테이너 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 헤더 - 공통 */}
            <div
              className={`relative flex-shrink-0 ${
                !isLoading && notifications.length > 0
                  ? 'rounded-t-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-t-2xl'
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
              />
            </div>

            {/* 알림 목록 - 스크롤 영역 (스크롤바 숨김) */}
            <div
              className={`scrollbar-hide overflow-y-auto pb-20 md:pb-0 ${
                !isLoading && notifications.length > 0
                  ? 'rounded-b-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-b-2xl'
                  : ''
              }`}
            >
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
