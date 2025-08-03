import type { 
  AutosaveData, 
  AutosaveKey, 
  AutosaveMetadata
} from './AutosaveTypes';

// 현재 스키마 버전
const CURRENT_VERSION = '1.0.0';

// 메타데이터 저장 키
const METADATA_KEY = 'scrumble:autosave:metadata';

export class AutosaveService {
  private static instance: AutosaveService;

  private constructor() {}

  static getInstance(): AutosaveService {
    if (!AutosaveService.instance) {
      AutosaveService.instance = new AutosaveService();
    }
    return AutosaveService.instance;
  }

  /**
   * 데이터 저장
   */
  save<T>(key: AutosaveKey, data: T, expirationMinutes: number = 60): void {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const expiresAt = now + (expirationMinutes * 60 * 1000);

      // 데이터 저장
      const autosaveData: AutosaveData<T> = {
        data,
        timestamp: now,
        version: CURRENT_VERSION,
      };

      localStorage.setItem(key, JSON.stringify(autosaveData));

      // 메타데이터 업데이트
      this.updateMetadata(key, now, expiresAt);
    } catch (error) {
      console.error('Autosave error:', error);
      // localStorage가 가득 찼을 경우 오래된 데이터 정리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanupExpiredData();
        // 재시도
        try {
          const autosaveData: AutosaveData<T> = {
            data,
            timestamp: Date.now(),
            version: CURRENT_VERSION,
          };
          localStorage.setItem(key, JSON.stringify(autosaveData));
        } catch (retryError) {
          console.error('Autosave retry failed:', retryError);
        }
      }
    }
  }

  /**
   * 데이터 복원
   */
  restore<T>(key: AutosaveKey): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const autosaveData: AutosaveData<T> = JSON.parse(item);

      // 버전 체크
      if (!this.isVersionCompatible(autosaveData.version)) {
        this.remove(key);
        return null;
      }

      // 만료 체크
      if (this.isExpired(key)) {
        this.remove(key);
        return null;
      }

      return autosaveData.data;
    } catch (error) {
      console.error('Autosave restore error:', error);
      this.remove(key);
      return null;
    }
  }

  /**
   * 데이터 삭제
   */
  remove(key: AutosaveKey): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(key);
    this.removeFromMetadata(key);
  }

  /**
   * 특정 스페이스의 모든 자동 저장 데이터 삭제
   */
  removeBySpace(spaceSlug: string): void {
    if (typeof window === 'undefined') return;

    const metadata = this.getMetadata();
    const keysToRemove = metadata
      .filter(meta => meta.spaceSlug === spaceSlug)
      .map(meta => meta.key);

    keysToRemove.forEach(key => this.remove(key));
  }

  /**
   * 특정 타입의 모든 자동 저장 데이터 삭제
   */
  removeByType(type: 'checkin' | 'checkout'): void {
    if (typeof window === 'undefined') return;

    const metadata = this.getMetadata();
    const keysToRemove = metadata
      .filter(meta => meta.type === type)
      .map(meta => meta.key);

    keysToRemove.forEach(key => this.remove(key));
  }

  /**
   * 만료된 데이터 정리
   */
  cleanupExpiredData(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const metadata = this.getMetadata();
    const expiredKeys = metadata
      .filter(meta => meta.expiresAt < now)
      .map(meta => meta.key);

    expiredKeys.forEach(key => this.remove(key));
  }

  /**
   * 모든 자동 저장 데이터 삭제
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    const metadata = this.getMetadata();
    metadata.forEach(meta => localStorage.removeItem(meta.key));
    localStorage.removeItem(METADATA_KEY);
  }

  /**
   * 특정 키가 존재하는지 확인
   */
  exists(key: AutosaveKey): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * 자동 저장 키 생성 헬퍼
   */
  static createKey(
    type: 'checkin' | 'checkout',
    spaceSlug: string,
    date: string
  ): AutosaveKey {
    return `${type}:${spaceSlug}:${date}` as AutosaveKey;
  }

  // Private methods

  private getMetadata(): AutosaveMetadata[] {
    try {
      const data = localStorage.getItem(METADATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private updateMetadata(key: AutosaveKey, timestamp: number, expiresAt: number): void {
    const metadata = this.getMetadata();
    const [type, spaceSlug, date] = key.split(':') as [
      'checkin' | 'checkout',
      string,
      string
    ];

    const existingIndex = metadata.findIndex(meta => meta.key === key);
    const newMeta: AutosaveMetadata = {
      key,
      timestamp,
      expiresAt,
      type,
      spaceSlug,
      date,
    };

    if (existingIndex >= 0) {
      metadata[existingIndex] = newMeta;
    } else {
      metadata.push(newMeta);
    }

    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  private removeFromMetadata(key: AutosaveKey): void {
    const metadata = this.getMetadata();
    const filtered = metadata.filter(meta => meta.key !== key);
    localStorage.setItem(METADATA_KEY, JSON.stringify(filtered));
  }

  private isExpired(key: AutosaveKey): boolean {
    const metadata = this.getMetadata();
    const meta = metadata.find(m => m.key === key);
    return meta ? meta.expiresAt < Date.now() : true;
  }

  private isVersionCompatible(version: string): boolean {
    // 간단한 메이저 버전 체크
    const [currentMajor] = CURRENT_VERSION.split('.');
    const [dataMajor] = version.split('.');
    return currentMajor === dataMajor;
  }
}

// 싱글톤 인스턴스 export
export const autosaveService = AutosaveService.getInstance();