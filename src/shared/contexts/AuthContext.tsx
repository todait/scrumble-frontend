'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { useAutoRefreshSpaceMemberToken } from '@/shared/hooks/auth/useAutoRefreshSpaceMemberToken';
import { storageEventListener } from '@/shared/lib/token';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useUserAuth } from './auth/hooks/useUserAuth';
import { useSpaceManager } from './auth/hooks/useSpaceManager';
import { useSpaceMemberAuth } from './auth/hooks/useSpaceMemberAuth';
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

  // 자동 토큰 갱신 활성화
  useAutoRefreshToken();
  
  // SpaceMember 토큰 자동 갱신 활성화
  useAutoRefreshSpaceMemberToken({
    currentSpaceSlug: spaceManager.currentSpaceSlug,
    enabled: userAuth.isInitialized && !!spaceManager.currentSpaceSlug,
  });

  // 탭 간 로그아웃 동기화 및 인증 실패 처리
  useEffect(() => {
    // Storage 이벤트 리스너 시작
    storageEventListener.start();

    // 다른 탭에서 로그아웃 시 처리
    const unsubscribeStorage = storageEventListener.subscribe(() => {
      // 토큰이 없으면 로그인 페이지로 이동
      if (!storageEventListener.checkTokenStatus()) {
        router.replace(ROUTES.AUTH);
      }
    });

    // authenticationFailed 이벤트 리스너
    const handleAuthFailed = () => {
      router.replace(ROUTES.AUTH);
    };

    window.addEventListener('authenticationFailed', handleAuthFailed);

    // visibilitychange 이벤트로 탭 전환 시 토큰 상태 확인
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 토큰 상태 재확인
        if (!storageEventListener.checkTokenStatus() && !window.location.pathname.includes('/auth')) {
          router.replace(ROUTES.AUTH);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      unsubscribeStorage();
      window.removeEventListener('authenticationFailed', handleAuthFailed);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

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