import { useQuery } from '@tanstack/react-query';
import { mockTeamSummary } from '@/features/feed/data/mockData';
import type { TeamSummary } from '@/features/feed/types/feed.types';

interface UseTeamSummaryOptions {
  spaceSlug: string;
  enabled?: boolean;
}

/**
 * 팀 요약 정보를 가져오는 React Query 훅
 * 현재는 mock 데이터를 사용하지만, 추후 실제 API로 교체 가능
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const useTeamSummary = (options: UseTeamSummaryOptions) => {
  const { spaceSlug, enabled = true } = options;

  return useQuery({
    queryKey: ['teamSummary', spaceSlug],
    queryFn: async (): Promise<TeamSummary> => {
      // 실제 API 호출로 교체할 예정
      // return teamSummaryApi.getTeamSummary(spaceSlug);
      
      // 현재는 mock 데이터 반환
      await new Promise(resolve => setTimeout(resolve, 100)); // 네트워크 지연 시뮬레이션
      return mockTeamSummary;
    },
    enabled: !!spaceSlug && enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 15, // 15분
    refetchOnWindowFocus: false,
  });
};