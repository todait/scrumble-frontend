import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { getUserTimezone } from '../utils/timezone';
import { TokenManager, SpaceMemberTokenManager } from './token';
import { determineTokenType, handleTokenRefresh, handleAuthFailure } from './api/tokenRefreshHandler';

// API 기본 URL 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// QueryClient 인스턴스를 외부에서 설정할 수 있도록
let queryClientInstance: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClientInstance = client;
}

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

// 응답 인터셉터: 토큰 만료 시 자동 갱신
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

      try {
        return await handleTokenRefresh(tokenType, originalRequest, queryClientInstance);
      } catch (error) {
        if (error && typeof error === 'object' && 'type' in error && (error as any).type === 'AUTH_FAILURE') {
          handleAuthFailure(queryClientInstance);
          const authError = error as { type: string; error?: unknown };
          return Promise.reject(authError.error || error);
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
