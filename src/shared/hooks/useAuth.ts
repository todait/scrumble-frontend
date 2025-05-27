'use client';

import { useState, useEffect, useCallback } from 'react';
import { tokenStorage, getCurrentUser, logout as apiLogout } from '../lib/api';
import { AuthState, User } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    tokens: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
  const checkAuthStatus = useCallback(async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      
      if (accessToken && refreshToken) {
        // 토큰이 있으면 사용자 정보 조회
        try {
          const user = await getCurrentUser();
          setAuthState({
            isAuthenticated: true,
            user,
            tokens: { accessToken, refreshToken },
          });
        } catch (error) {
          // 토큰이 유효하지 않으면 제거
          console.error('Token validation failed:', error);
          tokenStorage.clearTokens();
          setAuthState({
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
        }
      } else {
        // 로컬 스토리지에서 사용자 정보 확인
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const user: User = JSON.parse(savedUser);
            // 토큰 없이 사용자 정보만 있는 경우 (OAuth 콜백에서 설정된 경우)
            setAuthState({
              isAuthenticated: true,
              user,
              tokens: null,
            });
          } catch (error) {
            // 파싱 실패 시 로컬 데이터 제거
            localStorage.removeItem('user');
            setAuthState({
              isAuthenticated: false,
              user: null,
              tokens: null,
            });
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        tokens: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 로컬 상태 초기화
      tokenStorage.clearTokens();
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        tokens: null,
      });
    }
  }, []);

  // 로그인 성공 시 상태 업데이트
  const updateAuthState = useCallback((user: User, tokens?: { accessToken: string; refreshToken: string }) => {
    setAuthState({
      isAuthenticated: true,
      user,
      tokens: tokens || null,
    });
    
    if (tokens) {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    }
    
    // 사용자 정보를 로컬 스토리지에 저장
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    isLoading,
    logout,
    updateAuthState,
    checkAuthStatus,
  };
}; 