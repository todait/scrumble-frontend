import type { User } from '@/shared/types/auth';
import type { SpaceMemberInfo } from '../types';

const STORAGE_KEYS = {
  USER: 'user',
  AVAILABLE_SPACES: 'available_spaces',
} as const;

/**
 * 인증 관련 데이터를 localStorage에 저장/조회하는 서비스
 */
export class AuthPersistenceService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // User 관련
  static saveUser(user: User): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser(): User | null {
    if (!this.isClient()) return null;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  static clearUser(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Available Spaces 관련
  static saveAvailableSpaces(spaces: SpaceMemberInfo[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_SPACES, JSON.stringify(spaces));
  }

  static getAvailableSpaces(): SpaceMemberInfo[] {
    if (!this.isClient()) return [];
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AVAILABLE_SPACES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static clearAvailableSpaces(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.AVAILABLE_SPACES);
  }

  // Space 정보 업데이트 유틸리티
  static updateSpaceInfo(
    spaceSlug: string,
    spaceInfo: SpaceMemberInfo,
    currentSpaces: SpaceMemberInfo[]
  ): SpaceMemberInfo[] {
    const updatedSpaces = [...currentSpaces];
    const existingIndex = updatedSpaces.findIndex(s => s.spaceSlug === spaceSlug);

    if (existingIndex >= 0) {
      updatedSpaces[existingIndex] = spaceInfo;
    } else {
      updatedSpaces.push(spaceInfo);
    }

    this.saveAvailableSpaces(updatedSpaces);
    return updatedSpaces;
  }

  // Space 제거 유틸리티
  static removeSpace(
    spaceSlug: string,
    currentSpaces: SpaceMemberInfo[]
  ): SpaceMemberInfo[] {
    const updatedSpaces = currentSpaces.filter(s => s.spaceSlug !== spaceSlug);
    this.saveAvailableSpaces(updatedSpaces);
    return updatedSpaces;
  }

  // 모든 인증 데이터 초기화
  static clearAll(): void {
    this.clearUser();
    this.clearAvailableSpaces();
  }
}