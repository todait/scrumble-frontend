'use client';

import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { useAutoRefreshSpaceMemberToken } from '@/shared/hooks/auth/useAutoRefreshSpaceMemberToken';
import { createContext, ReactNode, useContext } from 'react';
import { useUserAuth } from './auth/hooks/useUserAuth';
import { useSpaceManager } from './auth/hooks/useSpaceManager';
import { useSpaceMemberAuth } from './auth/hooks/useSpaceMemberAuth';
import type { AuthContextValue } from './auth/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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