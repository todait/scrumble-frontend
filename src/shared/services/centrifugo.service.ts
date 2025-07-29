/**
 * Centrifugo WebSocket 서비스
 * Centrifugo를 사용한 실시간 통신을 관리합니다.
 */

import type {
  ConnectionState,
  IncomingWebSocketMessage,
  WebSocketEventHandler,
  WebSocketEventType,
} from '@/shared/types/websocket.types';
import { debug } from '@/shared/utils/debug';
import { debugWebSocketMessage } from '@/shared/utils/typeGuards';
import { Centrifuge, type PublicationContext, type Subscription } from 'centrifuge';

/**
 * Centrifugo WebSocket 연결을 관리하는 클래스
 */
export class CentrifugoService {
  private centrifuge: Centrifuge | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private eventHandlers = new Map<WebSocketEventType, WebSocketEventHandler[]>();
  private subscriptions = new Map<string, Subscription>();
  private spaceSlug: string | null = null;
  private spaceMemberId: string | null = null;
  private wsUrl: string;
  private centrifugoToken: string | null = null;

  constructor() {
    // 환경 변수에서 Centrifugo URL 가져오기
    this.wsUrl =
      process.env.NEXT_PUBLIC_CENTRIFUGO_URL || 'ws://localhost:8000/connection/websocket';
  }

