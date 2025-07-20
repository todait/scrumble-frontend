'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { authKeys } from '@/shared/hooks/queries/authKeys';
import { authApi } from '@/shared/lib/api/auth';
import { TokenManager } from '@/shared/lib/token';
import type { User, UserWithLatestSpace } from '@/shared/types/auth';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  // 사용자 정보
  user: (User & { centrifugoToken?: string }) | undefined;
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

  // 사용자 및 최신 스페이스 정보를 하나의 쿼리로 통합
  const {
    data: userWithSpace,
    isLoading: isUserLoading,
    error,
    isError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.userWithLatestSpace(),
    queryFn: async () => {
      const data = await authApi.getCurrentUserWithLatestSpace();

      const user: User & { memberId?: string; centrifugoToken?: string } = {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarURL: data.avatarURL,
        memberId: data.memberId,
        ...(data.centrifugoToken && { centrifugoToken: data.centrifugoToken }),
      };

      // localStorage에 저장 (클라이언트에서만)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { user, latestSpace: data };
    },
    enabled: isInitialized && TokenManager.isRefreshTokenValid(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });

  // 추출된 데이터
  const baseUser = userWithSpace?.user;
  const latestSpace = userWithSpace?.latestSpace;

  // 그룹에서의 최신 사용자 정보가 포함된 user 객체 생성
  const user = useMemo(() => {
    if (!baseUser) return undefined;

    return {
      ...baseUser,
      // 그룹에서의 최신 사용자 정보로 덮어쓰기
      ...(latestSpace?.name && { name: latestSpace.name }),
      ...(latestSpace?.avatarURL && { avatarURL: latestSpace.avatarURL }),
      memberId: latestSpace?.memberId,
      centrifugoToken: latestSpace?.centrifugoToken,
    };
  }, [
    baseUser,
    latestSpace?.name,
    latestSpace?.avatarURL,
    latestSpace?.memberId,
    latestSpace?.centrifugoToken,
  ]);

  // 로그아웃 mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    onSettled: async () => {
      TokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user'); // 사용자 정보도 삭제
      }
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
  }) => {
    // 토큰 저장 (만료 시간 자동 추출)
    TokenManager.setTokens({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    });

    // 관련 쿼리 무효화
    await queryClient.invalidateQueries({ queryKey: authKeys.all });

    // 사용자 및 스페이스 정보 즉시 가져오기
    await queryClient.fetchQuery({
      queryKey: authKeys.userWithLatestSpace(),
      queryFn: async () => {
        const data = await authApi.getCurrentUserWithLatestSpace();

        const user: User & { memberId?: string; centrifugoToken?: string } = {
          id: data.id,
          email: data.email,
          name: data.name,
          avatarURL: data.avatarURL,
          memberId: data.memberId,
          ...(data.centrifugoToken && { centrifugoToken: data.centrifugoToken }),
        };

        // localStorage에 저장 (클라이언트에서만)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }

        return { user, latestSpace: data };
      },
    });
  };

  const value: AuthContextValue = {
    // 사용자 정보
    user,
    latestSpace,

    // 인증 상태
    isAuthenticated: !!user && TokenManager.isRefreshTokenValid(),
    isInitialized,
    isLoading: !isInitialized || isUserLoading,

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
