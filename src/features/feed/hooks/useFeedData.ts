import { useExistsCheckin, usePosts } from '@/shared/hooks/queries/usePosts';
import { useTeamSummary } from '@/shared/hooks/queries/useTeamSummary';
import type { Post as ApiPost } from '@/shared/types/post';
import { formatDateToAPIString, getErrorMessage } from '@/shared/utils';
import { useMemo, useState } from 'react';
import type { FilterType } from '../types/feed.types';
import { convertApiPostsToFeedPosts } from '../utils/postTransform.utils';
import { useMockPosts } from './useMockPosts';

export const useFeedData = (spaceSlug: string) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // temp-space-id일 때는 mock 데이터 사용
  const useMockData = spaceSlug === 'temp-space-id';

  const existsCheckinQuery = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(selectedDate),
  });

  // 실제 API 또는 Mock 데이터 사용
  const realPostsQuery = usePosts({
    spaceSlug,
    filterType,
    selectedDate,
    enabled: !useMockData,
  });

  const mockPostsQuery = useMockPosts({
    filterType,
  });

  const postsQuery = useMockData ? mockPostsQuery : realPostsQuery;

  // 팀 요약 정보
  const teamSummaryQuery = useTeamSummary({
    spaceSlug,
    date: selectedDate,
    enabled: true, // 팀 요약은 항상 활성화
  });
  // 데이터 변환 및 계산된 값들
  const { posts, isLoading, hasMore, nextCursor } = useMemo(() => {
    if (useMockData) {
      // Mock 데이터는 이미 Feed Post 타입으로 정의됨
      return {
        posts: postsQuery.data?.posts || [],
        isLoading: postsQuery.isLoading,
        hasMore: postsQuery.data?.hasMore || false,
        nextCursor: postsQuery.data?.nextCursor,
      };
    }


    // API 데이터는 변환 필요
    const apiPosts = (postsQuery.data?.posts || []) as ApiPost[];
    // invalidation 후 새로운 데이터를 가져오는 중이거나 초기 로딩 중일 때
    const shouldShowLoading = postsQuery.isLoading;

    return {
      posts: convertApiPostsToFeedPosts(apiPosts),
      isLoading: shouldShowLoading,
      hasMore: postsQuery.data?.hasMore || false,
      nextCursor: postsQuery.data?.nextCursor,
    };
  }, [useMockData, postsQuery.data, postsQuery.isLoading]);

  return {
    existsCheckinQuery,
    teamSummaryQuery,
    // 데이터
    posts,
    teamSummary: teamSummaryQuery.data,

    // 필터 상태
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,

    // 로딩 및 에러 상태
    isLoading: isLoading || teamSummaryQuery.isLoading,
    error: postsQuery.error
      ? getErrorMessage(postsQuery.error)
      : teamSummaryQuery.error
        ? getErrorMessage(teamSummaryQuery.error)
        : null,
    isError: postsQuery.isError || teamSummaryQuery.isError,

    // 페이지네이션
    hasMore,
    nextCursor,
    refetch: postsQuery.refetch,

    // 디버깅
    useMockData,
  };
};
