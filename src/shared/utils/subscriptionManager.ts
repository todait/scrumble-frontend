import { websocketService } from '@/shared/services/websocket.service';

/**
 * WeakMap을 활용한 구독 관리자 클래스
 * 컴포넌트가 언마운트되면 자동으로 구독이 정리됩니다
 */
export class SubscriptionManager {
  // 컴포넌트별 구독 정보를 저장하는 WeakMap
  private subscriptions = new WeakMap<object, Set<string>>();

  // 구독 해제 타이머를 관리하는 Map
  private cleanupTimers = new Map<string, NodeJS.Timeout>();

  // 각 포스트별 구독자 수를 추적
  private subscriptionCounts = new Map<string, number>();

  // 싱글톤 인스턴스
  private static instance: SubscriptionManager;

  private constructor() {}

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  /**
   * 컴포넌트가 포스트들을 구독합니다
   */
  subscribe(owner: object, postIds: string[]): void {
    const existing = this.subscriptions.get(owner) || new Set<string>();

    postIds.forEach(postId => {
      if (!existing.has(postId)) {
        existing.add(postId);

        // 구독자 수 증가
        const currentCount = this.subscriptionCounts.get(postId) || 0;
        this.subscriptionCounts.set(postId, currentCount + 1);

        // 지연 해제 타이머가 있다면 취소
        const timer = this.cleanupTimers.get(postId);
        if (timer) {
          clearTimeout(timer);
          this.cleanupTimers.delete(postId);
        }
      }
    });

    this.subscriptions.set(owner, existing);
  }

  /**
   * 컴포넌트의 구독을 해제합니다
   */
  unsubscribe(owner: object, postIds?: string[]): void {
    const existing = this.subscriptions.get(owner);
    if (!existing) return;

    const toUnsubscribe = postIds || Array.from(existing);

    toUnsubscribe.forEach(postId => {
      if (existing.has(postId)) {
        existing.delete(postId);

        // 구독자 수 감소
        const currentCount = this.subscriptionCounts.get(postId) || 1;
        const newCount = Math.max(0, currentCount - 1);

        if (newCount === 0) {
          this.subscriptionCounts.delete(postId);
          // 아무도 구독하지 않으면 지연 정리 스케줄
          this.scheduleCleanup(postId);
        } else {
          this.subscriptionCounts.set(postId, newCount);
        }
      }
    });

    if (existing.size === 0) {
      this.subscriptions.delete(owner);
    }
  }

  /**
   * 모든 구독을 즉시 해제합니다
   */
  unsubscribeAll(owner: object): void {
    const existing = this.subscriptions.get(owner);
    if (!existing) return;

    this.unsubscribe(owner, Array.from(existing));
  }

  /**
   * 포스트의 지연 정리를 스케줄링합니다
   */
  private scheduleCleanup(postId: string, delay = 30000): void {
    // 기존 타이머가 있다면 취소
    const existingTimer = this.cleanupTimers.get(postId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 30초 후에 정리
    const timer = setTimeout(() => {
      // 여전히 아무도 구독하지 않는다면 웹소켓 구독 해제
      const count = this.subscriptionCounts.get(postId) || 0;
      if (count === 0) {
        websocketService.unsubscribeFromComments(postId);
      }
      this.cleanupTimers.delete(postId);
    }, delay);

    this.cleanupTimers.set(postId, timer);
  }

  /**
   * 특정 포스트를 구독 중인 컴포넌트 수를 반환합니다
   */
  getSubscriberCount(postId: string): number {
    return this.subscriptionCounts.get(postId) || 0;
  }

  /**
   * 현재 구독 중인 모든 포스트 ID를 반환합니다
   */
  getAllSubscribedPostIds(): string[] {
    return Array.from(this.subscriptionCounts.keys());
  }

  /**
   * 모든 타이머를 정리합니다 (앱 종료 시)
   */
  cleanup(): void {
    this.cleanupTimers.forEach(timer => clearTimeout(timer));
    this.cleanupTimers.clear();
    this.subscriptionCounts.clear();
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();
