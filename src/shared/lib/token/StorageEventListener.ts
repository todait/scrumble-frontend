import { UserTokenManager } from './UserTokenManager';
import { SpaceMemberTokenManager } from './SpaceMemberTokenManager';

type StorageEventCallback = () => void;

export class StorageEventListener {
  private static instance: StorageEventListener;
  private callbacks: Set<StorageEventCallback> = new Set();
  private isListening = false;

  private constructor() {}

  static getInstance(): StorageEventListener {
    if (!StorageEventListener.instance) {
      StorageEventListener.instance = new StorageEventListener();
    }
    return StorageEventListener.instance;
  }

  // storage 이벤트 핸들러
  private handleStorageChange = (event: StorageEvent) => {
    // 다른 탭에서의 변경사항만 처리
    if (event.storageArea !== localStorage) return;

    // 토큰 관련 키가 변경되었는지 확인
    const isTokenKey = event.key && (
      event.key.includes('access_token') || 
      event.key.includes('refresh_token') ||
      event.key.includes('space_member_tokens')
    );

    if (!isTokenKey) return;

    // 토큰이 삭제되었는지 확인 (로그아웃)
    if (event.newValue === null || event.newValue === '') {
      this.handleTokenRemoved(event.key);
    }
  };

  // 토큰 삭제 처리
  private handleTokenRemoved(key: string) {
    // User 토큰이 삭제된 경우
    if (key.includes('access_token') || key.includes('refresh_token')) {
      if (!UserTokenManager.hasValidToken()) {
        this.notifyCallbacks();
      }
    }
    
    // SpaceMember 토큰이 삭제된 경우
    if (key.includes('space_member_tokens')) {
      const currentSpace = SpaceMemberTokenManager.getCurrentSpaceSlug();
      if (currentSpace && !SpaceMemberTokenManager.hasValidToken(currentSpace)) {
        this.notifyCallbacks();
      }
    }
  }

  // 콜백 실행
  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[StorageEventListener] Callback error:', error);
      }
    });
  }

  // 리스너 시작
  start() {
    if (this.isListening || typeof window === 'undefined') return;

    window.addEventListener('storage', this.handleStorageChange);
    this.isListening = true;
  }

  // 리스너 중지
  stop() {
    if (!this.isListening || typeof window === 'undefined') return;

    window.removeEventListener('storage', this.handleStorageChange);
    this.isListening = false;
    this.callbacks.clear();
  }

  // 콜백 등록
  subscribe(callback: StorageEventCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // 수동으로 토큰 상태 확인
  checkTokenStatus(): boolean {
    const hasUserToken = UserTokenManager.hasValidToken();
    const currentSpace = SpaceMemberTokenManager.getCurrentSpaceSlug();
    const hasSpaceToken = currentSpace ? SpaceMemberTokenManager.hasValidToken(currentSpace) : true;

    return hasUserToken && hasSpaceToken;
  }
}

// 싱글톤 인스턴스 export
export const storageEventListener = StorageEventListener.getInstance();