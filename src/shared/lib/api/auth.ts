/**
 * 인증 관련 API 함수들
 * Google OAuth, 토큰 갱신, 사용자 정보 조회 등
 */

import type {
  ApiUser,
  GetUserWithLatestSpaceApiResponse,
  RefreshTokenApiResponse,
  TokenPair,
} from '@/shared/types/api';
import type { User, UserWithLatestSpace } from '@/shared/types/user';
import { API_BASE_URL, apiClient, refreshApiClient } from '../api';

/**
 * 인증 관련 API 함수들
 */
export const authApi = {
  /**
   * Google OAuth 로그인 시작
   * 사용자를 Google OAuth 페이지로 리다이렉트
   */
  startGoogleOAuth: (): void => {
    const oauthUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = oauthUrl;
  },

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   * @param refreshToken 갱신용 리프레시 토큰
   * @returns 새로운 토큰 쌍
   */
  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const { data } = await refreshApiClient.post<RefreshTokenApiResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  },

  /**
   * 로그아웃
   * 서버에서 세션 무효화
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * 현재 사용자 정보 조회
   * @returns 현재 로그인된 사용자 정보
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiUser>('/api/v1/users/me');
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarURL: data.avatar_url,
    };
  },

  /**
   * 최신 스페이스 정보가 포함된 현재 사용자 정보 조회
   * 로그인 후 적절한 페이지로 리다이렉트하기 위해 사용
   * @returns 최신 스페이스 정보가 포함된 사용자 정보
   */
  getCurrentUserWithLatestSpace: async (): Promise<
    UserWithLatestSpace & { centrifugoToken?: string }
  > => {
    const { data } = await apiClient.get<GetUserWithLatestSpaceApiResponse>(
      '/api/v1/users/me/latest-space'
    );

    // 백엔드 응답을 프론트엔드 타입으로 수동 변환
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarURL: data.avatar_url,
      latestSpaceSlug: data.latest_space_slug,
      latestSpaceName: data.latest_space_name,
      centrifugoToken: data.centrifugo_token,
    };
  },

  /**
   * 토큰 유효성 검증
   * 현재 액세스 토큰이 유효한지 확인
   * @returns 토큰 유효 여부
   */
  validateToken: async (): Promise<boolean> => {
    try {
      await authApi.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};
