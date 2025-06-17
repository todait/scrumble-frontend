import { useQuery } from '@tanstack/react-query';
import { mockTeamSummary } from '@/features/feed/data/mockData';
import type { TeamSummary } from '@/features/feed/types/feed.types';
import { postsApi } from '@/shared/lib/api/posts';
import { postsKeys } from './postsKeys';
import { authRetry } from '@/shared/utils/query';
import { formatDateToAPIString } from '@/shared/utils';
import type { GetFeedSummaryResponse } from '@/shared/types/post';

interface UseTeamSummaryOptions {
  spaceSlug: string;
  date?: Date;
  enabled?: boolean;
}

/**
 * 팀 요약 정보를 가져오는 React Query 훅
 * FeedSummary API를 사용하여 실제 데이터를 가져옴
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const useTeamSummary = (options: UseTeamSummaryOptions) => {
  const { spaceSlug, date = new Date(), enabled = true } = options;
  const dateString = formatDateToAPIString(date);

  // temp-space-id일 때는 mock 데이터 사용
  const useMockData = spaceSlug === 'temp-space-id';

  return useQuery({
    queryKey: useMockData ? ['teamSummary', spaceSlug] : postsKeys.feedSummary(spaceSlug, dateString),
    queryFn: async (): Promise<TeamSummary> => {
      if (useMockData) {
        // Mock 데이터 반환
        await new Promise(resolve => setTimeout(resolve, 100)); // 네트워크 지연 시뮬레이션
        return mockTeamSummary;
      }

      // 실제 API 호출
      const response: GetFeedSummaryResponse = await postsApi.getFeedSummary({ 
        spaceSlug, 
        date: dateString 
      });
      
      // API 응답을 TeamSummary 타입으로 변환
      return {
        teamCondition: response.summary?.averageConditionScore ?? 0,
        checkedInCount: response.summary?.checkinCount ?? 0,
        totalMembers: response.summary?.totalWorkdayMemberCount ?? 1,
        checkedOutCount: response.summary?.checkOutCount ?? 0,
      };
    },
    enabled: !!spaceSlug && enabled,
    staleTime: 1000 * 30, // 30초 (실시간 데이터이므로 짧게)
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: true,
    retry: authRetry,
  });
};