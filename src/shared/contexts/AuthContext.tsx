'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { authKeys } from '@/shared/hooks/queries/authKeys';
import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager, TokenManager } from '@/shared/lib/token';
import { useAuthStore } from '@/shared/stores/authStore';
import type { User } from '@/shared/types/auth';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// SpaceMember 정보 인터페이스
interface SpaceMemberInfo {
  id: string;
  spaceId: string;
  spaceSlug: string;
  role: string;
  name: string;
  avatarURL?: string;
  centrifugoToken?: string;
}

interface AuthContextValue {
  // User 정보 (기본 인증용)
  user: User | undefined;

  // SpaceMember 정보 (새로 추가)
  currentSpaceMember: SpaceMemberInfo | undefined;
  availableSpaces: SpaceMemberInfo[];
  currentSpaceSlug: string | undefined;

  // 인증 상태
  isAuthenticated: boolean;
  isSpaceAuthenticated: boolean; // 새로 추가
  isInitialized: boolean;
  isLoading: boolean;

  // 에러 상태
  error: Error | null;
  isError: boolean;

  // 액션들
  logout: () => void;
  logoutFromSpace: (spaceSlug: string) => Promise<void>; // 새로 추가
  switchSpace: (spaceSlug: string) => Promise<void>; // 새로 추가
  refetchUser: () => void;
  refetchSpaceMember: () => void; // 새로 추가

  // 로딩 상태들
  isLoggingOut: boolean;
  isSwitchingSpace: boolean; // 새로 추가

