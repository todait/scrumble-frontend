import { TokenPair } from '../types/api';

export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';
  private static ACCESS_TOKEN_EXPIRY_KEY = 'accessTokenExpiry';
  private static REFRESH_TOKEN_EXPIRY_KEY = 'refreshTokenExpiry';

  // 토큰 저장 (만료 시간 포함)
  static setTokens(data: TokenPair): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);

    // 토큰 만료 시간 저장 (서버에서 받거나 디코드)

    const accessTokenPayload = this.decodeToken(data.accessToken);
    if (accessTokenPayload?.exp) {
      localStorage.setItem(this.ACCESS_TOKEN_EXPIRY_KEY, accessTokenPayload.exp.toString());
    }

    // JWT에서 exp 추출
    const refreshTokenPayload = this.decodeToken(data.refreshToken);
    if (refreshTokenPayload?.exp) {
      localStorage.setItem(this.REFRESH_TOKEN_EXPIRY_KEY, refreshTokenPayload.exp.toString());
    }
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 액세스 토큰 만료까지 남은 시간 (밀리초)
  static getAccessTokenTimeLeft(): number {
    if (typeof window === 'undefined') return 0;

    const expiry = localStorage.getItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;

    const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
    const now = Date.now();
    return Math.max(0, expiryTime - now);
  }

  // 리프레시 토큰이 유효한지 확인
  static isRefreshTokenValid(): boolean {
    if (typeof window === 'undefined') return false;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const expiry = localStorage.getItem(this.REFRESH_TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return true; // 만료 시간이 없으면 유효하다고 가정
    }

    const expiryTime = parseInt(expiry) * 1000;
    const now = Date.now();
    const isValid = now < expiryTime;

    return isValid;
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_EXPIRY_KEY);
  }

  // JWT 디코드 헬퍼 (만료 시간 추출용)
  static decodeToken(token: string): { exp?: number; iat?: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded;
    } catch (error) {
      console.error('❌ Token decode error:', error);
      return null;
    }
  }

  // 기존 tokenStorage 호환성을 위한 래퍼 메서드들
  static setTokensLegacy(accessToken: string, refreshToken: string): void {
    this.setTokens({ accessToken, refreshToken });
  }
}

// 기존 코드 호환성을 위한 export
export const tokenStorage = {
  getAccessToken: () => TokenManager.getAccessToken(),
  getRefreshToken: () => TokenManager.getRefreshToken(),
  setTokens: (accessToken: string, refreshToken: string) =>
    TokenManager.setTokensLegacy(accessToken, refreshToken),
  clearTokens: () => TokenManager.clearTokens(),
};
