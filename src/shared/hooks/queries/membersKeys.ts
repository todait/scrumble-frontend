/**
 * 멤버 관련 React Query 키 정의
 */

import { QueryClient } from '@tanstack/react-query';
import { SpaceMemberProfile } from '@/shared/types/member';

export const membersKeys = {
  all: ['members'] as const,
  myProfile: () => [...membersKeys.all, 'me', 'profile'] as const,
};

/**
 * 멤버 관련 캐시 무효화 헬퍼 함수들
 */
export const memberInvalidateHelpers = {
  /**
   * 내 프로필 캐시 무효화
   */
  invalidateMyProfile: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: membersKeys.myProfile() });
  },

  /**
   * 내 프로필 캐시 업데이트
   */
  updateMyProfileInCache: (
    queryClient: QueryClient,
    updater: (profile: SpaceMemberProfile) => SpaceMemberProfile
  ) => {
    queryClient.setQueryData(membersKeys.myProfile(), (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        spaceMember: updater(oldData.spaceMember),
      };
    });
  },
};