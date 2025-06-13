import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { TokenManager } from './token';
import { getUserTimezone } from '../utils/timezone';

// API 기본 URL 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// QueryClient 인스턴스를 외부에서 설정할 수 있도록
let queryClientInstance: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClientInstance = client;
}

// 토큰 갱신 상태 관리 (대기열 방식)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 대기 중인 요청들 처리
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 포함
});

// 요청 인터셉터: 토큰 및 타임존 헤더 자동 추가
apiClient.interceptors.request.use(
  config => {
    // 인증 토큰 추가
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

      if (!isRefreshing) {
        isRefreshing = true;

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

          // React Query 캐시 무효화
          if (queryClientInstance) {
            queryClientInstance.invalidateQueries({ queryKey: ['auth'] });
            window.dispatchEvent(new CustomEvent('tokenRefreshed'));
          }

          // 대기 중인 모든 요청에 새 토큰 전달
          onTokenRefreshed(tokenData.accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 - 로그아웃 처리
          console.error('❌ Token refresh failed:', refreshError);
          TokenManager.clearTokens();

          if (queryClientInstance) {
            queryClientInstance.clear();
          }

          window.dispatchEvent(new CustomEvent('tokenCleared'));

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 토큰 갱신 중이면 대기열에 추가
      return new Promise(resolve => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
