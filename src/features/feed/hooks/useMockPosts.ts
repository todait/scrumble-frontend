import { useMemo } from 'react';
import { mockPosts } from '../data/mockData';
import type { Post, FilterType } from '../types/feed.types';

interface UseMockPostsOptions {
  filterType: FilterType;
}

/**
 * Mock 데이터를 위한 훅
 * 실제 API 대신 mock 데이터를 사용할 때 동일한 인터페이스 제공
 * @param options 필터 옵션
 * @returns Mock 포스트 데이터와 상태
 */
export const useMockPosts = (options: UseMockPostsOptions) => {
  const { filterType } = options;

  const filteredPosts = useMemo(() => {
    if (filterType === 'all') return mockPosts as Post[];
    return (mockPosts as Post[]).filter(post => post.type === filterType);
  }, [filterType]);

  return {
    data: {
      posts: filteredPosts,
      hasMore: false,
      nextCursor: undefined,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};