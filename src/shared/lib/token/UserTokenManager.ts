import { BaseTokenManager } from './BaseTokenManager';
import { ITokenStorage, TokenPair } from './types';

export class UserTokenManager extends BaseTokenManager<TokenPair> {
  private static instance: UserTokenManager;
  
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly ACCESS_TOKEN_EXPIRY_KEY = 'accessTokenExpiry';
  private readonly REFRESH_TOKEN_EXPIRY_KEY = 'refreshTokenExpiry';

  private constructor(storage?: ITokenStorage) {
    super(storage);
  }

  static getInstance(storage?: ITokenStorage): UserTokenManager {
    if (!UserTokenManager.instance) {
      UserTokenManager.instance = new UserTokenManager(storage);
    }
    return UserTokenManager.instance;
  }

  setTokens(data: TokenPair): void {
    this.storage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
    this.storage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);

    // 토큰 만료 시간 저장
    const accessTokenPayload = this.decodeToken(data.accessToken);
    if (accessTokenPayload?.exp) {
      this.storage.setItem(this.ACCESS_TOKEN_EXPIRY_KEY, accessTokenPayload.exp.toString());
    }

    const refreshTokenPayload = this.decodeToken(data.refreshToken);
    if (refreshTokenPayload?.exp) {
      this.storage.setItem(this.REFRESH_TOKEN_EXPIRY_KEY, refreshTokenPayload.exp.toString());
    }
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.storage.removeItem(this.ACCESS_TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.storage.removeItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_EXPIRY_KEY);
  }

  // 추가 메서드: 리프레시 토큰 유효성 검사 (저장된 만료 시간 사용)
  isRefreshTokenValid(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const expiry = this.storage.getItem(this.REFRESH_TOKEN_EXPIRY_KEY);
    if (!expiry) {
      // 만료 시간이 없으면 토큰을 디코드해서 확인
      return super.isRefreshTokenValid();
    }

    const expiryTime = parseInt(expiry) * 1000;
    const now = Date.now();
    return now < expiryTime;
  }

  // 기존 코드 호환성을 위한 정적 메서드들
  static setTokens(data: TokenPair): void {
    UserTokenManager.getInstance().setTokens(data);
  }

  static getAccessToken(): string | null {
    return UserTokenManager.getInstance().getAccessToken();
  }

  static getRefreshToken(): string | null {
    return UserTokenManager.getInstance().getRefreshToken();
  }

  static clearTokens(): void {
    UserTokenManager.getInstance().clearTokens();
  }

  static isRefreshTokenValid(): boolean {
    return UserTokenManager.getInstance().isRefreshTokenValid();
  }

  static getAccessTokenTimeLeft(): number {
    return UserTokenManager.getInstance().getAccessTokenTimeLeft();
  }

  static decodeToken(token: string): { exp?: number; iat?: number } | null {
    return UserTokenManager.getInstance().decodeToken(token);
  }

  // 기존 레거시 메서드 (호환성 유지)
  static setTokensLegacy(accessToken: string, refreshToken: string): void {
    UserTokenManager.setTokens({ accessToken, refreshToken });
  }

  // 토큰 존재 여부 확인
  static hasValidToken(): boolean {
    const accessToken = UserTokenManager.getAccessToken();
    const refreshToken = UserTokenManager.getRefreshToken();
    return !!(accessToken || refreshToken);
  }
}