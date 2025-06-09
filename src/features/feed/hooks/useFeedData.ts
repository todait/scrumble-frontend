import { useState, useMemo } from 'react';
import { mockPosts, mockTeamSummary } from '../data/mockData';
import type { FilterType, Post, TeamSummary } from '../types/feed.types';

export const useFeedData = () => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 실제 구현에서는 API 호출로 데이터를 가져옴
  const posts: Post[] = mockPosts;
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
    filteredPosts,
    teamSummary,
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,
  };
};