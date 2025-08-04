import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { QueryClient } from '@tanstack/react-query';
import { TokenManager, SpaceMemberTokenManager } from '../token';
import { determineTokenType, handleTokenRefresh, handleAuthFailure } from './tokenRefreshHandler';

export class AuthStateManager {
  private static instance: AuthStateManager;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {}

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  async handleAuthError(
    error: AxiosError,
    originalRequest: AxiosRequestConfig & { _retry?: boolean },
    queryClient: QueryClient | null
  ): Promise<any> {
    const status = error.response?.status;
    const url = originalRequest.url || '';

    // 인증 관련 에러 통합 처리
    const isAuthError = (
      status === 401 ||
      (status === 404 && this.isAuthEndpoint(url))
    );

    if (!isAuthError || originalRequest._retry) {
      throw error;
    }

    originalRequest._retry = true;
    const tokenType = this.determineTokenTypeFromError(error, url);

    if (this.isRefreshing) {
      // 이미 갱신 중이면 대기
      return this.waitForRefresh(originalRequest, tokenType);
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken(tokenType, queryClient);
      this.notifyRefreshSubscribers(newToken);
      return this.retryRequest(originalRequest, newToken, tokenType);
    } catch (refreshError) {
      this.handleRefreshFailure(tokenType, queryClient);
      throw refreshError;
    } finally {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/space-members/me',
      '/users/me',
      '/spaces/',
      '/posts',
      '/todos',
      '/comments',
      '/reactions'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private determineTokenTypeFromError(error: AxiosError<any>, url: string): 'user' | 'spaceMember' {
    // 에러 코드로 판단
    const errorCode = error.response?.data?.code;
    const errorDetails = error.response?.data?.details;

    if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'MISSING_AUTH_HEADER' ||
        errorCode === 'INVALID_AUTH_HEADER' || errorCode === 'UNAUTHORIZED') {
      // User 토큰 에러인지 SpaceMember 토큰 에러인지 추가 판단
      if (errorDetails?.error_code?.includes('SPACE_MEMBER')) {
        return 'spaceMember';
      }
      // URL로 추가 판단
      return determineTokenType(url);
    }

    if (errorDetails?.error_code === 'SPACE_MEMBER_TOKEN_EXPIRED' ||
        errorDetails?.error_code === 'SPACE_MEMBER_TOKEN_INVALID' ||
        errorDetails?.error_code === 'SPACE_MEMBER_NOT_FOUND') {
      return 'spaceMember';
    }

    // 기본적으로 URL로 판단
    return determineTokenType(url);
  }

  private async refreshToken(tokenType: 'user' | 'spaceMember', queryClient: QueryClient | null): Promise<string> {
    if (tokenType === 'user') {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      // handleTokenRefresh 함수 사용
      await handleTokenRefresh('user', {} as any, queryClient);
      return TokenManager.getAccessToken() || '';
    } else {
      const currentSpace = SpaceMemberTokenManager.getCurrentSpaceSlug();
      if (!currentSpace) {
        throw new Error('No current space');
      }
      const refreshToken = SpaceMemberTokenManager.getRefreshToken(currentSpace);
      if (!refreshToken) {
        throw new Error('No space member refresh token');
      }
      // handleTokenRefresh 함수 사용
      await handleTokenRefresh('spaceMember', {} as any, queryClient);
      return SpaceMemberTokenManager.getAccessToken(currentSpace) || '';
    }
  }

  private waitForRefresh(originalRequest: AxiosRequestConfig, tokenType: 'user' | 'spaceMember'): Promise<any> {
    return new Promise((resolve) => {
      this.refreshSubscribers.push((token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        resolve(axios(originalRequest));
      });
    });
  }

  private notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  private retryRequest(
    originalRequest: AxiosRequestConfig,
    token: string,
    tokenType: 'user' | 'spaceMember'
  ): Promise<any> {
    if (!originalRequest.headers) {
      originalRequest.headers = {};
    }
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return axios(originalRequest);
  }

  private handleRefreshFailure(tokenType: 'user' | 'spaceMember', queryClient: QueryClient | null) {
    if (tokenType === 'user') {
      TokenManager.clearTokens();
    } else {
      const currentSpace = SpaceMemberTokenManager.getCurrentSpaceSlug();
      if (currentSpace) {
        SpaceMemberTokenManager.clearToken(currentSpace);
      }
    }
    
    if (queryClient) {
      handleAuthFailure(queryClient);
    }
  }

  // 토큰 갱신 상태 확인
  get isTokenRefreshing(): boolean {
    return this.isRefreshing;
  }
}

// 싱글톤 인스턴스 내보내기
export const authStateManager = AuthStateManager.getInstance();