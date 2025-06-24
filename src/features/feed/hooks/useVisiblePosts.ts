import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer를 사용하여 화면에 보이는 포스트들을 추적하는 훅
 * @param threshold - 포스트가 얼마나 보여야 "보이는" 것으로 간주할지 (0-1)
 * @returns 보이는 포스트 ID들과 관찰 함수들
 */
export function useVisiblePosts(threshold = 0.1) {
  const [visiblePostIds, setVisiblePostIds] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const postsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    // Intersection Observer 생성
    observerRef.current = new IntersectionObserver(
      entries => {
        const updates = new Map<string, boolean>();

        entries.forEach(entry => {
          const postId = entry.target.getAttribute('data-post-id');
          if (postId) {
            updates.set(postId, entry.isIntersecting);
          }
        });

        setVisiblePostIds(prev => {
          const newVisible = new Set(prev);

          updates.forEach((isVisible, postId) => {
            if (isVisible) {
              newVisible.add(postId);
            } else {
              newVisible.delete(postId);
            }
          });

          // 변경사항이 있을 때만 새 배열 반환
          const newArray = Array.from(newVisible);
          if (prev.length === newArray.length && prev.every(id => newVisible.has(id))) {
            return prev;
          }

          return newArray;
        });
      },
      {
        threshold,
        rootMargin: '50px', // 뷰포트 진입 50px 전부터 미리 로드
        root: null, // viewport를 root로 사용
      }
    );

    // cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold]);

  // 포스트 엘리먼트 관찰 시작
  const observePost = useCallback((postId: string, element: HTMLElement | null) => {
    if (observerRef.current && element) {
      // 이전에 관찰 중이던 엘리먼트가 있다면 먼저 해제
      const prevElement = postsRef.current.get(postId);
      if (prevElement && prevElement !== element) {
        observerRef.current.unobserve(prevElement);
      }

      observerRef.current.observe(element);
      postsRef.current.set(postId, element);
    }
  }, []);

  // 포스트 엘리먼트 관찰 중지
  const unobservePost = useCallback((postId: string) => {
    const element = postsRef.current.get(postId);
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      postsRef.current.delete(postId);
    }
  }, []);

  // 모든 관찰 중지
  const unobserveAll = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      postsRef.current.clear();
      setVisiblePostIds([]);
    }
  }, []);

  // 디버깅용 정보
  const debug = {
    totalObserved: postsRef.current.size,
    visibleCount: visiblePostIds.length,
  };

  return {
    visiblePostIds,
    observePost,
    unobservePost,
    unobserveAll,
    debug,
  };
}
