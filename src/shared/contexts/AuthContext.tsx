'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { authKeys } from '@/shared/hooks/queries/authKeys';
import { authApi } from '@/shared/lib/api/auth';
import { TokenManager } from '@/shared/lib/token';
import type { User, UserWithLatestSpace } from '@/shared/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  // 사용자 정보
  user: User | undefined;
  latestSpace: UserWithLatestSpace | undefined;

  // 인증 상태
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // 에러 상태
  error: Error | null;
  isError: boolean;

  // 액션들
  logout: () => void;
  refetchUser: () => void;

  // 로딩 상태들
  isLoggingOut: boolean;

  // 유틸리티 함수들
  setAuthData: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
    userName: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // 자동 토큰 갱신 활성화
  useAutoRefreshToken();

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

  // 사용자 정보 쿼리
  const {
    data: user,
    isLoading: isUserLoading,
    error,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    enabled: isInitialized && TokenManager.isRefreshTokenValid(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) return false;
      }
      return failureCount < 2;
    },
  });

  // 최신 스페이스 정보 쿼리
  const { data: latestSpace, isLoading: isLatestSpaceLoading } = useQuery({
    queryKey: authKeys.userWithLatestSpace(),
    queryFn: authApi.getCurrentUserWithLatestSpace,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // 로그아웃 mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    onSettled: async () => {
      TokenManager.clearTokens();
      queryClient.clear();
      router.replace(ROUTES.AUTH);
    },
  });

  // setAuthData 함수 (OAuth 콜백용)
  const setAuthData = async (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
    userName: string;
  }) => {
    // 토큰 저장 (만료 시간 자동 추출)
    TokenManager.setTokens({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    });

    // 사용자 정보 생성
    const userData: User = {
      id: params.userId,
      email: decodeURIComponent(params.userEmail),
      name: decodeURIComponent(params.userName),
      avatarURL: '',
    };

    // React Query 캐시 업데이트
    queryClient.setQueryData(authKeys.user(), userData);

    // 관련 쿼리 무효화
    await queryClient.invalidateQueries({ queryKey: authKeys.all });

    // latestSpace 즉시 가져오기
    await queryClient.fetchQuery({
      queryKey: authKeys.userWithLatestSpace(),
      queryFn: authApi.getCurrentUserWithLatestSpace,
    });
  };

  const value: AuthContextValue = {
    // 사용자 정보
    user,
    latestSpace,

    // 인증 상태
    isAuthenticated: !!user && TokenManager.isRefreshTokenValid(),
    isInitialized,
    isLoading: !isInitialized || isUserLoading || isLatestSpaceLoading,

    // 에러 상태
    error: error as Error | null,
    isError,

    // 액션들
    logout: () => logoutMutation.mutate(),
    refetchUser,

    // 로딩 상태들
    isLoggingOut: logoutMutation.isPending,

    // 유틸리티 함수들
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
