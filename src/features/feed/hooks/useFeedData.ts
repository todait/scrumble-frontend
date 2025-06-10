import { useState, useMemo, useEffect } from 'react';
import { mockPosts, mockTeamSummary } from '../data/mockData';
import type { FilterType, Post, TeamSummary } from '../types/feed.types';
// TODO: API 연동 시 feedService import
// import { feedService } from '../services';

export const useFeedData = (spaceId?: string) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: API 연동 시 실제 데이터 가져오기
  // useEffect(() => {
  //   const fetchFeedData = async () => {
  //     if (!spaceId) return;
  //     
  //     setIsLoading(true);
  //     setError(null);
  //     
  //     try {
  //       const result = await feedService.getFeedPosts(spaceId, 1, 20, filterType);
  //       if (result.success && result.data) {
  //         setPosts(result.data.items);
  //       } else {
  //         setError(result.error || 'Failed to fetch posts');
  //       }
  //     } catch (err) {
  //       setError('네트워크 오류가 발생했습니다.');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   
  //   fetchFeedData();
  // }, [spaceId, filterType]);

  // 현재는 mock 데이터 사용
  const teamSummary: TeamSummary = mockTeamSummary;

  // 필터링된 포스트
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (filterType === 'all') return true;
      return post.type === filterType;
    });
  }, [posts, filterType]);

  return {
    posts,
    setPosts,
    filteredPosts,
    teamSummary,
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,
    isLoading,
    error,
  };
};