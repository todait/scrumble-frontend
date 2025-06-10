import { ApiResponse, User, LoginResponse } from '@/shared/types';

/**
 * 인증 관련 API 서비스
 * 실제 백엔드 API와 연동할 때 사용
 */
export class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  /**
   * Google OAuth 로그인 처리
   * @param code - Google OAuth 인증 코드
   * @returns 사용자 정보와 토큰
   */
  async loginWithGoogle(code: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 토큰 갱신
   * @param refreshToken - 리프레시 토큰
   * @returns 새로운 토큰 쌍
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 로그아웃
   * @param accessToken - 액세스 토큰
   */
  async logout(accessToken: string): Promise<ApiResponse<void>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 현재 사용자 정보 조회
   * @param accessToken - 액세스 토큰
   * @returns 사용자 정보
   */
  async getCurrentUser(accessToken: string): Promise<ApiResponse<User>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get user info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const authService = new AuthService();