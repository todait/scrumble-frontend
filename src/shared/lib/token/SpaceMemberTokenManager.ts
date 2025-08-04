import { jwtDecode } from 'jwt-decode';
import type { SpaceInfo } from '@/shared/contexts/auth/types';

interface SpaceMemberTokens {
  accessToken: string;
  refreshToken: string;
}

interface SpaceMemberTokenStorage {
  [spaceSlug: string]: SpaceMemberTokens;
}

interface JWTPayload {
  exp?: number;
  iat?: number;
  spaceMemberId?: string;
  spaceId?: string;
  spaceSlug?: string;
  role?: string;
}

export class SpaceMemberTokenManager {
  private static STORAGE_KEY = 'space_member_tokens';
  private static storage: 'localStorage' | 'sessionStorage' = 'localStorage';

  static setStorageType(type: 'localStorage' | 'sessionStorage') {
    this.storage = type;
  }

  private static getStorage() {
    return typeof window !== 'undefined' ? window[this.storage] : null;
  }

  static getTokens(): SpaceMemberTokenStorage {
    const storage = this.getStorage();
    if (!storage) return {};

    const data = storage.getItem(this.STORAGE_KEY);
    if (!data) return {};
    
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  static setToken(spaceSlug: string, tokens: SpaceMemberTokens) {
    const storage = this.getStorage();
    if (!storage) return;

    const allTokens = this.getTokens();
    allTokens[spaceSlug] = tokens;
    storage.setItem(this.STORAGE_KEY, JSON.stringify(allTokens));
  }

  static getToken(spaceSlug: string): SpaceMemberTokens | null {
    const tokens = this.getTokens();
    return tokens[spaceSlug] || null;
  }

  static clearToken(spaceSlug: string) {
    const storage = this.getStorage();
    if (!storage) return;

    const allTokens = this.getTokens();
    delete allTokens[spaceSlug];
    
    // 모든 토큰이 삭제된 경우 localStorage 항목을 완전히 제거
    if (Object.keys(allTokens).length === 0) {
      storage.removeItem(this.STORAGE_KEY);
    } else {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(allTokens));
    }
  }

  static clearAllTokens() {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.STORAGE_KEY);
    storage.removeItem(this.CURRENT_SPACE_KEY);
    storage.removeItem(this.CURRENT_SPACE_INFO_KEY);
  }

  static hasValidToken(spaceSlug: string): boolean {
    const tokens = this.getToken(spaceSlug);
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(tokens.accessToken);
      if (!decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static shouldRefreshToken(spaceSlug: string): boolean {
    const tokens = this.getToken(spaceSlug);
    if (!tokens) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(tokens.accessToken);
      if (!decoded.exp) return true; // exp가 없으면 갱신 필요

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      // 토큰 만료 5분 전에 갱신
      return timeUntilExpiry < 300;
    } catch {
      return true; // JWT 파싱 실패시 갱신 필요
    }
  }

  static getAccessToken(spaceSlug: string): string | null {
    const tokens = this.getToken(spaceSlug);
    return tokens?.accessToken || null;
  }

  static getRefreshToken(spaceSlug: string): string | null {
    const tokens = this.getToken(spaceSlug);
    return tokens?.refreshToken || null;
  }

  static isRefreshTokenValid(spaceSlug: string): boolean {
    const tokens = this.getToken(spaceSlug);
    if (!tokens || !tokens.refreshToken) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(tokens.refreshToken);
      if (!decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // 토큰에서 SpaceMember 정보 추출
  static getSpaceMemberInfo(spaceSlug: string): JWTPayload | null {
    const tokens = this.getToken(spaceSlug);
    if (!tokens) return null;

    try {
      return jwtDecode<JWTPayload>(tokens.accessToken);
    } catch {
      return null;
    }
  }

  // JWT 디코드 헬퍼 (토큰 정보 추출용)
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch {
      return null;
    }
  }

  // 현재 선택된 Space slug 관리
  private static CURRENT_SPACE_KEY = 'current_space_slug';
  private static CURRENT_SPACE_INFO_KEY = 'current_space_info';

  static setCurrentSpaceSlug(spaceSlug: string) {
    const storage = this.getStorage();
    if (!storage) return;

    storage.setItem(this.CURRENT_SPACE_KEY, spaceSlug);
  }

  static getCurrentSpaceSlug(): string | null {
    const storage = this.getStorage();
    if (!storage) return null;

    return storage.getItem(this.CURRENT_SPACE_KEY);
  }

  static clearCurrentSpaceSlug() {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.CURRENT_SPACE_KEY);
  }

  // 현재 선택된 Space 정보 관리
  static setCurrentSpace(space: SpaceInfo) {
    const storage = this.getStorage();
    if (!storage) return;

    storage.setItem(this.CURRENT_SPACE_INFO_KEY, JSON.stringify(space));
  }

  static getCurrentSpace(): SpaceInfo | null {
    const storage = this.getStorage();
    if (!storage) return null;

    const data = storage.getItem(this.CURRENT_SPACE_INFO_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static clearCurrentSpace() {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.CURRENT_SPACE_INFO_KEY);
  }
}