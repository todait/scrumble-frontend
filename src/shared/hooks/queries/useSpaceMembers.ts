import { Member } from '@/shared/types/member';
import { useQuery } from '@tanstack/react-query';

interface SpaceMembersResponse {
  members: Member[];
  total: number;
}

const fetchSpaceMembers = async (spaceSlug: string): Promise<Member[]> => {
  const response = await apiClient.get<SpaceMembersResponse>(`/spaces/${spaceSlug}/members`);
  return response.data.members;
};

export const useSpaceMembers = (spaceSlug: string) => {
  return useQuery({
    queryKey: ['space-members', spaceSlug],
    queryFn: () => fetchSpaceMembers(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};

// 활성 멤버만 가져오는 훅
export const useActiveSpaceMembers = (spaceSlug: string) => {
  const { data: allMembers = [], ...rest } = useSpaceMembers(spaceSlug);

  const activeMembers = allMembers.filter(member => member.status === 'active');

  return {
    data: activeMembers,
    ...rest,
  };
};
