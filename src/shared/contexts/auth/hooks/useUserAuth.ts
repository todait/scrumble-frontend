import { ROUTES } from '@/shared/constants';
import { authKeys } from '@/shared/hooks/queries/authKeys';
import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager, TokenManager } from '@/shared/lib/token';
import { useAuthStore } from '@/shared/stores/authStore';
import type { User } from '@/shared/types/auth';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AuthPersistenceService } from '../services/authPersistence';
import type { AuthDataParams } from '../types';

export function useUserAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // 앱 시작 시 토큰 유효성 체크 (한 번만)
  useEffect(() => {
    const initAuth = async () => {
      if (!TokenManager.isRefreshTokenValid()) {
        TokenManager.clearTokens();
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // 사용자 정보 조회
  const {
    data: user,
    isLoading: isUserLoading,
    error,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const data = await authApi.getCurrentUser();

      const user: User = {
        id: data.id,
        email: data.email,
      };

      // localStorage에 저장
      AuthPersistenceService.saveUser(user);

      return user;
    },
    enabled: isInitialized && TokenManager.isRefreshTokenValid(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });

  // 로그아웃 mutation (전체 로그아웃)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 현재 Space에서 로그아웃 시도 (에러 무시)
      const currentSpaceSlug = SpaceMemberTokenManager.getCurrentSpaceSlug();
      if (currentSpaceSlug && SpaceMemberTokenManager.hasValidToken(currentSpaceSlug)) {
        try {
          await authApi.logoutFromSpace();
        } catch (error) {
          console.error('Space logout error:', error);
        }
      }

      // User 레벨 로그아웃
      await authApi.logout();
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    onSettled: async () => {
      // 모든 토큰 제거
      TokenManager.clearTokens();
      SpaceMemberTokenManager.clearAllTokens();
      SpaceMemberTokenManager.clearCurrentSpaceSlug();
      SpaceMemberTokenManager.clearCurrentSpace();

      // 로컬 데이터 정리
      AuthPersistenceService.clearAll();
      
      // Zustand store 초기화
      useAuthStore.getState().clearAuthStore();

      queryClient.clear();
      router.replace(ROUTES.AUTH);
    },
  });

  // setAuthData 함수 (OAuth 콜백용)
  const setAuthData = useCallback(async (params: AuthDataParams) => {
    // 토큰 저장
    TokenManager.setTokens({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    });

    // 관련 쿼리 무효화
    await queryClient.invalidateQueries({ queryKey: authKeys.all });

    // 사용자 정보 즉시 가져오기
    await queryClient.fetchQuery({
      queryKey: authKeys.user(),
      queryFn: async () => {
        const data = await authApi.getCurrentUser();

        const user: User = {
          id: data.id,
          email: data.email,
        };

        // localStorage에 저장
        AuthPersistenceService.saveUser(user);

        return user;
      },
    });
  }, [queryClient]);

  return {
    user,
    isAuthenticated: !!user && TokenManager.isRefreshTokenValid(),
    isInitialized,
    isLoading: !isInitialized || isUserLoading,
    error: error as Error | null,
    isError,
    refetchUser,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    setAuthData,
  };
}