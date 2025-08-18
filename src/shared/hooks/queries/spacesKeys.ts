/**
 * 스페이스 관련 React Query 키 정의
 * 캐시 무효화 및 최적화를 위한 구조화된 키 시스템
 */

import type { QueryClient } from '@tanstack/react-query';
import type { Space } from '@/shared/types/space';

export const spacesKeys = {
  // 최상위 키
  all: ['spaces'] as const,

  // 내 스페이스 목록 키
  myList: () => [...spacesKeys.all, 'myList'] as const,

  // 개별 스페이스 키
  details: () => [...spacesKeys.all, 'detail'] as const,
  detail: (spaceSlug: string) => [...spacesKeys.details(), spaceSlug] as const,

  // 생성 관련 키
  creates: () => [...spacesKeys.all, 'create'] as const,

  // 수정 관련 키
  updates: () => [...spacesKeys.all, 'update'] as const,

  // 삭제 관련 키
  deletes: () => [...spacesKeys.all, 'delete'] as const,

  // 멤버 관련 키
  members: () => [...spacesKeys.all, 'members'] as const,
  membersList: (spaceSlug: string) => [...spacesKeys.members(), spaceSlug] as const,
};

// 선택적 무효화 헬퍼 함수들
export const spaceInvalidateHelpers = {
  /**
   * 모든 스페이스 관련 캐시 무효화
   * 스페이스 생성/수정/삭제 후 사용
   */
  invalidateAllSpaces: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
      queryKey: spacesKeys.all,
    });
  },

  /**
   * 내 스페이스 목록만 무효화
   * 스페이스 생성/삭제 후 사용
   */
  invalidateMySpaces: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
      queryKey: spacesKeys.myList(),
    });
  },

  /**
   * 특정 스페이스 상세 정보만 무효화
   * 스페이스 수정 후 사용
   */
  invalidateSpace: (queryClient: QueryClient, spaceSlug: string) => {
    queryClient.invalidateQueries({
      queryKey: spacesKeys.detail(spaceSlug),
    });
  },

  /**
   * 특정 스페이스 캐시 업데이트 (무효화 없이)
   * Optimistic update에 사용
   */
  updateSpaceInCache: (queryClient: QueryClient, spaceSlug: string, updater: (space: Space) => Space) => {
    // 상세 조회 캐시 업데이트
    queryClient.setQueryData(spacesKeys.detail(spaceSlug), (oldData: { space: Space } | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        space: updater(oldData.space),
      };
    });

    // 목록 캐시에서도 업데이트
    queryClient.setQueryData(spacesKeys.myList(), (oldData: { spaces: Space[] } | undefined) => {
      if (!oldData?.spaces) return oldData;
      return {
        ...oldData,
        spaces: oldData.spaces.map((space) =>
          space.slug === spaceSlug ? updater(space) : space
        ),
      };
    });
  },

  /**
   * 스페이스 목록에서 제거 (무효화 없이)
   * 스페이스 삭제 시 Optimistic update에 사용
   */
  removeSpaceFromCache: (queryClient: QueryClient, spaceSlug: string) => {
    // 목록에서 제거
    queryClient.setQueryData(spacesKeys.myList(), (oldData: { spaces: Space[] } | undefined) => {
      if (!oldData?.spaces) return oldData;
      return {
        ...oldData,
        spaces: oldData.spaces.filter((space) => space.slug !== spaceSlug),
      };
    });

    // 상세 캐시 제거
    queryClient.removeQueries({
      queryKey: spacesKeys.detail(spaceSlug),
    });
  },

  /**
   * 스페이스 목록에 추가 (무효화 없이)
   * 스페이스 생성 시 Optimistic update에 사용
   */
  addSpaceToCache: (queryClient: QueryClient, newSpace: Space) => {
    queryClient.setQueryData(spacesKeys.myList(), (oldData: { spaces: Space[] } | undefined) => {
      if (!oldData) {
        return { spaces: [newSpace] };
      }
      return {
        ...oldData,
        spaces: [...oldData.spaces, newSpace],
      };
    });
  },
};