  /**
   * 연결 상태를 내보냅니다
   */
  private emit(eventType: WebSocketEventType, message: IncomingWebSocketMessage): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`[Centrifugo] 핸들러 실행 에러 (${eventType}):`, error);
          }
        }
      });
    }
  }

  /**
   * Centrifugo 연결을 초기화합니다
   */
  async connect(spaceMemberId: string, spaceSlug: string, centrifugoToken: string): Promise<void> {
    // 동일한 연결이 이미 활성화되어 있고 연결 상태가 좋으면 재사용
    if (
      this.centrifuge &&
      this.spaceMemberId === spaceMemberId &&
      this.spaceSlug === spaceSlug &&
      this.centrifugoToken === centrifugoToken &&
      this.connectionState === 'connected'
    ) {
      debug('Centrifugo', '기존 연결 재사용');
      return Promise.resolve();
    }

    // 기존 연결이 있다면 종료
    if (this.centrifuge) {
      debug('Centrifugo', '기존 연결 정리 중...');
      this.disconnect();
    }

    this.spaceMemberId = spaceMemberId;
    this.spaceSlug = spaceSlug;
    this.centrifugoToken = centrifugoToken;
    this.connectionState = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        // Centrifuge 클라이언트 생성
        this.centrifuge = new Centrifuge(this.wsUrl, {
          token: centrifugoToken,
          debug: process.env.NODE_ENV === 'development',
          // 재연결 설정 (Centrifuge 5.x 형식)
          minReconnectDelay: 1000, // 최소 재연결 지연 시간 (1초)
          maxReconnectDelay: 20000, // 최대 재연결 지연 시간 (20초)
          maxServerPingDelay: 10000, // 서버 핑 최대 지연 시간 (10초)
        });

        // 연결 상태 핸들러
        this.centrifuge.on('connecting', ctx => {
          this.connectionState = 'connecting';
          debug('Centrifugo', 'Connecting...', ctx);
        });

        this.centrifuge.on('connected', ctx => {
          this.connectionState = 'connected';
          debug('Centrifugo', 'Connected', ctx);

          // 연결 성공 이벤트 emit
          this.emit('connection.established', {
            type: 'connection.established',
            spaceSlug: this.spaceSlug || '',
            timestamp: new Date().toISOString(),
            postId: '',
            spaceMemberId: this.spaceMemberId || '',
          });

          resolve();
        });

        this.centrifuge.on('disconnected', ctx => {
          this.connectionState = 'disconnected';
          debug('Centrifugo', 'Disconnected', ctx);

          // 연결 끊김 이벤트 emit (React 컴포넌트에서 감지할 수 있도록)
          this.emit('connection.lost', {
            type: 'connection.lost',
            spaceSlug: this.spaceSlug || '',
            timestamp: new Date().toISOString(),
            postId: '',
            spaceMemberId: this.spaceMemberId || '',
          });
        });

        this.centrifuge.on('error', ctx => {
          this.connectionState = 'error';
          if (process.env.NODE_ENV === 'development') {
            console.error('[Centrifugo] Error', ctx);
          }
          reject(new Error(ctx.error.message || 'Centrifugo connection error'));
        });

        // 연결 시작
        this.centrifuge.connect();

        // 연결 타임아웃 설정 (10초)
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.connectionState = 'error';
            if (this.centrifuge) {
              this.centrifuge.disconnect();
            }
            reject(new Error('Centrifugo 연결 타임아웃'));
          }
        }, 10000);
      } catch (error) {
        this.connectionState = 'error';
        reject(error);
      }
    });
  }

  /**
   * Centrifugo 연결을 종료합니다
   */
  disconnect(): void {
    if (this.centrifuge) {
      // 모든 구독 해제
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.centrifuge.disconnect();
      this.centrifuge = null;
    }
    this.connectionState = 'disconnected';
    this.eventHandlers.clear();
    this.centrifugoToken = null;
  }

  /**
   * 채널을 구독합니다
   */
  private subscribe(channel: string): Subscription | null {
    debug('Centrifugo', 'subscribe() called', {
      channel,
      hasCentrifuge: !!this.centrifuge,
      connectionState: this.connectionState,
      centrifugeState: this.centrifuge?.state,
      connected: this.connected,
    });

    if (!this.centrifuge || this.connectionState !== 'connected') {
      debug('Centrifugo', '연결되지 않았거나 Centrifuge 인스턴스가 없음', {
        hasCentrifuge: !!this.centrifuge,
        connectionState: this.connectionState,
        channel,
      });
      return null;
    }

    // 이미 구독 중이라면 기존 구독 반환
    const existingSubscription = this.subscriptions.get(channel);
    if (existingSubscription) {
      debug('Centrifugo', `Already subscribed to ${channel}`);
      return existingSubscription;
    }

    try {
      debug('Centrifugo', `Creating new subscription for ${channel}`);
      const subscription = this.centrifuge.newSubscription(channel);

      // 메시지 수신 핸들러
      subscription.on('publication', (ctx: PublicationContext) => {
        debug('Centrifugo', `Message received on ${channel}`, ctx.data);
        this.handleMessage(channel, ctx.data);
      });

      subscription.on('subscribing', ctx => {
        debug('Centrifugo', `Subscribing to ${channel}`, ctx);
      });

      subscription.on('subscribed', ctx => {
        debug('Centrifugo', `✅ Successfully subscribed to ${channel}`, ctx);
      });

      subscription.on('unsubscribed', ctx => {
        debug('Centrifugo', `Unsubscribed from ${channel}`, ctx);
      });

      subscription.on('error', ctx => {
        // 에러가 발생해도 서비스는 계속 동작하도록 함
        const errorMessage = ctx.error?.message || 'Unknown error';
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Centrifugo] ⚠️ Subscription error on ${channel}:`, errorMessage);
        }

        // 중복 구독 에러인 경우 구독 목록에서 제거
        if (errorMessage.includes('already exists')) {
          this.subscriptions.delete(channel);
        }
      });

      // 구독 시작
      debug('Centrifugo', `Starting subscription to ${channel}`);

      try {
        subscription.subscribe();
        this.subscriptions.set(channel, subscription);
        debug('Centrifugo', `Total subscriptions now: ${this.subscriptions.size}`);
        return subscription;
      } catch (subscribeError) {
        // 구독 시작 중 에러 발생 시
        const errorMessage = (subscribeError as Error)?.message || 'Unknown subscription error';

        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Centrifugo] ⚠️ Failed to subscribe to ${channel}:`, errorMessage);
        }

        // 중복 구독 에러인 경우 무시하고 null 반환
        if (errorMessage.includes('already exists')) {
          debug('Centrifugo', `Channel ${channel} already has a subscription, skipping`);
          return null;
        }

        // 다른 에러는 다시 던짐
        throw subscribeError;
      }
    } catch (error) {
      // 전체 구독 프로세스 중 에러 발생
      const errorMessage = (error as Error)?.message || 'Unknown error';

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Centrifugo] ⚠️ Error creating subscription for ${channel}:`, errorMessage);
      }

      // 서비스가 다운되지 않도록 null 반환
      return null;
    }
  }

  /**
   * 채널 구독을 해제합니다
   */
  private unsubscribe(channel: string): void {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channel);
    }
  }

  /**
   * 포스트의 댓글 이벤트를 구독합니다
   */
  subscribeToComments(postId: string): void {
    debug('Centrifugo', 'subscribeToComments called for postId', postId);
    if (!this.spaceSlug) {
      debug('Centrifugo', '스페이스 정보가 없음');
      return;
    }

    const channel = `space:${this.spaceSlug}:post:${postId}`;
    debug('Centrifugo', 'Subscribing to channel', channel);
    this.subscribe(channel);
  }

  /**
   * 포스트의 댓글 이벤트 구독을 해제합니다
   */
  unsubscribeFromComments(postId: string): void {
    if (!this.spaceSlug) {
      return;
    }

    const channel = `space:${this.spaceSlug}:post:${postId}`;
    this.unsubscribe(channel);
  }

  /**
   * 여러 포스트의 댓글 이벤트를 한번에 구독합니다
   */
  batchSubscribeToComments(postIds: string[]): void {
    debug('Centrifugo', 'batchSubscribeToComments called with postIds', postIds);
    if (!this.spaceSlug || postIds.length === 0) {
      debug('Centrifugo', 'Skipping batch subscribe', {
        spaceSlug: this.spaceSlug,
        postIdsLength: postIds.length,
      });
      return;
    }

    postIds.forEach(postId => {
      this.subscribeToComments(postId);
    });
  }

  /**
   * 여러 포스트의 댓글 이벤트 구독을 한번에 해제합니다
   */
  batchUnsubscribeFromComments(postIds: string[]): void {
    if (!this.spaceSlug || postIds.length === 0) {
      return;
    }

    postIds.forEach(postId => {
      this.unsubscribeFromComments(postId);
    });
  }

  /**
   * 포스트의 리액션 이벤트를 구독합니다
   */
  subscribeToReactions(postId: string): void {
    if (!this.spaceSlug) {
      debug('Centrifugo', '스페이스 정보가 없음');
      return;
    }

    const channel = `space:${this.spaceSlug}:post:${postId}:reactions`;
    this.subscribe(channel);
  }

  /**
   * 포스트의 리액션 이벤트 구독을 해제합니다
   */
  unsubscribeFromReactions(postId: string): void {
    if (!this.spaceSlug) {
      return;
    }

    const channel = `space:${this.spaceSlug}:post:${postId}:reactions`;
    this.unsubscribe(channel);
  }

  /**
   * 여러 포스트의 리액션 이벤트를 한번에 구독합니다
   */
  batchSubscribeToReactions(postIds: string[]): void {
    debug('Centrifugo', 'batchSubscribeToReactions called with postIds', postIds);
    if (!this.spaceSlug || postIds.length === 0) {
      debug('Centrifugo', 'Skipping batch subscribe reactions', {
        spaceSlug: this.spaceSlug,
        postIdsLength: postIds.length,
      });
      return;
    }

    postIds.forEach(postId => {
      this.subscribeToReactions(postId);
    });
  }

  /**
   * 여러 포스트의 리액션 이벤트 구독을 한번에 해제합니다
   */
  batchUnsubscribeFromReactions(postIds: string[]): void {
    if (!this.spaceSlug || postIds.length === 0) {
      return;
    }

    postIds.forEach(postId => {
      this.unsubscribeFromReactions(postId);
    });
  }

  /**
   * 스페이스의 포스트 이벤트를 구독합니다
   */
  subscribeToPosts(spaceSlug: string): void {
    const channel = `space:${spaceSlug}`;
    this.subscribe(channel);
  }

  /**
   * 스페이스의 포스트 이벤트 구독을 해제합니다
   */
  unsubscribeFromPosts(spaceSlug: string): void {
    const channel = `space:${spaceSlug}`;
    this.unsubscribe(channel);
  }

  /**
   * 현재 구독 중인 포스트 ID 목록을 반환합니다
   */
  getSubscribedPostIds(): string[] {
    const postIds: string[] = [];
    this.subscriptions.forEach((_, channel) => {
      // space:{spaceSlug}:post:{postId} 형식에서 postId 추출
      const match = channel.match(/^space:[^:]+:post:([^:]+)$/);
      if (match) {
        postIds.push(match[1]);
      }
    });
    return postIds;
  }

  /**
   * 현재 구독 중인 리액션 포스트 ID 목록을 반환합니다
   */
  getSubscribedReactionPostIds(): string[] {
    const postIds: string[] = [];
    this.subscriptions.forEach((_, channel) => {
      // space:{spaceSlug}:post:{postId}:reactions 형식에서 postId 추출
      const match = channel.match(/^space:[^:]+:post:([^:]+):reactions$/);
      if (match) {
        postIds.push(match[1]);
      }
    });
    return postIds;
  }

  /**
   * 멤버의 알림 이벤트를 구독합니다
   */
  subscribeToNotifications(memberId: string): void {
    if (!this.spaceSlug || !memberId) {
      debug('Centrifugo', '스페이스 또는 멤버 정보가 없음', {
        spaceSlug: this.spaceSlug,
        memberId,
      });
      return;
    }

    const channel = `space:${this.spaceSlug}:member:${memberId}:notifications`;

    // 이미 구독 중인지 확인
    if (this.subscriptions.has(channel)) {
      debug('Centrifugo', '이미 알림 채널을 구독 중입니다', channel);
      return;
    }

    debug('Centrifugo', 'Subscribing to notifications channel', channel);
    this.subscribe(channel);
  }

  /**
   * 멤버의 알림 이벤트 구독을 해제합니다
   */
  unsubscribeFromNotifications(memberId: string): void {
    if (!this.spaceSlug || !memberId) {
      return;
    }

    const channel = `space:${this.spaceSlug}:member:${memberId}:notifications`;
    this.unsubscribe(channel);
  }

  /**
   * 특정 이벤트 타입에 대한 핸들러를 등록합니다
   */
  addEventListener(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    const handlers = this.eventHandlers.get(eventType)!;
    // 중복 핸들러 등록 방지
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  /**
   * 특정 이벤트 타입의 핸들러를 제거합니다
   */
  removeEventListener(eventType: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 연결 상태를 반환합니다
   */
  get connected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * 연결 상태를 반환합니다
   */
  get connectionStatus(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Centrifugo로부터 받은 메시지를 처리합니다
   */
  private handleMessage(channel: string, data: unknown): void {
    // 비동기로 메시지 처리하여 스레드 블로킹 방지
    setTimeout(() => {
      try {
        // data가 이미 객체인 경우 그대로 사용, 문자열인 경우 파싱
        const messageData = typeof data === 'string' ? JSON.parse(data) : data;

        // 채널 정보와 spaceSlug 추가
        const message: IncomingWebSocketMessage = {
          ...messageData,
          spaceSlug: this.spaceSlug || '',
          timestamp: messageData.timestamp || new Date().toISOString(),
        };

        // 개발 환경에서만 상세 로깅
        debug('Centrifugo', 'Received message', { channel, message });
        if (process.env.NODE_ENV === 'development') {
          debugWebSocketMessage(message);
        }

        // 등록된 핸들러들에게 메시지 전달
        const handlers = this.eventHandlers.get(message.type);
        if (handlers && handlers.length > 0) {
          handlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[Centrifugo] 핸들러 실행 에러:', error);
              }
            }
          });
        } else {
          debug('Centrifugo', `No handlers found for message type: ${message.type}`);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Centrifugo] Failed to handle message:', error, data);
        }
      }
    }, 0);
  }

  /**
   * 디버깅을 위한 상태 정보 출력
   */
  debugInfo(): void {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    /* eslint-disable no-console */
    console.group('[Centrifugo Debug Info]');
    console.log('연결 상태:', this.connectionState);
    console.log('사용자 ID:', this.spaceMemberId);
    console.log('스페이스 슬러그:', this.spaceSlug);
    console.log('구독 수:', this.subscriptions.size);
    console.log('등록된 이벤트 핸들러:');
    this.eventHandlers.forEach((handlers, eventType) => {
      console.log(`  ${eventType}: ${handlers.length}개`);
    });
    console.log('현재 구독 채널:');
    this.subscriptions.forEach((_, channel) => {
      console.log(`  ${channel}`);
    });
    console.log('댓글 구독 포스트 ID:', this.getSubscribedPostIds());
    console.log('리액션 구독 포스트 ID:', this.getSubscribedReactionPostIds());
    console.groupEnd();
    /* eslint-enable no-console */
  }
}

// 싱글톤 인스턴스 생성
export const centrifugoService = new CentrifugoService();

// 개발 환경에서 전역 디버깅 헬퍼 등록 (클라이언트 사이드에서만)
// SSR과 클라이언트 간 불일치 방지를 위해 useEffect나 별도 클라이언트 컴포넌트에서 처리
if (typeof window !== 'undefined') {
  // 클라이언트 사이드에서만 실행되도록 처리
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).debugCentrifugo = () => centrifugoService.debugInfo();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).centrifugoService = centrifugoService;
  }

  // 디버깅 헬퍼 import (클라이언트 사이드에서만)
  import('./centrifugo-debug').catch(() => {});
}

// React 훅을 위한 타입 내보내기
export type { IncomingWebSocketMessage, WebSocketEventHandler, WebSocketEventType };
