import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/constants';

export const useFeedActions = (spaceSlug: string) => {
  const router = useRouter();

  const handleCommentClick = (postId: string) => {
    // 타임스탬프를 추가하여 매번 다른 URL로 만들어 useEffect가 실행되도록 함
    const timestamp = Date.now();
    router.push(`${ROUTES.SPACE_FEED(spaceSlug)}?post=${postId}&comments=${timestamp}`, {
      scroll: false,
    });
  };

  const handleViewSummaryClick = () => {
    router.push(ROUTES.SPACE_REPORTS(spaceSlug));
  };

  return {
    handleCommentClick,
    handleViewSummaryClick,
  };
};
