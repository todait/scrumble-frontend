/**
 * WebSocket 재연결 시 데이터 동기화 관리 유틸리티
 */

import { debug } from './debug';

interface ReconnectionManager {
  // 마지막 활성 시간 추적
  updateLastActiveTime: () => void;
  getLastActiveTime: () => number;
  getTimeSinceLastActive: () => number;
  
  // 동기화 필요 여부 판단
  shouldRefetchData: (thresholdMs?: number) => boolean;
  
  // 페이지 가시성 관리
  startVisibilityTracking: () => () => void;
  
  // 재연결 시 콜백 관리
  addReconnectionCallback: (callback: () => void) => () => void;
  executeReconnectionCallbacks: () => void;
}

class ReconnectionManagerImpl implements ReconnectionManager {
  private readonly LAST_ACTIVE_KEY = 'ws_last_active_time';
  private readonly DEFAULT_THRESHOLD_MS = 30000; // 30초
  
  private reconnectionCallbacks: Set<() => void> = new Set();
  private visibilityCleanup: (() => void) | null = null;

  updateLastActiveTime(): void {
    // SSR 환경에서는 실행하지 않음
    if (typeof window === 'undefined') {
      return;
    }
    const now = Date.now();
    localStorage.setItem(this.LAST_ACTIVE_KEY, now.toString());
  }

  getLastActiveTime(): number {
    // SSR 환경에서는 기본값 반환
    if (typeof window === 'undefined') {
      return 0;
    }
    const stored = localStorage.getItem(this.LAST_ACTIVE_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  }

  getTimeSinceLastActive(): number {
    // SSR 환경에서는 0 반환
    if (typeof window === 'undefined') {
      return 0;
    }
    return Date.now() - this.getLastActiveTime();
  }

  shouldRefetchData(thresholdMs: number = this.DEFAULT_THRESHOLD_MS): boolean {
    return this.getTimeSinceLastActive() > thresholdMs;
  }

  startVisibilityTracking(): () => void {
    // 이미 추적 중이면 기존 것을 정리
    if (this.visibilityCleanup) {
      this.visibilityCleanup();
    }

    // 페이지 숨김/보임 이벤트 핸들러
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨질 때 마지막 활성 시간 업데이트
        this.updateLastActiveTime();
        debug('ReconnectionManager', '페이지 비활성화 - 타임스탬프 저장');
      } else {
        // 페이지가 다시 보일 때
        const timeSinceLastActive = this.getTimeSinceLastActive();
        debug('ReconnectionManager', '페이지 재활성화', {
          비활성시간: `${Math.round(timeSinceLastActive / 1000)}초`,
        });
        
        // WebSocket 재연결 이벤트 발생 (항상)
        // CentrifugoService가 자체적으로 재연결하도록 시그널 전송
        window.dispatchEvent(new CustomEvent('page-reactivated', {
          detail: { timeSinceLastActive }
        }));
        
        // 데이터 동기화 필요 여부 확인
        if (this.shouldRefetchData()) {
          debug('ReconnectionManager', '데이터 동기화 필요');
          this.executeReconnectionCallbacks();
        }
        
        // 현재 시간으로 업데이트
        this.updateLastActiveTime();
      }
    };

    // 온라인/오프라인 이벤트 핸들러
    const handleOnline = () => {
      debug('ReconnectionManager', '네트워크 재연결 - 데이터 동기화 시도');
      if (this.shouldRefetchData(5000)) { // 5초 이상 차이나면 동기화
        this.executeReconnectionCallbacks();
      }
      this.updateLastActiveTime();
    };

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // 초기 활성 시간 설정
    this.updateLastActiveTime();

    // cleanup 함수 반환
    this.visibilityCleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      this.visibilityCleanup = null;
    };

    return this.visibilityCleanup;
  }

  addReconnectionCallback(callback: () => void): () => void {
    this.reconnectionCallbacks.add(callback);
    
    // 제거 함수 반환
    return () => {
      this.reconnectionCallbacks.delete(callback);
    };
  }

  executeReconnectionCallbacks(): void {
    debug('ReconnectionManager', `${this.reconnectionCallbacks.size}개 콜백 실행`);
    this.reconnectionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          debug('ReconnectionManager', '콜백 실행 중 에러:', error);
        }
      }
    });
  }
}

// 싱글톤 인스턴스
export const reconnectionManager: ReconnectionManager = new ReconnectionManagerImpl();

// React Query와 함께 사용할 수 있는 헬퍼 함수들
export const createDataSyncCallback = (refetchFn: () => void, description: string = 'data') => {
  return () => {
    debug('ReconnectionManager', `${description} 데이터 동기화 시작`);
    try {
      refetchFn();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        debug('ReconnectionManager', `${description} 동기화 실패:`, error);
      }
    }
  };
};

// 디버깅용 함수
export const debugReconnectionManager = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  debug('ReconnectionManager', '🔄 ReconnectionManager 상태');
  debug('ReconnectionManager', '마지막 활성 시간:', new Date(reconnectionManager.getLastActiveTime()).toLocaleString());
  debug('ReconnectionManager', '비활성 시간:', `${Math.round(reconnectionManager.getTimeSinceLastActive() / 1000)}초`);
  debug('ReconnectionManager', '동기화 필요 여부:', reconnectionManager.shouldRefetchData());
};

// 전역 디버깅 함수 등록 (클라이언트 사이드에서만)
// SSR과 클라이언트 간 불일치 방지를 위해 useEffect나 별도 클라이언트 컴포넌트에서 처리
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    (window as any).debugReconnectionManager = debugReconnectionManager;
  }
}