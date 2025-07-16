import { RefObject, useEffect } from 'react';

interface UseScrollToHighlightedCommentOptions {
  highlightedCommentId: string | null | undefined;
  scrollableAreaRef: RefObject<HTMLDivElement | null>;
}

export function useScrollToHighlightedComment({
  highlightedCommentId,
  scrollableAreaRef,
}: UseScrollToHighlightedCommentOptions) {
  useEffect(() => {
    if (!highlightedCommentId) return;

    let attempts = 0;
    const maxAttempts = 10;

    // 콘텐츠 로딩 완료 확인 함수
    const waitForContentToLoad = async (container: HTMLElement): Promise<boolean> => {
      // 1. 이미지 로딩 확인
      const images = container.querySelectorAll('img');
      const allImagesLoaded = Array.from(images).every(img => (img as HTMLImageElement).complete);

      // 투두 섹션 로딩 확인 - 투두가 없어도 TodoContainer는 항상 존재
      const todoSection = container.querySelector('[data-testid="todo-section"]');
      const hasLoadingSpinner = container.querySelector('[data-testid="todo-loading-spinner"]');

      // 투두 섹션이 있고 로딩이 완료된 경우
      const todoContentReady = !!todoSection && !hasLoadingSpinner;

      return allImagesLoaded && todoContentReady;
    };

    const tryScroll = async () => {
      const element = document.getElementById(`comment-${highlightedCommentId}`);
      const container = scrollableAreaRef.current;

      if (element && container) {
        // 콘텐츠가 로드될 때까지 대기
        const isContentLoaded = await waitForContentToLoad(container);
        if (!isContentLoaded) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(() => tryScroll(), 200); // 콘텐츠 로딩 대기를 위해 간격 증가
          }
          return false;
        }
        // 자식 요소가 있는지 확인
        const hasContent =
          element.children.length > 0 || (element.textContent?.trim()?.length ?? 0) > 0;
        if (!hasContent) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryScroll, 100); // 재시도 간격도 단축
          }
          return false;
        }

        // 모든 댓글 요소 찾기
        const allComments = container.querySelectorAll('[id^="comment-"]');
        let targetIndex = -1;
        allComments.forEach((el, index) => {
          if (el.id === `comment-${highlightedCommentId}`) {
            targetIndex = index;
          }
        });

        // PostContent의 높이 먼저 계산
        const postContent =
          container.querySelector('[class*="PostContent"]') ||
          container.querySelector('.px-4.py-4') ||
          container.firstElementChild;

        // 실제 요소의 offsetTop을 찾기 위해 다시 시도
        // container 내부의 모든 요소를 순회하며 offsetTop 누적
        let actualOffsetTop = 0;

        // PostContent까지의 높이
        if (postContent) {
          actualOffsetTop =
            (postContent as HTMLElement).offsetTop + (postContent as HTMLElement).offsetHeight;
        }

        // CommentSection 내에서 실제 댓글의 위치 찾기
        if (targetIndex >= 0 && allComments[targetIndex]) {
          const targetComment = allComments[targetIndex] as HTMLElement;
          // 부모 요소들을 거슬러 올라가며 offsetTop 계산
          let currentEl = targetComment;
          let tempOffset = 0;

          while (currentEl && currentEl !== container) {
            tempOffset += currentEl.offsetTop;
            currentEl = currentEl.offsetParent as HTMLElement;
          }

          actualOffsetTop = tempOffset;
        }

        // 중앙에 위치하도록 계산
        const targetScrollTop = actualOffsetTop - container.clientHeight / 2 + 50;

        if (targetIndex >= 0) {
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'instant',
          });
        }

        return true;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 500); // 500ms 간격으로 재시도! safri 대응은 추후
      }

      return false;
    };

    // requestAnimationFrame을 사용하여 다음 렌더링 사이클에서 실행
    let rafId: number;
    const startScroll = () => {
      rafId = requestAnimationFrame(() => {
        tryScroll();
      });
    };
    const initialTimeout = setTimeout(startScroll, 50);

    return () => {
      clearTimeout(initialTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [highlightedCommentId, scrollableAreaRef]); // post.comments는 의도적으로 제외 (무한 루프 방지)
}
