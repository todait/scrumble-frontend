import { useEffect, useRef, useState } from 'react';

const HEADER_HEIGHT = 80;
const SCROLLBAR_HIDE_SELECTOR = '.scrollbar-hide';

interface UseFeedScrollReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  showScrollToTop: boolean;
  scrollToTop: () => void;
  scrollToSelectedPost: (selectedPostId: string | null) => void;
}

/**
 * 피드 스크롤 관련 로직을 관리하는 커스텀 훅
 * @param filteredPostsLength 필터링된 포스트 개수 (ResizeObserver 트리거용)
 * @returns 스크롤 관련 상태와 함수들
 */
export const useFeedScroll = (filteredPostsLength: number): UseFeedScrollReturn => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 스크롤 가능 여부 체크
  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      setShowScrollToTop(scrollHeight > clientHeight);
    }
  };

  // ResizeObserver로 컨테이너 크기 변경 감지
  useEffect(() => {
    // 초기 체크
    checkScrollable();

    const resizeObserver = new ResizeObserver(checkScrollable);
    const node = scrollContainerRef.current;
    
    if (!node) return;
    
    resizeObserver.observe(node);

    return () => {
      resizeObserver.unobserve(node);
    };
  }, [filteredPostsLength]);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    const postListElement = document.querySelector(SCROLLBAR_HIDE_SELECTOR);
    if (postListElement) {
      postListElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 선택된 포스트로 스크롤
  const scrollToSelectedPost = (selectedPostId: string | null) => {
    if (!selectedPostId) return;

    const selectedPostElement = document.querySelector(`[data-post-id="${selectedPostId}"]`);
    const postListElement = document.querySelector(SCROLLBAR_HIDE_SELECTOR);

    if (selectedPostElement && postListElement) {
      // 선택된 포스트의 상대적 위치 계산
      const postListRect = postListElement.getBoundingClientRect();
      const selectedPostRect = selectedPostElement.getBoundingClientRect();

      // 현재 스크롤 위치에서 선택된 포스트까지의 거리 계산
      const scrollOffset =
        postListElement.scrollTop + 
        (selectedPostRect.top - postListRect.top) - 
        HEADER_HEIGHT;

      postListElement.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  return {
    scrollContainerRef,
    showScrollToTop,
    scrollToTop,
    scrollToSelectedPost,
  };
};