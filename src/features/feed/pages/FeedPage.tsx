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
} from '@/features/feed/hooks';
import type { Post as FeedPost } from '@/features/feed/types/feed.types';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface FeedPageProps {
  spaceSlug: string;
}

export function FeedPage({ spaceSlug }: FeedPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  // 데이터 및 상태 관리
  const {
    posts,
    teamSummary,
    filterType,
    setFilterType,
    selectedDate,
    existsCheckinQuery,
    isLoading,
  } = useFeedData(spaceSlug);
  const { handleReaction, handleCommentClick, handleViewSummaryClick, handleDateClick } =
    useFeedActions(spaceSlug, posts as FeedPost[], () => {});
  const { isCheckOutModalOpen, openCheckOutModal, closeCheckOutModal } = useFeedModal();
  const { handlePostClick, handleClosePostDetail } = useFeedNavigation(spaceSlug);
  const { scrollContainerRef, showScrollToTop, scrollToTop, scrollToSelectedPost } = useFeedScroll(
    posts.length
  );

  useEffect(() => {
    if (
      !existsCheckinQuery.isLoading &&
      existsCheckinQuery.data &&
      existsCheckinQuery.data.exists === false
    ) {
      router.replace(ROUTES.SPACE_CHECKIN(spaceSlug));
    }
  }, [existsCheckinQuery.isLoading, existsCheckinQuery.data, router, spaceSlug]);

  // URL 파라미터 처리
  const searchParams = useSearchParams();
  const selectedPostId = searchParams.get('post');
  const selectedPost = selectedPostId ? posts.find(post => post.id === selectedPostId) : null;
  const existsMyCheckin = existsCheckinQuery.data?.exists;
  const existsMyCheckout = (posts as FeedPost[]).some(
    post => post.type === 'checkout' && post.author.id === user?.id
  );
  const isCheckoutAvailable = existsMyCheckin && !existsMyCheckout;

  return (
    <>
      <div className="flex h-screen justify-center overflow-hidden">
        {/* 통합 컨테이너 - 중앙 피드와 PostDetail을 하나로 묶어서 중앙 정렬 */}
        <div
          className={`flex pt-6 transition-all duration-300 ${
            selectedPost ? 'w-[1196px]' : 'w-[672px]'
          }`}
        >
          {/* 중앙 피드 영역 */}
          <div
            className={`relative flex flex-col transition-all duration-300 ${
              selectedPost ? 'w-[496px] pl-4 pr-0' : 'w-[672px] px-4'
            }`}
          >
            {/* 필터 드롭다운 - 고정 */}
            <div className="mb-[22px] flex flex-shrink-0 justify-center">
              <FilterDropdown value={filterType} onChange={setFilterType} />
            </div>

            {/* 피드 컨테이너 */}
            <div className="flex flex-col overflow-hidden rounded-2xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
              {/* 헤더 - 고정 */}
              <div className="flex-shrink-0">
                <FeedHeader
                  selectedDate={selectedDate}
                  activeUsers={22}
                  onDateClick={handleDateClick}
                />
              </div>

              {/* 포스트 목록 - 스크롤 영역 (스크롤바 숨김) */}
              <div ref={scrollContainerRef} className="scrollbar-hide overflow-y-auto">
                {isLoading ? (
                  <FeedListSkeleton count={6} />
                ) : (
                  <>
                    {posts.map(post => (
                      <div
                        key={post.id}
                        data-post-id={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="cursor-pointer"
                      >
                        <PostCard
                          spaceSlug={spaceSlug}
                          post={post as FeedPost}
                          onReaction={handleReaction}
                          onCommentClick={handleCommentClick}
                          isSelected={selectedPostId === post.id}
                        />
                      </div>
                    ))}

                    {/* 마지막 메시지 - 스크롤이 필요한 경우에만 표시 */}
                    {showScrollToTop && (
                      <div className="flex flex-col items-center justify-center gap-2 bg-white pb-[40px] pt-[30px]">
                        <button
                          onClick={scrollToTop}
                          className="text-[13px] font-bold text-[#222222] opacity-80 hover:opacity-100"
                        >
                          맨 위로 가기
                        </button>
                        <p className="text-[13px] text-[#222222] opacity-30">
                          마지막 스크럼노트까지 읽었어요.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* PostDetail 활성화 시 선택된 포스트로 이동하는 플로팅 버튼 */}
            {selectedPost && (
              <GoToFocusedPostButton
                selectedPostId={selectedPostId || ''}
                onScrollToPost={() => scrollToSelectedPost(selectedPostId)}
              />
            )}
          </div>

          {/* PostDetail 영역 - 고정 위치 */}
          {selectedPost && (
            <>
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
                    onReaction={handleReaction}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 요약 카드 - 고정 위치 */}
        <div
          className={`fixed left-[calc(50%+320px+24px)] top-[90px] hidden transition-all duration-300 lg:block ${
            selectedPost ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {teamSummary && (
            <TeamSummaryCard summary={teamSummary} onViewSummaryClick={handleViewSummaryClick} />
          )}
        </div>
      </div>

      {/* 플로팅 체크아웃 버튼 */}
      {!selectedPost && isCheckoutAvailable && (
        <FloatingCheckoutButton onClick={openCheckOutModal} />
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
