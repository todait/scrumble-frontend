import { QueryClient } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { TokenManager, SpaceMemberTokenManager } from '../token';
import { TokenPair } from '../token/types';
import { apiClient } from '../api';

interface RefreshState {
  isRefreshing: boolean;
  subscribers: ((token: string) => void)[];
}

// 토큰 타입별 갱신 상태 관리
const refreshStates: Record<string, RefreshState> = {
  user: { isRefreshing: false, subscribers: [] },
  spaceMember: { isRefreshing: false, subscribers: [] },
};

// 대기 중인 요청들 처리
const onTokenRefreshed = (token: string, refreshState: RefreshState) => {
  refreshState.subscribers.forEach(callback => callback(token));
  refreshState.subscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void, refreshState: RefreshState) => {
  refreshState.subscribers.push(callback);
};

// 토큰 갱신 처리 함수
export async function handleTokenRefresh(
  tokenType: 'user' | 'spaceMember',
  originalRequest: AxiosRequestConfig,
  queryClientInstance: QueryClient | null
): Promise<any> {
  const refreshState = refreshStates[tokenType];

  if (!refreshState.isRefreshing) {
    refreshState.isRefreshing = true;

    try {
      let newTokens: TokenPair;
      let accessToken: string;

      if (tokenType === 'user') {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken || !TokenManager.isRefreshTokenValid()) {
          throw new Error('Refresh token expired');
        }

        // 동적 import (순환 참조 방지)
        const { authApi } = await import('./auth');
        newTokens = await authApi.refreshToken(refreshToken);
        
        // 토큰 저장
        TokenManager.setTokens(newTokens);
        accessToken = newTokens.accessToken;

        // React Query 캐시 무효화
        if (queryClientInstance) {
          queryClientInstance.invalidateQueries({ queryKey: ['auth'] });
          window.dispatchEvent(new CustomEvent('userTokenRefreshed'));
        }
      } else {
        const currentSpace = SpaceMemberTokenManager.getCurrentSpace();
        if (!currentSpace) {
          throw new Error('No current space');
        }

        const refreshToken = SpaceMemberTokenManager.getRefreshToken(currentSpace);
        if (!refreshToken) {
          throw new Error('No space member refresh token');
        }

        // 동적 import (순환 참조 방지)
        const { authApi } = await import('./auth');
        newTokens = await authApi.refreshSpaceMemberToken(refreshToken);
        
        // 토큰 저장
        SpaceMemberTokenManager.setToken(currentSpace, newTokens);
        accessToken = newTokens.accessToken;

        // React Query 캐시 무효화
        if (queryClientInstance) {
          queryClientInstance.invalidateQueries({
            queryKey: ['space', currentSpace],
          });
          window.dispatchEvent(new CustomEvent('spaceMemberTokenRefreshed'));
        }
      }

      // 대기 중인 요청들 처리
      onTokenRefreshed(accessToken, refreshState);

      // 원래 요청 재시도
      originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (error) {
      if (tokenType === 'user') {
        // User 토큰 갱신 실패 - 완전히 로그아웃
        throw { type: 'AUTH_FAILURE', error };
      } else {
        // SpaceMember 토큰 갱신 실패
        const currentSpace = SpaceMemberTokenManager.getCurrentSpace();
        if (currentSpace) {
          SpaceMemberTokenManager.clearToken(currentSpace);
        }
        window.dispatchEvent(new CustomEvent('spaceMemberTokenExpired'));
        throw error;
      }
    } finally {
      refreshState.isRefreshing = false;
    }
  }

  // 갱신 중이면 대기
  return new Promise(resolve => {
    addRefreshSubscriber((token: string) => {
      originalRequest.headers!.Authorization = `Bearer ${token}`;
      resolve(apiClient(originalRequest));
    }, refreshState);
  });
}

// API 경로에 따른 토큰 타입 결정
export function determineTokenType(url: string): 'user' | 'spaceMember' {
  // Auth 관련 엔드포인트 (토큰 타입 구분 필요)
  if (url.includes('/auth/space-member/refresh') || url.includes('/auth/space-member/logout')) {
    return 'spaceMember';
  }
  
  // User 토큰을 사용하는 경로들
  const userTokenPaths = [
    '/api/v1/users',
    '/api/v1/spaces',
    '/auth/refresh',
    '/auth/logout',
    '/auth/spaces/'
  ];

  // User 관련 API나 Space 관리 API는 User 토큰 사용
  const isUserTokenPath = userTokenPaths.some(path => url.includes(path));
  
  return isUserTokenPath ? 'user' : 'spaceMember';
}

// 인증 실패 처리 함수
export function handleAuthFailure(queryClientInstance: QueryClient | null): void {
  TokenManager.clearTokens();
  SpaceMemberTokenManager.clearAllTokens();

  if (queryClientInstance) {
    queryClientInstance.cancelQueries();
    queryClientInstance.clear();
    queryClientInstance.removeQueries();
  }

  window.dispatchEvent(new CustomEvent('authenticationFailed'));

  if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
    window.location.replace('/auth');
  }
}