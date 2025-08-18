'use client';

import { CheckOutWriteModal } from '@/features/checkout/components';
import {
  FeedHeader,
  FeedListSkeleton,
  FilterDropdown,
  FloatingCheckoutButton,
  GoToFocusedPostButton,
  PostCard,
  TeamSummaryCard,
} from '@/features/feed/components';
import { PostDetail } from '@/features/feed/components/PostDetail';
import {
  useFeedActions,
  useFeedData,
  useFeedModal,
  useFeedNavigation,
  useFeedScroll,
  useVisiblePosts,
} from '@/features/feed/hooks';
import type { Post as FeedPost } from '@/features/feed/types/feed.types';
import { WebSocketErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePostDate } from '@/shared/hooks/queries/usePosts';

import { useDateStore } from '@/shared/stores/useDateStore';
import { convertToKoreanOrder, formatDateToAPIString } from '@/shared/utils';
import { debug, debug as logDebug } from '@/shared/utils/debug';
import { RiPokerClubsFill } from '@remixicon/react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface FeedPageProps {
  spaceSlug: string;
}

export function FeedPage({ spaceSlug }: FeedPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    currentSpaceMember: member,
    isAuthenticated,
    isSpaceAuthenticated,
    switchSpace,
  } = useAuth();
  const { selectedDate, setSelectedDate, initializeFromUrl } = useDateStore();

  // 설정 드롭다운 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false); // 페이지 전환 감지 상태
  const hasAutoNavigatedRef = useRef<string | null>(null); // 자동 날짜 이동이 실행된 postId 추적

  // 인증 체크 - 유저 미인증은 /auth, 스페이스 미인증은 조용히 복구 시도
  useEffect(() => {
    if (!isAuthenticated) {
      debug('FeedPage', 'No user auth - redirecting to auth', {
        isAuthenticated,
        isSpaceAuthenticated,
      });
      router.replace(ROUTES.AUTH);
      return;
    }

    if (!isSpaceAuthenticated) {
      debug('FeedPage', 'Space auth missing - attempting silent space switch/login', { spaceSlug });
      switchSpace(spaceSlug).catch(() => {
        // 스페이스 세션 복구 실패 시 스페이스 목록으로 이동
        router.replace('/spaces/list');
      });
    }
  }, [isAuthenticated, isSpaceAuthenticated, router, spaceSlug, switchSpace]);

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

  // 경로 변경 감지 - feed 페이지를 벗어날 때 즉시 숨김 처리
  useEffect(() => {
    if (!pathname.includes(`/${spaceSlug}/feed`)) {
      setIsNavigatingAway(true);
    }
  }, [pathname, spaceSlug]);

  // 날짜 변경 함수 (URL과 store 모두 업데이트)
  const handleDateChange = (date: Date) => {
    setIsPostDetailVisible(false);
    // 스크롤을 맨 위로 초기화
    scrollContainerRef.current?.scrollTo(0, 0);

    // 자동 이동 기록 초기화 (사용자가 의도적으로 날짜를 변경했으므로)
    hasAutoNavigatedRef.current = null;

    // 미래 날짜인지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // 미래 날짜인 경우 오늘 날짜로 리다이렉트
    if (targetDate > today) {
      setSelectedDate(new Date());
      const todayString = formatDateToAPIString(new Date());
      const newUrl = `/${spaceSlug}/feed?date=${todayString}`;

      setTimeout(() => {
        router.replace(newUrl);
      }, 50);
      return;
    }

    setSelectedDate(date);
    const dateString = formatDateToAPIString(date);
    const newUrl = `/${spaceSlug}/feed?date=${dateString}`;
    debug('FeedPage', 'handleDateChange', newUrl);

    setTimeout(() => {
      router.replace(newUrl);
    }, 50);
  };

  // 가시성 추적
  const { visiblePostIds, observePost, unobservePost, unobserveAll } = useVisiblePosts();

  // 디버깅을 위한 로그
  useEffect(() => {
    logDebug('FeedPage', 'Visible post IDs changed', visiblePostIds);
  }, [visiblePostIds]);

  // 데이터 및 상태 관리 (WebSocket 연결 포함)
  const { posts, teamSummary, filterType, setFilterType, existsCheckinQuery, isLoading } =
    useFeedData(spaceSlug, {
      visiblePostIds, // 현재 화면에 보이는 포스트 ID들 전달
      onReconnectionDataSync: () => {
        logDebug('FeedPage', '재연결 감지 - 피드 데이터 동기화 완료');
      },
    });
  const { handleCommentClick } = useFeedActions(spaceSlug);
  const { isCheckOutModalOpen, openCheckOutModal, closeCheckOutModal } = useFeedModal();
  const { handlePostClick, handleClosePostDetail: navigateClosePostDetail } =
    useFeedNavigation(spaceSlug);
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

  useEffect(() => {
    // 오늘일 때만 체크인 강제 (과거 날짜는 체크인 없어도 피드 볼 수 있음)
    const isToday = formatDateToAPIString(selectedDate) === formatDateToAPIString(new Date());

    // space별로 "나중에 하기"를 선택했는지 확인 (30분 타임아웃 포함)
    const skipDataStr = sessionStorage.getItem(`checkin-skipped-${spaceSlug}`);
    let hasSkippedRecently = false;

    if (skipDataStr) {
      try {
        const skipData = JSON.parse(skipDataStr);
        const timePassed = Date.now() - skipData.timestamp;
        const thirtyMinutes = 30 * 60 * 1000; // 30분 = 1800000ms

        // 날짜가 같고 30분이 안 지났을 때만 유효
        if (skipData.date === formatDateToAPIString(selectedDate) && timePassed < thirtyMinutes) {
          hasSkippedRecently = true;
        } else {
          // 만료된 데이터 삭제
          sessionStorage.removeItem(`checkin-skipped-${spaceSlug}`);
        }
      } catch {
        // 파싱 실패 시 (이전 버전 데이터) 삭제
        sessionStorage.removeItem(`checkin-skipped-${spaceSlug}`);
      }
    }

    if (
      isToday &&
      !hasSkippedRecently && // 30분 내에 "나중에 하기"를 선택하지 않았을 때만
      !existsCheckinQuery.isLoading &&
      existsCheckinQuery.data &&
      existsCheckinQuery.data.exists === false
    ) {
      router.replace(ROUTES.SPACE_CHECKIN(spaceSlug));
    }
  }, [existsCheckinQuery.isLoading, existsCheckinQuery.data, router, spaceSlug, selectedDate]);

  // 컴포넌트 언마운트 시 타이머 정리 및 관찰 중지
  useEffect(() => {
    return () => {
      unobserveAll();
    };
  }, [unobserveAll]);

  // URL 파라미터 처리
  const selectedPostId = searchParams.get('post');
  const selectedCommentId = searchParams.get('comment');
  const selectedPost = selectedPostId ? posts.find(post => post.id === selectedPostId) : null;

  // 포스트 날짜 조회
  const { data: postDateData } = usePostDate({
    postId: selectedPostId || '',
    enabled: !!selectedPostId,
  });

  // 포스트 날짜가 조회되면 해당 날짜로 이동 (초기 로드시에만)
  useEffect(() => {
    if (postDateData?.date && selectedPostId) {
      // 이미 이 포스트에 대해 자동 이동을 실행했으면 스킵
      if (hasAutoNavigatedRef.current === selectedPostId) {
        return;
      }

      const postDate = postDateData.date;
      const currentDate = formatDateToAPIString(selectedDate);

      // 포스트의 날짜가 현재 선택된 날짜와 다르면 해당 날짜로 이동
      if (postDate !== currentDate) {
        const newDate = new Date(postDate);
        setSelectedDate(newDate);
        // post 파라미터를 유지하면서 날짜 변경
        const newUrl = `/${spaceSlug}/feed?date=${postDate}&post=${selectedPostId}`;
        router.replace(newUrl);

        // 이 포스트에 대해 자동 이동을 실행했음을 기록
        hasAutoNavigatedRef.current = selectedPostId;
      }
    }
  }, [postDateData, selectedPostId, selectedDate, spaceSlug, router, setSelectedDate]);

  // selectedPostId가 변경되거나 없어지면 자동 이동 기록 초기화
  useEffect(() => {
    if (!selectedPostId) {
      hasAutoNavigatedRef.current = null;
    }
  }, [selectedPostId]);

  // selectedPostId가 변경될 때 isPostDetailVisible 업데이트
  useEffect(() => {
    setIsPostDetailVisible(!!selectedPostId);
  }, [selectedPostId]);
  const existsMyCheckin = existsCheckinQuery.data?.exists;
  const existsMyCheckout = (posts as FeedPost[]).some(
    post => post.type === 'checkout' && post.author.id === member?.id
  );
  const isCheckoutAvailable = existsMyCheckin && !existsMyCheckout;

  // 페이지 전환 중이면 빈 화면 표시
  if (isNavigatingAway) {
    return null;
  }

  return (
    <WebSocketErrorBoundary>
      <div className="flex h-screen justify-center overflow-hidden">
        {/* 통합 컨테이너 - 중앙 피드와 PostDetail을 하나로 묶어서 중앙 정렬 */}
        <div
          className={`flex w-full transition-all duration-300 ${
            selectedPost && isPostDetailVisible
              ? 'pt-2 lg:w-[1196px] lg:pt-6'
              : 'pt-4 md:w-[672px] md:pt-6'
          }`}
        >
          {/* 중앙 피드 영역 - 모바일에서는 PostDetail 선택시 숨김 */}
          <div
            className={`relative flex min-h-0 w-full flex-col px-2 transition-all duration-300 ease-in-out md:px-4 ${
              selectedPost && isPostDetailVisible
                ? 'hidden lg:flex lg:w-[496px] lg:pl-4 lg:pr-0'
                : 'md:w-[672px]'
            }`}
          >
            {/* 필터 드롭다운과 설정 아이콘 - 고정 */}
            <div className="mb-4 flex flex-shrink-0 items-center justify-center px-2 md:mb-[22px] md:px-0">
              <FilterDropdown value={filterType} onChange={setFilterType} />
            </div>

            {/* 피드 컨테이너 */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* 헤더 - 포스트가 없을 때 */}
              {(isLoading || posts.length === 0) && (
                <div className="relative flex-shrink-0">
                  <FeedHeader selectedDate={selectedDate} onDateChange={handleDateChange} />
                </div>
              )}

              {/* 헤더 - 포스트가 있을 때 */}
              {!isLoading && posts.length > 0 && (
                <div className="rounded-t-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-t-2xl">
                  <div className="relative flex-shrink-0">
                    <FeedHeader selectedDate={selectedDate} onDateChange={handleDateChange} />
                  </div>
                </div>
              )}

              {/* 체크인 유도 버튼 - 체크인이 없을 때만 표시 */}
              {!existsMyCheckin && !existsCheckinQuery.isLoading && (
                <div className="border-b border-[rgba(29,29,31,0.08)] bg-white px-5 py-5 md:px-[30px] md:py-[20px]">
                  <button
                    onClick={() => router.push(`/${spaceSlug}/posts/checkins/new`)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(151,71,255,0.5)] bg-white transition-all hover:bg-[rgba(151,71,255,0.05)]"
                  >
                    <RiPokerClubsFill className="h-5 w-5 text-[#9747FF]" />
                    <span className="text-center text-[15px] font-medium leading-[120%] text-[#1D1D1F]">
                      {teamSummary?.nextCheckinOrder && teamSummary.nextCheckinOrder > 0 ? (
                        <>
                          오늘{' '}
                          <span className="text-[#9747FF]">
                            {convertToKoreanOrder(teamSummary.nextCheckinOrder)}번째로
                          </span>{' '}
                          체크인을 남겨보세요
                        </>
                      ) : (
                        '오늘 체크인을 남겨보세요'
                      )}
                    </span>
                  </button>
                </div>
              )}

              {/* 포스트 목록 - 스크롤 영역 (스크롤바 숨김) */}
              <div
                ref={scrollContainerRef}
                className={`scrollbar-hide flex-1 overflow-y-auto pb-20 md:pb-0 ${
                  !isLoading && posts.length > 0
                    ? 'shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]'
                    : 'bg-white'
                }`}
              >
                {isLoading ? (
                  <FeedListSkeleton count={6} />
                ) : posts.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center bg-white px-5 pt-40">
                    <Image
                      src="/made-with-blunge 2.svg"
                      alt="Empty feed illustration"
                      width={200}
                      height={201}
                      priority
                    />
                    <p className="mt-10 text-center text-[15px] font-normal leading-[150%] text-[#181818] opacity-50">
                      체크인하고 피드에서 팀 소식을 확인하세요!
                    </p>
                  </div>
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
                    highlightedCommentId={selectedCommentId}
                  />
                </div>
              </div>

              {/* 데스크톱 PostDetail */}
              <div className="hidden lg:flex">
                {/* Divider */}
                <div className="mx-5 w-[1px] opacity-10" />

                {/* PostDetail */}
                <div className="w-[640px]">
                  <div className="sticky top-6 h-[calc(100vh-48px)] overflow-hidden rounded-2xl bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
                    <PostDetail
                      spaceSlug={spaceSlug}
                      key={selectedPost.id}
                      post={selectedPost as FeedPost}
                      onClose={handleClosePostDetail}
                      onDeleteDialogChange={setIsDeleteDialogOpen}
                      highlightedCommentId={selectedCommentId}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 요약 카드 - 데스크톱에서만 표시 */}
        <div
          className={`fixed left-[calc(50%+320px+24px)] top-[78px] hidden transition-all duration-300 xl:block ${
            selectedPost && isPostDetailVisible ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {teamSummary && <TeamSummaryCard summary={teamSummary} />}
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
      <CheckOutWriteModal isOpen={isCheckOutModalOpen} onClose={closeCheckOutModal} />
    </WebSocketErrorBoundary>
  );
}
