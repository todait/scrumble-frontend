import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager } from '@/shared/lib/token';
import { authRetry } from '@/shared/utils/query';
import { useQuery } from '@tanstack/react-query';
import { AuthPersistenceService } from '../services/authPersistence';
import type { SpaceMemberInfo } from '../types';

interface UseSpaceMemberAuthOptions {
  currentSpaceSlug?: string;
  availableSpaces: SpaceMemberInfo[];
  setAvailableSpaces: (spaces: SpaceMemberInfo[]) => void;
  isInitialized: boolean;
}

export function useSpaceMemberAuth({
  currentSpaceSlug,
  availableSpaces,
  setAvailableSpaces,
  isInitialized,
}: UseSpaceMemberAuthOptions) {
  // SpaceMember 정보 조회
  const {
    data: spaceMemberData,
    isLoading: isSpaceMemberLoading,
    error: spaceMemberError,
    refetch: refetchSpaceMember,
  } = useQuery({
    queryKey: ['spaceMember', currentSpaceSlug],
    queryFn: async () => {
      if (!currentSpaceSlug) return null;

      try {
        // 토큰 리프레시 로직 제거 - 자동 리프레시 훅이 처리
        const data = await authApi.getCurrentSpaceMember();

        // SpaceMember 정보 포맷
        const spaceMemberInfo: SpaceMemberInfo = {
          id: data.id,
          spaceId: data.spaceId,
          spaceSlug: data.spaceSlug,
          role: data.role,
          name: data.name,
          avatarURL: data.avatarURL,
          centrifugoToken: data.centrifugoToken,
        };

        // 사용 가능한 Space 목록 업데이트
        const updatedSpaces = AuthPersistenceService.updateSpaceInfo(
          currentSpaceSlug,
          spaceMemberInfo,
          availableSpaces
        );
        setAvailableSpaces(updatedSpaces);

        return spaceMemberInfo;
      } catch (error) {
        console.error('Failed to fetch space member:', error);
        return null;
      }
    },
    enabled:
      isInitialized &&
      !!currentSpaceSlug &&
      !!SpaceMemberTokenManager.getRefreshToken(currentSpaceSlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: authRetry,
  });

  const currentSpaceMember = spaceMemberData || undefined;

  return {
    currentSpaceMember,
    isSpaceAuthenticated:
      !!currentSpaceMember &&
      !!currentSpaceSlug &&
      SpaceMemberTokenManager.hasValidToken(currentSpaceSlug),
    isSpaceMemberLoading,
    spaceMemberError: spaceMemberError as Error | null,
    refetchSpaceMember,
  };
}