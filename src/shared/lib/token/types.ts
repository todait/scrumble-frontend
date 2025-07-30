export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ITokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ITokenManager<T extends TokenPair = TokenPair> {
  // 토큰 저장/조회
  setTokens(tokens: T): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  clearTokens(): void;
  
  // 토큰 유효성 검사
  isAccessTokenValid(): boolean;
  isRefreshTokenValid(): boolean;
  shouldRefreshToken(): boolean;
  getAccessTokenTimeLeft(): number;
  
  // JWT 디코드
  decodeToken(token: string): DecodedToken | null;
}

export interface ISpaceTokenManager {
  // Space별 토큰 관리
  setToken(spaceSlug: string, tokens: TokenPair): void;
  getToken(spaceSlug: string): TokenPair | null;
  clearToken(spaceSlug: string): void;
  clearAllTokens(): void;
  
  // Space별 토큰 조회
  getAccessToken(spaceSlug: string): string | null;
  getRefreshToken(spaceSlug: string): string | null;
  
  // Space별 유효성 검사
  hasValidToken(spaceSlug: string): boolean;
  shouldRefreshToken(spaceSlug: string): boolean;
  
  // 현재 Space 관리
  getCurrentSpace(): string | null;
  setCurrentSpace(spaceSlug: string): void;
  clearCurrentSpace(): void;
  
  // JWT 디코드
  decodeToken(token: string): DecodedToken | null;
}

export interface TokenRefreshOptions {
  tokenType: 'user' | 'spaceMember';
  spaceSlug?: string;
  onRefreshSuccess?: (tokens: TokenPair) => void;
  onRefreshError?: (error: Error) => void;
}

export interface AutoRefreshOptions {
  enabled?: boolean;
  refreshBeforeExpiry?: number; // 만료 전 갱신 시간 (초)
  onVisibilityChange?: boolean;
  onFocus?: boolean;
}