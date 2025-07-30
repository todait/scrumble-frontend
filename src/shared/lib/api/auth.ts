/**
 * 인증 관련 API 함수들
 * Google OAuth, 토큰 갱신, 사용자 정보 조회 등
 */

import { Member, MemberRole, MemberStatus } from '@/shared/types';
import type {
  ApiUser,
  GetCurrentSpaceMemberApiResponse,
  RefreshTokenApiResponse,
  TokenPair,
} from '@/shared/types/api';
import type { User } from '@/shared/types/user';
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
    };
  },

  /**
   * 토큰 유효성 검증
   * 현재 액세스 토큰이 유효한지 확인
   * @returns 토큰 유효 여부
   */
  validateAccessToken: async (): Promise<boolean> => {
    try {
      await authApi.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },

  // ===== SpaceMember 관련 API =====

  /**
   * Space 로그인
   * 특정 Space에 로그인하여 SpaceMember 토큰 발급
   * @param spaceSlug Space 식별자
   * @param password Space 비밀번호 (optional)
   * @returns SpaceMember 토큰 정보
   */
  loginToSpace: async (
    spaceSlug: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    spaceMemberId: string;
    spaceSlug: string;
    role: string;
    centrifugoToken?: string;
  }> => {
    const { data } = await apiClient.post(`/auth/spaces/${spaceSlug}/login`, {
      password,
    });

    // 응답 형식: { space_member_id, space_slug, role, centrifugo_token, tokens: { access_token, refresh_token } }
    return {
      accessToken: data.tokens.access_token,
      refreshToken: data.tokens.refresh_token,
      spaceMemberId: data.space_member_id,
      spaceSlug: data.space_slug,
      role: data.role,
      centrifugoToken: data.centrifugo_token,
    };
  },

  /**
   * SpaceMember 토큰 갱신
   * SpaceMember refresh token으로 access token 갱신
   * @param refreshToken SpaceMember refresh token
   * @returns 새로운 토큰 쌍
   */
  refreshSpaceMemberToken: async (refreshToken: string): Promise<TokenPair> => {
    const { data } = await refreshApiClient.post<RefreshTokenApiResponse>(
      '/auth/space-member/refresh',
      {
        refresh_token: refreshToken,
      }
    );

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  },

  /**
   * SpaceMember 로그아웃
   * 현재 Space에서 로그아웃
   */
  logoutFromSpace: async (): Promise<void> => {
    await apiClient.post('/auth/space-member/logout');
  },

  /**
   * 현재 SpaceMember 정보 조회
   * @returns 현재 로그인된 SpaceMember 정보
   */
  getCurrentSpaceMember: async (): Promise<Member> => {
    const { data } = await apiClient.get<GetCurrentSpaceMemberApiResponse>(
      '/api/v1/space-members/me'
    );

    return {
      id: data.id,
      spaceId: data.space_id,
      name: data.name,
      avatarURL: data.avatar_url,
      role: data.role as MemberRole,
      spaceSlug: data.space_slug,
      spaceName: data.space_name,
      centrifugoToken: data.centrifugo_token,
      joinedAt: data.joined_at,
      status: data.status as MemberStatus,
    };
  },

  validateSpaceMemberAccessToken: async (): Promise<boolean> => {
    try {
      await authApi.getCurrentSpaceMember();
      return true;
    } catch {
      return false;
    }
  },
};
