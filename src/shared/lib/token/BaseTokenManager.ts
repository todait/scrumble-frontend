import { DecodedToken, ITokenManager, ITokenStorage, TokenPair } from './types';
import { LocalStorageAdapter } from './StorageAdapter';

export abstract class BaseTokenManager<T extends TokenPair = TokenPair> implements ITokenManager<T> {
  protected storage: ITokenStorage;
  
  constructor(storage?: ITokenStorage) {
    this.storage = storage || new LocalStorageAdapter();
  }

  abstract setTokens(tokens: T): void;
  abstract getAccessToken(): string | null;
  abstract getRefreshToken(): string | null;
  abstract clearTokens(): void;

  // JWT 디코드 헬퍼 (공통 구현)
  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token decode error:', error);
      }
      return null;
    }
  }

  // 토큰 유효성 검사 (공통 구현)
  isTokenValid(token: string | null): boolean {
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  }

  // 액세스 토큰 유효성 검사
  isAccessTokenValid(): boolean {
    return this.isTokenValid(this.getAccessToken());
  }

  // 리프레시 토큰 유효성 검사
  isRefreshTokenValid(): boolean {
    return this.isTokenValid(this.getRefreshToken());
  }

  // 토큰 갱신 필요 여부 (기본값: 5분 전)
  shouldRefreshToken(bufferTime: number = 300): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    const decoded = this.decodeToken(accessToken);
    if (!decoded?.exp) return true;

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;

    return timeUntilExpiry < bufferTime;
  }

  // 액세스 토큰 만료까지 남은 시간 (밀리초)
  getAccessTokenTimeLeft(): number {
    const accessToken = this.getAccessToken();
    if (!accessToken) return 0;

    const decoded = this.decodeToken(accessToken);
    if (!decoded?.exp) return 0;

    const expiryTime = decoded.exp * 1000; // 밀리초로 변환
    const now = Date.now();
    return Math.max(0, expiryTime - now);
  }

  // 토큰에서 정보 추출
  getTokenPayload(token: string | null): DecodedToken | null {
    if (!token) return null;
    return this.decodeToken(token);
  }
}