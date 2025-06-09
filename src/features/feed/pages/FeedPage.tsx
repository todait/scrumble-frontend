'use client';

import {
  FeedHeader,
  FilterDropdown,
  FloatingCheckoutButton,
  PostCard,
  TeamSummaryCard,
} from '@/features/feed/components';
import { useFeedActions, useFeedData } from '@/features/feed/hooks';
import { useRef } from 'react';

interface FeedPageProps {
  spaceId: string;
}

export function FeedPage({ spaceId }: FeedPageProps) {
  const { filteredPosts, teamSummary, filterType, setFilterType, selectedDate } = useFeedData();
  const { handleOpenCheckOut, handleReaction, handleCommentClick, handleViewSummaryClick, handleDateClick } = useFeedActions(spaceId);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <>
      <div className="flex justify-center">
        {/* 중앙 피드 영역 */}
        <div className="w-full max-w-[640px] px-4 pt-6">
          {/* 필터 드롭다운 */}
          <div className="mb-[22px] flex justify-center">
            <FilterDropdown value={filterType} onChange={setFilterType} />
          </div>

          {/* 피드 컨테이너 */}
          <div className="overflow-hidden rounded-2xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
            {/* 헤더 */}
            <FeedHeader
              selectedDate={selectedDate}
              activeUsers={22}
              onDateClick={handleDateClick}
            />

            {/* 포스트 목록 */}
            <div>
              {filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReaction={handleReaction}
                  onCommentClick={handleCommentClick}
                />
              ))}

              {/* 마지막 메시지 */}
              <div className="flex flex-col items-center justify-center gap-2 bg-white pb-[80px] pt-[30px]">
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
            </div>
          </div>
        </div>

        {/* 오른쪽 요약 카드 - 고정 위치 */}
        <div className="fixed left-[calc(50%+320px+24px)] top-[90px] hidden lg:block">
          <TeamSummaryCard summary={teamSummary} onViewSummaryClick={handleViewSummaryClick} />
        </div>
      </div>

      {/* 플로팅 체크아웃 버튼 */}
      <FloatingCheckoutButton onClick={handleOpenCheckOut} />
    </>
  );
}