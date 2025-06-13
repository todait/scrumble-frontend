import { useRouter } from 'next/navigation';

interface UseFeedNavigationReturn {
  handlePostClick: (postId: string) => void;
  handleClosePostDetail: () => void;
}

/**
 * 피드 네비게이션 관련 로직을 관리하는 커스텀 훅
 * @param spaceSlug 현재 스페이스 슬러그
 * @returns 네비게이션 관련 함수들
 */
export const useFeedNavigation = (spaceSlug: string): UseFeedNavigationReturn => {
  const router = useRouter();

  const handlePostClick = (postId: string) => {
    router.push(`/${spaceSlug}/feed?post=${postId}`, { scroll: false });
  };

  const handleClosePostDetail = () => {
    router.push(`/${spaceSlug}/feed`, { scroll: false });
  };

  return {
    handlePostClick,
    handleClosePostDetail,
  };
};