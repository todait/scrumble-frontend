'use client';

import { CheckOutWriteModal } from '@/features/checkout/components';
import {
  FeedHeader,
  FilterDropdown,
  FloatingCheckoutButton,
  PostCard,
  PostDetail,
  TeamSummaryCard,
} from '@/features/feed/components';
import { useFeedActions, useFeedData } from '@/features/feed/hooks';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FeedPageProps {
  spaceId: string;
}

export function FeedPage({ spaceId }: FeedPageProps) {
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const { filteredPosts, teamSummary, filterType, setFilterType, selectedDate } = useFeedData();
  const { handleReaction, handleCommentClick, handleViewSummaryClick, handleDateClick } =
    useFeedActions(spaceId);
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPostId = searchParams.get('post');
  const selectedPost = selectedPostId
    ? filteredPosts.find(post => post.id === selectedPostId)
    : null;

  // 개발 중 임시로 이선우를 현재 사용자로 설정
  useEffect(() => {
    login({
      id: '2',
      name: '이선우',
      email: 'lee@example.com',
      avatarURL: '',
    });
  }, [login]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCheckOutModal = () => {
    setIsCheckOutModalOpen(true);
  };

  const closeCheckOutModal = () => {
    setIsCheckOutModalOpen(false);
  };

  const handlePostClick = (postId: string) => {
    router.push(`/${spaceId}/feed?post=${postId}`);
  };

  const handleClosePostDetail = () => {
    router.push(`/${spaceId}/feed`);
  };

  return (
    <>
      <div className="flex justify-center">
        {/* 통합 컨테이너 - 중앙 피드와 PostDetail을 하나로 묶어서 중앙 정렬 */}
        <div className={`flex pt-6 transition-all duration-300 ${
          selectedPost ? 'w-[1196px]' : 'w-[672px]'
        }`}>
          {/* 중앙 피드 영역 */}
          <div className={`transition-all duration-300 ${
            selectedPost ? 'w-[496px] pl-4 pr-0' : 'w-[672px] px-4'
          }`}>
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
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className={`cursor-pointer ${
                      selectedPostId === post.id
                        ? 'border-l-4 border-[#9747FF] bg-[rgba(151,71,255,0.04)]'
                        : ''
                    }`}
                  >
                    <PostCard
                      post={post}
                      onReaction={handleReaction}
                      onCommentClick={handleCommentClick}
                      isSelected={selectedPostId === post.id}
                    />
                  </div>
                ))}

                {/* 마지막 메시지 */}
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
              </div>
            </div>
          </div>

          {/* PostDetail 영역 */}
          {selectedPost && (
            <>
              {/* Divider */}
              <div className="mx-5 w-[1px] bg-[#222222] opacity-10" />
              
              {/* PostDetail */}
              <div className="w-[640px]">
                <div className="h-[calc(100vh-48px)] overflow-hidden rounded-2xl bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]">
                  <PostDetail post={selectedPost} onClose={handleClosePostDetail} />
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
          <TeamSummaryCard summary={teamSummary} onViewSummaryClick={handleViewSummaryClick} />
        </div>
      </div>

      {/* 플로팅 체크아웃 버튼 */}
      {!selectedPost && <FloatingCheckoutButton onClick={openCheckOutModal} />}

      {/* 체크아웃 작성 모달 */}
      <CheckOutWriteModal isOpen={isCheckOutModalOpen} onClose={closeCheckOutModal} />
    </>
  );
}
