'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshSpaceMemberToken } from '@/shared/hooks/auth/useAutoRefreshSpaceMemberToken';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { SpaceMemberTokenManager, storageEventListener, TokenManager } from '@/shared/lib/token';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useSpaceManager } from './auth/hooks/useSpaceManager';
import { useSpaceMemberAuth } from './auth/hooks/useSpaceMemberAuth';
import { useUserAuth } from './auth/hooks/useUserAuth';
import type { AuthContextValue } from './auth/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // User 인증 관련
  const userAuth = useUserAuth();

  // Space 관리 관련
  const spaceManager = useSpaceManager({ user: userAuth.user });

  // SpaceMember 인증 관련
  const spaceMemberAuth = useSpaceMemberAuth({
    currentSpaceSlug: spaceManager.currentSpaceSlug,
    availableSpaces: spaceManager.availableSpaces,
    setAvailableSpaces: spaceManager.setAvailableSpaces,
    isInitialized: userAuth.isInitialized,
  });

  // 자동 토큰 갱신 활성화 - 인증된 사용자만
  const isAuthenticated = userAuth.isInitialized && !!userAuth.user;
  useAutoRefreshToken({ enabled: isAuthenticated });

  // SpaceMember 토큰 자동 갱신 활성화
  useAutoRefreshSpaceMemberToken({
    currentSpaceSlug: spaceManager.currentSpaceSlug,
    enabled: isAuthenticated && !!spaceManager.currentSpaceSlug,
  });

  // Effect에서 사용할 의존성 최소화용 구조분해
  const { currentSpaceSlug, switchSpace } = spaceManager;
  const { refetchSpaceMember } = spaceMemberAuth;

  // 탭 간 로그아웃 동기화 및 인증 실패 처리
  useEffect(() => {
    // Storage 이벤트 리스너 시작
    storageEventListener.start();

    // 다른 탭에서 토큰 변경 시 처리
    const unsubscribeStorage = storageEventListener.subscribe(() => {
      // 초기화되지 않았으면 무시
      if (!userAuth.isInitialized) return;

      // 유저 리프레시 토큰이 유효하지 않다면 로그인 페이지로 이동
      if (!TokenManager.isRefreshTokenValid()) {
        router.replace(ROUTES.AUTH);
        return;
      }

      // 현재 스페이스의 리프레시 토큰이 유효하지 않다면 조용히 스페이스 세션 복구 시도
      const slug = currentSpaceSlug;
      if (slug && !SpaceMemberTokenManager.isRefreshTokenValid(slug)) {
        switchSpace(slug).catch(() => {
          // 조용히 실패 무시 (사용자에게 선택 기회를 주기 위함)
        });
        return;
      }

      // 정상 케이스: 멤버 정보 리패치로 centrifugoToken 최신화
      refetchSpaceMember();
    });

    // authenticationFailed 이벤트 리스너
    const handleAuthFailed = () => {
      router.replace(ROUTES.AUTH);
    };

    // 탭 복귀 시 토큰 상태 확인 및 복구
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      // 초기화되지 않았으면 무시
      if (!userAuth.isInitialized) return;

      // 공개 페이지(/auth, /)에서는 토큰 체크를 하지 않음
      const publicPaths = ['/', '/auth'];
      const currentPath = window.location.pathname;
      if (publicPaths.some(path => currentPath === path || currentPath.startsWith('/auth'))) {
        return;
      }

      // 유저 리프레시 토큰이 유효하지 않으면 로그인 페이지로 이동
      if (!TokenManager.isRefreshTokenValid()) {
        router.replace(ROUTES.AUTH);
        return;
      }

      // 스페이스 리프레시 토큰이 만료되었으면 조용히 복구 시도
      const slug = currentSpaceSlug;
      if (slug && !SpaceMemberTokenManager.isRefreshTokenValid(slug)) {
        switchSpace(slug).catch(() => {
          // 조용히 실패 무시
        });
        return;
      }

      // 정상 케이스: 멤버 정보 리패치로 centrifugoToken 최신화
      refetchSpaceMember();
    };

    // spaceMember 토큰 이벤트 핸들링
    const handleSpaceMemberTokenRefreshed = () => {
      refetchSpaceMember();
    };
    const handleSpaceMemberTokenExpired = () => {
      const slug = currentSpaceSlug;
      if (slug) {
        switchSpace(slug).catch(() => {
          // 조용히 실패 무시
        });
      }
    };

    window.addEventListener('authenticationFailed', handleAuthFailed);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(
      'spaceMemberTokenRefreshed',
      handleSpaceMemberTokenRefreshed as unknown as EventListener
    );
    window.addEventListener(
      'spaceMemberTokenExpired',
      handleSpaceMemberTokenExpired as unknown as EventListener
    );

    // Cleanup
    return () => {
      unsubscribeStorage();
      window.removeEventListener('authenticationFailed', handleAuthFailed);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        'spaceMemberTokenRefreshed',
        handleSpaceMemberTokenRefreshed as unknown as EventListener
      );
      window.removeEventListener(
        'spaceMemberTokenExpired',
        handleSpaceMemberTokenExpired as unknown as EventListener
      );
    };
  }, [router, currentSpaceSlug, switchSpace, refetchSpaceMember, userAuth.isInitialized]);

  // Context 값 조합
  const value: AuthContextValue = {
    // User 정보
    user: userAuth.user,
    isAuthenticated: userAuth.isAuthenticated,
    isInitialized: userAuth.isInitialized,
    refetchUser: userAuth.refetchUser,
    logout: userAuth.logout,
    isLoggingOut: userAuth.isLoggingOut,
    setAuthData: userAuth.setAuthData,

    // SpaceMember 정보
    currentSpaceMember: spaceMemberAuth.currentSpaceMember,
    isSpaceAuthenticated: spaceMemberAuth.isSpaceAuthenticated,
    refetchSpaceMember: spaceMemberAuth.refetchSpaceMember,

    // Space 관리
    currentSpaceSlug: spaceManager.currentSpaceSlug,
    currentSpace: spaceManager.currentSpace,
    availableSpaces: spaceManager.availableSpaces,
    isSwitchingSpace: spaceManager.isSwitchingSpace,
    switchSpace: spaceManager.switchSpace,
    logoutFromSpace: spaceManager.logoutFromSpace,
    setSpaceAuthData: spaceManager.setSpaceAuthData,
    updateCurrentSpace: spaceManager.updateCurrentSpace,

    // 로딩 및 에러 상태
    isLoading: userAuth.isLoading || spaceMemberAuth.isSpaceMemberLoading,
    error: userAuth.error || spaceMemberAuth.spaceMemberError,
    isError: userAuth.isError || !!spaceMemberAuth.spaceMemberError,
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

// 타입 재export (기존 코드 호환성)
export type { SpaceMemberInfo } from './auth/types';
