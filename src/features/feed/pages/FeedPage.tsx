'use client';

import { CheckOutWriteModal } from '@/features/checkout/components';
import {
  FeedHeader,
  FeedListSkeleton,
  FilterDropdown,
  FloatingCheckoutButton,
  GoToFocusedPostButton,
  PostCard,
  PostDetail,
  TeamSummaryCard,
} from '@/features/feed/components';
import {
  useFeedActions,
  useFeedData,
  useFeedModal,
  useFeedNavigation,
  useFeedScroll,
  useVisiblePosts,
} from '@/features/feed/hooks';
import type { Post as FeedPost } from '@/features/feed/types/feed.types';
import { SettingsDropdown } from '@/shared/components/layout/SettingsDropdown';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAuth as useAuthHook } from '@/shared/hooks/auth/useAuth';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useDateStore } from '@/shared/stores/useDateStore';
import { formatDateToAPIString } from '@/shared/utils';
import { debug as logDebug } from '@/shared/utils/debug';
import { RiSettings6Line } from '@remixicon/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface FeedPageProps {
  spaceSlug: string;
}

export function FeedPage({ spaceSlug }: FeedPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { logout } = useAuthHook();
  const { selectedDate, setSelectedDate, initializeFromUrl } = useDateStore();

  // 설정 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // URL 파라미터에서 날짜 초기화 (URL → localStorage → 오늘 순서)
  useEffect(() => {
    const dateParam = searchParams.get('date');
    initializeFromUrl(dateParam);

    // 미래 날짜로 접근한 경우 오늘 날짜로 리다이렉트
    if (dateParam) {
      try {
        const date = new Date(dateParam);
        if (!isNaN(date.getTime())) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);

          if (targetDate > today) {
            const todayString = formatDateToAPIString(new Date());
            const newUrl = `/${spaceSlug}/feed?date=${todayString}`;
            router.replace(newUrl);
          }
        }
      } catch {
        // 유효하지 않은 날짜면 무시
      }
    }
  }, [searchParams, initializeFromUrl, spaceSlug, router]);

  // 날짜 변경 함수 (URL과 store 모두 업데이트)
  const handleDateChange = (date: Date) => {
    // 미래 날짜인지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // 미래 날짜인 경우 오늘 날짜로 리다이렉트
    if (targetDate > today) {
      const todayString = formatDateToAPIString(new Date());
      const newUrl = `/${spaceSlug}/feed?date=${todayString}`;
      router.replace(newUrl);
      setSelectedDate(new Date());
      return;
    }

    setSelectedDate(date);
    const dateString = formatDateToAPIString(date);
    const newUrl = `/${spaceSlug}/feed?date=${dateString}`;
    router.replace(newUrl);
  };

  // 가시성 추적
  const { visiblePostIds, observePost, unobservePost, unobserveAll } = useVisiblePosts();

  // WebSocket 연결 관리
  useWebSocket({
    spaceSlug,
    visiblePostIds, // 현재 보이는 포스트 ID들 전달
  });

  // 데이터 및 상태 관리
  const {
    posts,
    teamSummary,
    filterType,
    setFilterType,
    existsCheckinQuery,
    isLoading,
  } = useFeedData(spaceSlug);
  const { handleCommentClick, handleViewSummaryClick } = useFeedActions(
    spaceSlug,
    posts as FeedPost[],
    () => {}
  );
  const { isCheckOutModalOpen, openCheckOutModal, closeCheckOutModal } = useFeedModal();
  const { handlePostClick, handleClosePostDetail: navigateClosePostDetail } = useFeedNavigation(spaceSlug);
  const { scrollContainerRef, showScrollToTop, scrollToTop, scrollToSelectedPost } = useFeedScroll(
    posts.length
  );

  // PostDetail 즉시 닫기 처리
  const handleClosePostDetail = () => {
    // 즉시 PostDetail을 숨김
    setIsPostDetailVisible(false);
    // 백그라운드에서 URL 업데이트
    setTimeout(() => {
      navigateClosePostDetail();
    }, 0);
  };

  // 설정 드롭다운 핸들러
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  useEffect(() => {
    if (
      !existsCheckinQuery.isLoading &&
      existsCheckinQuery.data &&
      existsCheckinQuery.data.exists === false
    ) {
      router.replace(ROUTES.SPACE_CHECKIN(spaceSlug));
    }
  }, [existsCheckinQuery.isLoading, existsCheckinQuery.data, router, spaceSlug]);

  // 컴포넌트 언마운트 시 타이머 정리 및 관찰 중지
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      unobserveAll();
    };
  }, [unobserveAll]);

  // URL 파라미터 처리
  const selectedPostId = searchParams.get('post');
  const selectedPost = selectedPostId ? posts.find(post => post.id === selectedPostId) : null;

  // selectedPostId가 변경될 때 isPostDetailVisible 업데이트
  useEffect(() => {
    setIsPostDetailVisible(!!selectedPostId);
  }, [selectedPostId]);
  const existsMyCheckin = existsCheckinQuery.data?.exists;
  const existsMyCheckout = (posts as FeedPost[]).some(
    post => post.type === 'checkout' && post.author.id === user?.id
  );
  const isCheckoutAvailable = existsMyCheckin && !existsMyCheckout;

  // 설정 아이콘 상태
  const SettingsIcon = RiSettings6Line;

  return (
    <>
      <div className="flex h-screen justify-center overflow-hidden">
        {/* 통합 컨테이너 - 중앙 피드와 PostDetail을 하나로 묶어서 중앙 정렬 */}
        <div
          className={`flex w-full transition-all duration-300 ${
            selectedPost && isPostDetailVisible ? 'pt-2 lg:w-[1196px] lg:pt-6' : 'pt-4 md:w-[672px] md:pt-6'
          }`}
        >
          {/* 중앙 피드 영역 - 모바일에서는 PostDetail 선택시 숨김 */}
          <div
            className={`relative flex w-full flex-col px-2 transition-all duration-300 md:px-4 ${
              selectedPost && isPostDetailVisible ? 'hidden lg:flex lg:w-[496px] lg:pl-4 lg:pr-0' : 'md:w-[672px]'
            }`}
          >
            {/* 필터 드롭다운과 설정 아이콘 - 고정 */}
            <div className="mb-4 flex flex-shrink-0 items-center justify-between px-2 md:mb-[22px] md:justify-center md:px-0">
              {/* 모바일에서만 보이는 빈 공간 */}
              <div className="w-10 md:hidden"></div>

              <FilterDropdown value={filterType} onChange={setFilterType} />

              {/* 모바일 설정 아이콘 */}
              <div
                className="relative md:hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-[rgba(34,34,34,0.08)]">
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

            {/* 피드 컨테이너 */}
            <div className="flex flex-col overflow-hidden rounded-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-2xl">
              {/* 헤더 - 고정 */}
              <div className="flex-shrink-0">
                <FeedHeader
                  selectedDate={selectedDate}
                  activeUsers={teamSummary?.totalMembers || 0}
                  onDateChange={handleDateChange}
                />
              </div>

              {/* 포스트 목록 - 스크롤 영역 (스크롤바 숨김) */}
              <div
                ref={scrollContainerRef}
                className="scrollbar-hide overflow-y-auto pb-20 md:pb-0"
              >
                {isLoading ? (
                  <FeedListSkeleton count={6} />
                ) : (
                  <>
                    {posts.map(post => (
                      <div
                        key={post.id}
                        data-post-id={post.id}
                        ref={el => {
                          if (el) {
                            logDebug('FeedPage', 'Observing post', post.id);
                            observePost(post.id, el);
                          } else {
                            logDebug('FeedPage', 'Unobserving post', post.id);
                            unobservePost(post.id);
                          }
                        }}
                        onClick={() => handlePostClick(post.id)}
                        className="cursor-pointer"
                      >
                        <PostCard
                          spaceSlug={spaceSlug}
                          post={post as FeedPost}
                          onCommentClick={handleCommentClick}
                          isSelected={selectedPostId === post.id}
                        />
                      </div>
                    ))}

                    {/* 마지막 메시지 - 스크롤이 필요한 경우에만 표시 */}
                    {showScrollToTop && (
                      <div className="flex flex-col items-center justify-center gap-2 bg-white pb-6 pt-6 md:pb-[40px] md:pt-[30px]">
                        <button
                          onClick={scrollToTop}
                          className="text-xs font-bold text-[#222222] opacity-80 hover:opacity-100 md:text-[13px]"
                        >
                          맨 위로 가기
                        </button>
                        <p className="text-xs text-[#222222] opacity-30 md:text-[13px]">
                          마지막 스크럼노트까지 읽었어요.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* PostDetail 활성화 시 선택된 포스트로 이동하는 플로팅 버튼 */}
            {selectedPost && isPostDetailVisible && !isDeleteDialogOpen && (
              <GoToFocusedPostButton
                selectedPostId={selectedPostId || ''}
                onScrollToPost={() => scrollToSelectedPost(selectedPostId)}
              />
            )}
          </div>

          {/* PostDetail 영역 */}
          {selectedPost && isPostDetailVisible && (
            <>
              {/* 모바일 PostDetail - 전체 화면 */}
              <div className="flex w-full flex-col px-2 lg:hidden">
                <div className="h-[calc(100vh-16px)] overflow-hidden rounded-xl bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-2xl">
                  <PostDetail
                    spaceSlug={spaceSlug}
                    key={selectedPost.id}
                    post={selectedPost as FeedPost}
                    onClose={handleClosePostDetail}
                    onDeleteDialogChange={setIsDeleteDialogOpen}
                  />
                </div>
              </div>

              {/* 데스크톱 PostDetail */}
              <div className="hidden lg:flex">
                {/* Divider */}
                <div className="mx-5 w-[1px] bg-[#222222] opacity-10" />

                {/* PostDetail */}
                <div className="w-[640px]">
                  <div className="sticky top-6 h-[calc(100vh-48px)] overflow-hidden rounded-2xl bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
                    <PostDetail
                      spaceSlug={spaceSlug}
                      key={selectedPost.id}
                      post={selectedPost as FeedPost}
                      onClose={handleClosePostDetail}
                      onDeleteDialogChange={setIsDeleteDialogOpen}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 요약 카드 - 데스크톱에서만 표시 */}
        <div
          className={`fixed left-[calc(50%+320px+24px)] top-[90px] hidden transition-all duration-300 xl:block ${
            selectedPost && isPostDetailVisible ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {teamSummary && (
            <TeamSummaryCard summary={teamSummary} onViewSummaryClick={handleViewSummaryClick} />
          )}
        </div>
      </div>

      {/* 플로팅 체크아웃 버튼 - 모바일에서 위치 조정 */}
      {!(selectedPost && isPostDetailVisible) && isCheckoutAvailable && (
        <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-10 flex justify-center px-4 md:bottom-8 md:px-8">
          <div className="w-full max-w-[1200px]">
            <div className="flex justify-end">
              <div className="pointer-events-auto">
                <FloatingCheckoutButton onClick={openCheckOutModal} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 체크아웃 작성 모달 */}
      <CheckOutWriteModal
        spaceSlug={spaceSlug}
        isOpen={isCheckOutModalOpen}
        onClose={closeCheckOutModal}
      />
    </>
  );
}
