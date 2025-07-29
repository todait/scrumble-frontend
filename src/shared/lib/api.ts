import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getUserTimezone } from '../utils/timezone';
import { TokenManager, SpaceMemberTokenManager } from './token';

// API 기본 URL 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// QueryClient 인스턴스를 외부에서 설정할 수 있도록
let queryClientInstance: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClientInstance = client;
}

// 토큰 타입별 갱신 상태 관리
interface RefreshState {
  isRefreshing: boolean;
  subscribers: ((token: string) => void)[];
}

const userTokenRefreshState: RefreshState = {
  isRefreshing: false,
  subscribers: [],
};

const spaceMemberTokenRefreshState: RefreshState = {
  isRefreshing: false,
  subscribers: [],
};

// API 경로에 따른 토큰 타입 결정
function determineTokenType(url: string): 'user' | 'spaceMember' {
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

// 대기 중인 요청들 처리
const onTokenRefreshed = (token: string, refreshState: RefreshState) => {
  refreshState.subscribers.forEach(callback => callback(token));
  refreshState.subscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void, refreshState: RefreshState) => {
  refreshState.subscribers.push(callback);
};

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 포함
});

export const refreshApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 요청 인터셉터: 토큰 및 타임존 헤더 자동 추가
apiClient.interceptors.request.use(
  config => {
    const tokenType = determineTokenType(config.url || '');

    if (tokenType === 'user') {
      // User 토큰 사용
      const userToken = TokenManager.getAccessToken();
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    } else {
      // SpaceMember 토큰 사용
      const currentSpace = SpaceMemberTokenManager.getCurrentSpace();
      if (currentSpace) {
        const spaceMemberToken = SpaceMemberTokenManager.getAccessToken(currentSpace);
        if (spaceMemberToken) {
          config.headers.Authorization = `Bearer ${spaceMemberToken}`;
        }
      }
    }

    // 타임존 헤더 추가
    config.headers['X-Timezone'] = getUserTimezone();

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 갱신 (대기열 방식)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 에러 코드로 토큰 타입 확인
      const errorCode = error.response.data?.code;
      const isUserTokenError = errorCode === 'TOKEN_EXPIRED' || errorCode === 'MISSING_AUTH_HEADER' || errorCode === 'INVALID_AUTH_HEADER';
      const isSpaceMemberTokenError = errorCode === 'SPACE_MEMBER_EXPIRED' || errorCode === 'SPACE_MEMBER_NOT_FOUND';

      // 명시적인 에러 코드가 없으면 URL로 판단
      const tokenType = isUserTokenError
        ? 'user'
        : isSpaceMemberTokenError
          ? 'spaceMember'
          : determineTokenType(originalRequest.url || '');

      if (tokenType === 'user') {
        // 사용자 토큰 갱신 처리
        if (!userTokenRefreshState.isRefreshing) {
          userTokenRefreshState.isRefreshing = true;

          try {
            const refreshToken = TokenManager.getRefreshToken();

            if (!refreshToken || !TokenManager.isRefreshTokenValid()) {
              throw new Error('Refresh token expired');
            }

            // authApi를 동적 import로 사용 (순환 참조 방지)
            const { authApi } = await import('./api/auth');
            const tokenData = await authApi.refreshToken(refreshToken);

            // 새 토큰 저장
            TokenManager.setTokens(tokenData);

            // 대기 중인 요청들 처리
            onTokenRefreshed(tokenData.accessToken, userTokenRefreshState);

            // React Query 캐시 무효화
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries({ queryKey: ['auth'] });
              window.dispatchEvent(new CustomEvent('userTokenRefreshed'));
            }

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // User 토큰 갱신 실패 - 완전히 로그아웃
            handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            userTokenRefreshState.isRefreshing = false;
          }
        }

        // 갱신 중이면 대기
        return new Promise(resolve => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          }, userTokenRefreshState);
        });
      } else {
        // SpaceMember 토큰 갱신 처리
        if (!spaceMemberTokenRefreshState.isRefreshing) {
          spaceMemberTokenRefreshState.isRefreshing = true;

          try {
            const currentSpace = SpaceMemberTokenManager.getCurrentSpace();
            if (!currentSpace) {
              throw new Error('No current space');
            }

            const refreshToken = SpaceMemberTokenManager.getRefreshToken(currentSpace);
            if (!refreshToken) {
              throw new Error('No space member refresh token');
            }

            // authApi를 동적 import로 사용 (순환 참조 방지)
            const { authApi } = await import('./api/auth');
            const response = await authApi.refreshSpaceMemberToken(refreshToken);

            // 새 토큰 저장
            SpaceMemberTokenManager.setToken(currentSpace, {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            });

            // 대기 중인 요청들 처리
            onTokenRefreshed(response.accessToken, spaceMemberTokenRefreshState);

            // React Query 캐시 무효화
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries({
                queryKey: ['space', currentSpace],
              });
              window.dispatchEvent(new CustomEvent('spaceMemberTokenRefreshed'));
            }

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // SpaceMember 토큰 갱신 실패
            const currentSpace = SpaceMemberTokenManager.getCurrentSpace();
            if (currentSpace) {
              SpaceMemberTokenManager.clearToken(currentSpace);
            }
            window.dispatchEvent(new CustomEvent('spaceMemberTokenExpired'));
            return Promise.reject(refreshError);
          } finally {
            spaceMemberTokenRefreshState.isRefreshing = false;
          }
        }

        // 갱신 중이면 대기
        return new Promise(resolve => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          }, spaceMemberTokenRefreshState);
        });
      }
    }

    return Promise.reject(error);
  }
);

// 인증 실패 처리 함수
function handleAuthFailure(): void {
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