  // 유틸리티 함수들
  setAuthData: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
  }) => Promise<void>;

  setSpaceAuthData: (params: {
    // 새로 추가
    spaceSlug: string;
    spaceMemberId: string;
    spaceId: string;
    role: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSwitchingSpace, setIsSwitchingSpace] = useState(false);

  // SpaceMember 상태 관리
  const [currentSpaceSlug, setCurrentSpaceSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return SpaceMemberTokenManager.getCurrentSpace() || undefined;
    }
    return undefined;
  });

  const [availableSpaces, setAvailableSpaces] = useState<SpaceMemberInfo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('available_spaces');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

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

      // localStorage에 저장 (클라이언트에서만)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    },
    enabled: isInitialized && TokenManager.isRefreshTokenValid(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });

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
        const updatedSpaces = [...availableSpaces];
        const existingIndex = updatedSpaces.findIndex(s => s.spaceSlug === currentSpaceSlug);

        if (existingIndex >= 0) {
          updatedSpaces[existingIndex] = spaceMemberInfo;
        } else {
          updatedSpaces.push(spaceMemberInfo);
        }

        setAvailableSpaces(updatedSpaces);
        if (typeof window !== 'undefined') {
          localStorage.setItem('available_spaces', JSON.stringify(updatedSpaces));
        }

        return spaceMemberInfo;
      } catch (error) {
        console.error('Failed to fetch space member:', error);
        return null;
      }
    },
    enabled:
      isInitialized &&
      !!currentSpaceSlug &&
      SpaceMemberTokenManager.hasValidToken(currentSpaceSlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: authRetry,
  });

  // 추출된 데이터
  const currentSpaceMember = spaceMemberData || undefined;

  // 로그아웃 mutation (전체 로그아웃)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 현재 Space에서 로그아웃 (SpaceMember 토큰이 있는 경우)
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
      SpaceMemberTokenManager.clearCurrentSpace();

      // 로컬 데이터 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('available_spaces');
      }
      
      // Zustand store 초기화
      useAuthStore.getState().clearAuthStore();

      queryClient.clear();
      router.replace(ROUTES.AUTH);
    },
  });

  // Space 전환 함수
  const switchSpace = async (spaceSlug: string) => {
    setIsSwitchingSpace(true);
    try {
      // 해당 Space의 토큰이 있는지 확인
      if (!SpaceMemberTokenManager.hasValidToken(spaceSlug)) {
        // 없으면 Space 로그인 시도
        const response = await authApi.loginToSpace(spaceSlug);

        // SpaceMember 토큰 저장
        SpaceMemberTokenManager.setToken(spaceSlug, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        // Space 정보도 업데이트
        const spaceInfo: SpaceMemberInfo = {
          id: response.spaceMemberId,
          spaceId: response.spaceMemberId, // spaceId가 없으므로 spaceMemberId 사용
          spaceSlug: response.spaceSlug,
          role: response.role,
          name: '',
          avatarURL: undefined,
          centrifugoToken: response.centrifugoToken,
        };

        const updatedSpaces = [...availableSpaces];
        const existingIndex = updatedSpaces.findIndex(s => s.spaceSlug === spaceSlug);

        if (existingIndex >= 0) {
          updatedSpaces[existingIndex] = spaceInfo;
        } else {
          updatedSpaces.push(spaceInfo);
        }

        setAvailableSpaces(updatedSpaces);
        if (typeof window !== 'undefined') {
          localStorage.setItem('available_spaces', JSON.stringify(updatedSpaces));
        }
      }

      // 현재 Space 변경
      setCurrentSpaceSlug(spaceSlug);
      SpaceMemberTokenManager.setCurrentSpace(spaceSlug);
      
      // Zustand store에도 저장 (localStorage 연동)
      useAuthStore.getState().setLatestSpaceSlug(spaceSlug);

      // UI 및 데이터 새로고침
      await queryClient.invalidateQueries({
        queryKey: ['spaceMember', spaceSlug],
      });
    } catch (error) {
      console.error('Failed to switch space:', error);
      throw error;
    } finally {
      setIsSwitchingSpace(false);
    }
  };

  // Space별 로그아웃
  const logoutFromSpace = async (spaceSlug: string) => {
    try {
      // 현재 Space에서만 로그아웃
      if (spaceSlug === currentSpaceSlug) {
        await authApi.logoutFromSpace();
      }

      // 해당 Space 토큰 제거
      SpaceMemberTokenManager.clearToken(spaceSlug);

      // Available spaces에서 제거
      const updatedSpaces = availableSpaces.filter(s => s.spaceSlug !== spaceSlug);
      setAvailableSpaces(updatedSpaces);
      if (typeof window !== 'undefined') {
        localStorage.setItem('available_spaces', JSON.stringify(updatedSpaces));
      }

      // 현재 Space에서 로그아웃한 경우
      if (currentSpaceSlug === spaceSlug) {
        if (updatedSpaces.length > 0) {
          // 다른 Space로 전환
          await switchSpace(updatedSpaces[0].spaceSlug);
        } else {
          // 모든 Space에서 로그아웃됨
          setCurrentSpaceSlug(undefined);
          SpaceMemberTokenManager.clearCurrentSpace();
        }
      }
    } catch (error) {
      console.error('Space logout error:', error);
      throw error;
    }
  };

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

    // 사용자 정보 즉시 가져오기
    await queryClient.fetchQuery({
      queryKey: authKeys.user(),
      queryFn: async () => {
        const data = await authApi.getCurrentUser();

        const user: User = {
          id: data.id,
          email: data.email,
        };

        // localStorage에 저장 (클라이언트에서만)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }

        return user;
      },
    });
  };

  // Space 인증 데이터 설정
  const setSpaceAuthData = async (params: {
    spaceSlug: string;
    spaceMemberId: string;
    spaceId: string;
    role: string;
  }) => {
    // Space 정보 저장
    const spaceInfo: SpaceMemberInfo = {
      id: params.spaceMemberId,
      spaceId: params.spaceId,
      spaceSlug: params.spaceSlug,
      role: params.role,
      name: user?.email || '',
      avatarURL: undefined,
    };

    // Available spaces 업데이트
    const updatedSpaces = [...availableSpaces];
    const existingIndex = updatedSpaces.findIndex(s => s.spaceSlug === params.spaceSlug);

    if (existingIndex >= 0) {
      updatedSpaces[existingIndex] = spaceInfo;
    } else {
      updatedSpaces.push(spaceInfo);
    }

    setAvailableSpaces(updatedSpaces);
    if (typeof window !== 'undefined') {
      localStorage.setItem('available_spaces', JSON.stringify(updatedSpaces));
    }

    // 현재 Space로 설정
    await switchSpace(params.spaceSlug);
  };

  const value: AuthContextValue = {
    user,
    // SpaceMember 정보
    currentSpaceMember, // 대부분 현재 스페이스의 정보를 사용
    availableSpaces,
    currentSpaceSlug,

    // 인증 상태
    isAuthenticated: !!user && TokenManager.isRefreshTokenValid(),
    isSpaceAuthenticated:
      !!currentSpaceMember &&
      !!currentSpaceSlug &&
      SpaceMemberTokenManager.hasValidToken(currentSpaceSlug),
    isInitialized,
    isLoading: !isInitialized || isUserLoading || isSpaceMemberLoading,

    // 에러 상태
    error: (error || spaceMemberError) as Error | null,
    isError: isError || !!spaceMemberError,

    // 액션들
    logout: () => logoutMutation.mutate(),
    logoutFromSpace,
    switchSpace,
    refetchUser,
    refetchSpaceMember,

    // 로딩 상태들
    isLoggingOut: logoutMutation.isPending,
    isSwitchingSpace,

    // 유틸리티 함수들
    setAuthData,
    setSpaceAuthData,
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
