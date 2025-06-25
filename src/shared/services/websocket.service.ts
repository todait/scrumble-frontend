/**
 * WebSocket 서비스
 * 백엔드와 실시간 통신을 위한 WebSocket 연결을 관리합니다.
 */

import type {
  WebSocketEventType,
  ConnectionState,
  IncomingWebSocketMessage,
  OutgoingWebSocketMessage,
  WebSocketHandlers,
  WebSocketSubscription,
  WebSocketEventHandler,
  UnsubscribeMessage,
  BatchSubscribeMessage,
  BatchUnsubscribeMessage,
  SubscribeReactionsMessage,
  UnsubscribeReactionsMessage,
  BatchSubscribeReactionsMessage,
  BatchUnsubscribeReactionsMessage,
  SubscribePostsMessage,
  UnsubscribePostsMessage,
  BatchSubscribePostsMessage,
  BatchUnsubscribePostsMessage,
} from '@/shared/types/websocket.types';
import {
  safeParseWebSocketMessage,
  debugWebSocketMessage,
} from '@/shared/utils/typeGuards';

/**
 * WebSocket 연결을 관리하는 클래스
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = process.env.NODE_ENV === 'production' ? 3 : 5; // 프로덕션에서는 3회로 제한
  private reconnectDelay = process.env.NODE_ENV === 'production' ? 3000 : 1000; // 프로덕션에서는 3초부터 시작
  private eventHandlers = new Map<WebSocketEventType, WebSocketEventHandler[]>();
  private subscriptions = new Map<string, WebSocketSubscription>();
  private connectionPromise: Promise<void> | null = null;

  // Heartbeat 관련
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPongTime = Date.now();
  private heartbeatInterval = 10000; // 10초마다 ping
  private connectionTimeout = 30000; // 30초 동안 응답 없으면 재연결

  // 연결 정보
  private userID: string | null = null;
  private spaceSlug: string | null = null;
  private wsUrl: string;

  // 재연결 타이머
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    // 환경 변수에서 WebSocket URL 가져오기
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
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
          console.error(`[WebSocket] 핸들러 실행 에러 (${eventType}):`, error);
        }
      });
    }
  }

  /**
   * WebSocket 연결을 초기화합니다
   */
  async connect(userID: string, spaceSlug: string): Promise<void> {
    if (this.isConnected && this.userID === userID && this.spaceSlug === spaceSlug) {
      return Promise.resolve();
    }

    // 기존 연결이 있다면 종료
    if (this.ws) {
      this.disconnect();
    }

    this.userID = userID;
    this.spaceSlug = spaceSlug;
    this.connectionState = 'connecting';

    // 이미 연결 중이라면 기존 Promise 반환
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // JWT 토큰 가져오기
        const token = this.getAccessToken();
        if (!token) {
          this.connectionState = 'error';
          reject(new Error('인증 토큰이 없습니다.'));
          return;
        }

        // WebSocket URL 구성 (Authorization 헤더는 WebSocket에서 직접 지원하지 않으므로 쿼리로 전달)
        const url = `${this.wsUrl}/spaces/${spaceSlug}?spaceSlug=${spaceSlug}&token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(url);

        // 연결 성공 핸들러
        this.ws.onopen = () => {
          this.connectionPromise = null;
          this.startHeartbeat();
          // 연결 상태는 connection.established 이벤트 수신 후 설정
          // 프로덕션 환경에서는 즉시 resolve하여 초기 로드 지연을 최소화
          if (process.env.NODE_ENV === 'production') {
            setTimeout(() => resolve(), 0);
          } else {
            resolve();
          }
        };

        // 메시지 수신 핸들러
        this.ws.onmessage = event => {
          this.handleMessage(event.data);
        };

        // 연결 종료 핸들러
        this.ws.onclose = event => {
          this.handleDisconnect(event);
        };

        // 에러 핸들러
        this.ws.onerror = _error => {
          this.connectionPromise = null;
          this.connectionState = 'error';
          // 개발 환경에서는 핫 리로드로 인한 일시적 연결 실패가 정상적임
          if (process.env.NODE_ENV === 'development') {
            reject(new Error('WebSocket connection temporarily failed'));
          } else {
            reject(new Error('WebSocket 연결에 실패했습니다.'));
          }
        };

        // 연결 타임아웃 설정 (10초)
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.connectionPromise = null;
            this.connectionState = 'error';
            if (this.ws) {
              this.ws.close();
            }
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 10000);
      } catch (error) {
        this.connectionPromise = null;
        this.connectionState = 'error';
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * WebSocket 연결을 종료합니다
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.isConnected = false;
    this.connectionState = 'disconnected';
    this.eventHandlers.clear();
    this.subscriptions.clear();
    this.connectionPromise = null;
  }

  /**
   * Heartbeat를 시작합니다
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastPongTime = Date.now();

    this.pingInterval = setInterval(() => {
      if (Date.now() - this.lastPongTime > this.connectionTimeout) {
        console.warn('[WebSocket] Connection timeout, reconnecting...');
        this.handleDisconnect({ code: 4000, reason: 'Heartbeat timeout' } as CloseEvent);
      } else if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Heartbeat를 중지합니다
   */
  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 연결 끊김을 처리합니다
   */
  private handleDisconnect(event: CloseEvent): void {
    this.isConnected = false;
    this.connectionPromise = null;
    this.stopHeartbeat();

    // 정상적인 종료가 아니라면 재연결 시도 (최대 횟수 체크 포함)
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = 'error';
      // 개발 환경에서만 연결 실패 이벤트 emit
      if (process.env.NODE_ENV === 'development') {
        this.emit('connection.failed', {
          type: 'connection.failed',
          spaceSlug: this.spaceSlug || '',
          timestamp: new Date().toISOString(),
          reason: 'Max reconnection attempts reached',
          attempts: this.reconnectAttempts,
        });
      }
    } else {
      this.connectionState = 'disconnected';
    }
  }

  /**
   * 재연결 타이머를 정리합니다
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 특정 포스트의 댓글 이벤트를 구독합니다
   */
  subscribeToComments(postId: string): void {
    if (!this.isConnected || !this.spaceSlug) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 연결되지 않았거나 스페이스 정보가 없음');
      }
      return;
    }

    const subscriptionKey = `comments:${postId}`;

    // 이미 구독 중이라면 스킵
    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const subscription: WebSocketSubscription = {
      type: 'subscribe',
      spaceSlug: this.spaceSlug,
      postId,
    };

    this.subscriptions.set(subscriptionKey, subscription);

    // 백엔드에 구독 요청 전송
    this.sendMessage(subscription);
  }

  /**
   * 특정 포스트의 댓글 이벤트 구독을 해제합니다
   */
  unsubscribeFromComments(postId: string): void {
    if (!this.isConnected || !this.spaceSlug) {
      return;
    }

    const subscriptionKey = `comments:${postId}`;

    if (!this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const unsubscription: UnsubscribeMessage = {
      type: 'unsubscribe',
      spaceSlug: this.spaceSlug!,
      postId,
    };

    this.subscriptions.delete(subscriptionKey);

    // 백엔드에 구독 해제 요청 전송
    this.sendMessage(unsubscription);
  }

  /**
   * 여러 포스트의 댓글 이벤트를 한번에 구독합니다
   */
  batchSubscribeToComments(postIds: string[]): void {
    if (!this.isConnected || !this.spaceSlug || postIds.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 연결되지 않았거나 구독할 포스트가 없습니다', {
          isConnected: this.isConnected,
          spaceSlug: this.spaceSlug,
          postIdsLength: postIds.length,
          wsReadyState: this.ws?.readyState
        });
      }
      return;
    }

    const newSubscriptions: string[] = [];

    postIds.forEach(postId => {
      const subscriptionKey = `comments:${postId}`;
      // 이미 구독 중이 아닌 것만 추가
      if (!this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.set(subscriptionKey, {
          type: 'subscribe',
          spaceSlug: this.spaceSlug!,
          postId,
        });
        newSubscriptions.push(postId);
      }
    });

    // 새로 구독할 포스트가 있다면 배치 요청 전송
    if (newSubscriptions.length > 0) {
      const batchSubscription: BatchSubscribeMessage = {
        type: 'batchSubscribe',
        spaceSlug: this.spaceSlug!,
        postIds: newSubscriptions,
      };
      this.sendMessage(batchSubscription);
    }
  }

  /**
   * 여러 포스트의 댓글 이벤트 구독을 한번에 해제합니다
   */
  batchUnsubscribeFromComments(postIds: string[]): void {
    if (!this.isConnected || !this.spaceSlug || postIds.length === 0) {
      return;
    }

    const toUnsubscribe: string[] = [];

    postIds.forEach(postId => {
      const subscriptionKey = `comments:${postId}`;
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.delete(subscriptionKey);
        toUnsubscribe.push(postId);
      }
    });

    // 구독 해제할 포스트가 있다면 배치 요청 전송
    if (toUnsubscribe.length > 0) {
      const batchUnsubscription: BatchUnsubscribeMessage = {
        type: 'batchUnsubscribe',
        spaceSlug: this.spaceSlug!,
        postIds: toUnsubscribe,
      };
      this.sendMessage(batchUnsubscription);
    }
  }

  /**
   * 현재 구독 중인 포스트 ID 목록을 반환합니다
   */
  getSubscribedPostIds(): string[] {
    const postIds: string[] = [];
    this.subscriptions.forEach((_, key) => {
      if (key.startsWith('comments:')) {
        postIds.push(key.substring(9)); // 'comments:' 제거
      }
    });
    return postIds;
  }

  /**
   * 특정 포스트의 리액션 이벤트를 구독합니다
   */
  subscribeToReactions(postId: string): void {
    if (!this.isConnected || !this.spaceSlug) {
      console.warn('[WebSocket] 연결되지 않았거나 스페이스 정보가 없음');
      return;
    }

    const subscriptionKey = `reactions:${postId}`;

    // 이미 구독 중이라면 스킵
    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const subscription: WebSocketSubscription = {
      type: 'subscribe',
      spaceSlug: this.spaceSlug,
      postId,
    };

    this.subscriptions.set(subscriptionKey, subscription);

    // 백엔드에 리액션 구독 요청 전송
    const subscribeMessage: SubscribeReactionsMessage = {
      type: 'subscribeReactions',
      spaceSlug: this.spaceSlug,
      postId,
    };

    this.sendMessage(subscribeMessage);
  }

  /**
   * 특정 포스트의 리액션 이벤트 구독을 해제합니다
   */
  unsubscribeFromReactions(postId: string): void {
    if (!this.isConnected || !this.spaceSlug) {
      return;
    }

    const subscriptionKey = `reactions:${postId}`;

    if (!this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const unsubscribeMessage: UnsubscribeReactionsMessage = {
      type: 'unsubscribeReactions',
      spaceSlug: this.spaceSlug!,
      postId,
    };

    this.subscriptions.delete(subscriptionKey);

    // 백엔드에 리액션 구독 해제 요청 전송
    this.sendMessage(unsubscribeMessage);
  }

  /**
   * 여러 포스트의 리액션 이벤트를 한번에 구독합니다
   */
  batchSubscribeToReactions(postIds: string[]): void {
    if (!this.isConnected || !this.spaceSlug || postIds.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 연결되지 않았거나 구독할 포스트가 없습니다', {
          isConnected: this.isConnected,
          spaceSlug: this.spaceSlug,
          postIdsLength: postIds.length,
          wsReadyState: this.ws?.readyState
        });
      }
      return;
    }

    const newSubscriptions: string[] = [];

    postIds.forEach(postId => {
      const subscriptionKey = `reactions:${postId}`;
      // 이미 구독 중이 아닌 것만 추가
      if (!this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.set(subscriptionKey, {
          type: 'subscribe',
          spaceSlug: this.spaceSlug!,
          postId,
        });
        newSubscriptions.push(postId);
      }
    });

    // 새로 구독할 포스트가 있다면 배치 요청 전송
    if (newSubscriptions.length > 0) {
      const batchSubscription: BatchSubscribeReactionsMessage = {
        type: 'batchSubscribeReactions',
        spaceSlug: this.spaceSlug!,
        postIds: newSubscriptions,
      };
      this.sendMessage(batchSubscription);
    }
  }

  /**
   * 여러 포스트의 리액션 이벤트 구독을 한번에 해제합니다
   */
  batchUnsubscribeFromReactions(postIds: string[]): void {
    if (!this.isConnected || !this.spaceSlug || postIds.length === 0) {
      return;
    }

    const toUnsubscribe: string[] = [];

    postIds.forEach(postId => {
      const subscriptionKey = `reactions:${postId}`;
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.delete(subscriptionKey);
        toUnsubscribe.push(postId);
      }
    });

    // 구독 해제할 포스트가 있다면 배치 요청 전송
    if (toUnsubscribe.length > 0) {
      const batchUnsubscription: BatchUnsubscribeReactionsMessage = {
        type: 'batchUnsubscribeReactions',
        spaceSlug: this.spaceSlug!,
        postIds: toUnsubscribe,
      };
      this.sendMessage(batchUnsubscription);
    }
  }

  /**
   * 스페이스의 포스트 이벤트를 구독합니다 (향후 백엔드 지원 예정)
   */
  subscribeToPosts(spaceSlug: string): void {
    if (!this.isConnected) {
      console.warn('[WebSocket] 연결되지 않았음');
      return;
    }

    const subscriptionKey = `posts:${spaceSlug}`;

    // 이미 구독 중이라면 스킵
    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const subscription: WebSocketSubscription = {
      type: 'subscribe',
      spaceSlug,
      postId: '', // 포스트 구독은 postId가 필요없음
    };

    this.subscriptions.set(subscriptionKey, subscription);

    // 백엔드에 포스트 구독 요청 전송 (향후 지원 예정)
    const subscribeMessage: SubscribePostsMessage = {
      type: 'subscribePosts',
      spaceSlug,
    };

    this.sendMessage(subscribeMessage);
  }

  /**
   * 스페이스의 포스트 이벤트 구독을 해제합니다 (향후 백엔드 지원 예정)
   */
  unsubscribeFromPosts(spaceSlug: string): void {
    if (!this.isConnected) {
      return;
    }

    const subscriptionKey = `posts:${spaceSlug}`;

    if (!this.subscriptions.has(subscriptionKey)) {
      return;
    }

    const unsubscribeMessage: UnsubscribePostsMessage = {
      type: 'unsubscribePosts',
      spaceSlug,
    };

    this.subscriptions.delete(subscriptionKey);

    // 백엔드에 포스트 구독 해제 요청 전송 (향후 지원 예정)
    this.sendMessage(unsubscribeMessage);
  }

  /**
   * 여러 스페이스의 포스트 이벤트를 한번에 구독합니다 (향후 백엔드 지원 예정)
   */
  batchSubscribeToPosts(spaceSlugs: string[]): void {
    if (!this.isConnected || spaceSlugs.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 연결되지 않았거나 구독할 스페이스가 없습니다', {
          isConnected: this.isConnected,
          spaceSlugLength: spaceSlugs.length,
          wsReadyState: this.ws?.readyState
        });
      }
      return;
    }

    const newSubscriptions: string[] = [];

    spaceSlugs.forEach(spaceSlug => {
      const subscriptionKey = `posts:${spaceSlug}`;
      // 이미 구독 중이 아닌 것만 추가
      if (!this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.set(subscriptionKey, {
          type: 'subscribe',
          spaceSlug,
          postId: '',
        });
        newSubscriptions.push(spaceSlug);
      }
    });

    // 새로 구독할 스페이스가 있다면 배치 요청 전송
    if (newSubscriptions.length > 0) {
      const batchSubscription: BatchSubscribePostsMessage = {
        type: 'batchSubscribePosts',
        spaceSlugs: newSubscriptions,
      };
      this.sendMessage(batchSubscription);
    }
  }

  /**
   * 여러 스페이스의 포스트 이벤트 구독을 한번에 해제합니다 (향후 백엔드 지원 예정)
   */
  batchUnsubscribeFromPosts(spaceSlugs: string[]): void {
    if (!this.isConnected || spaceSlugs.length === 0) {
      return;
    }

    const toUnsubscribe: string[] = [];

    spaceSlugs.forEach(spaceSlug => {
      const subscriptionKey = `posts:${spaceSlug}`;
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.delete(subscriptionKey);
        toUnsubscribe.push(spaceSlug);
      }
    });

    // 구독 해제할 스페이스가 있다면 배치 요청 전송
    if (toUnsubscribe.length > 0) {
      const batchUnsubscription: BatchUnsubscribePostsMessage = {
        type: 'batchUnsubscribePosts',
        spaceSlugs: toUnsubscribe,
      };
      this.sendMessage(batchUnsubscription);
    }
  }

  /**
   * 현재 구독 중인 리액션 포스트 ID 목록을 반환합니다
   */
  getSubscribedReactionPostIds(): string[] {
    const postIds: string[] = [];
    this.subscriptions.forEach((_, key) => {
      if (key.startsWith('reactions:')) {
        postIds.push(key.substring(10)); // 'reactions:' 제거
      }
    });
    return postIds;
  }

  /**
   * 현재 구독 중인 포스트 스페이스 슬러그 목록을 반환합니다
   */
  getSubscribedPostSpaceSlugs(): string[] {
    const spaceSlugs: string[] = [];
    this.subscriptions.forEach((_, key) => {
      if (key.startsWith('posts:')) {
        spaceSlugs.push(key.substring(6)); // 'posts:' 제거
      }
    });
    return spaceSlugs;
  }

  /**
   * 특정 이벤트 타입에 대한 핸들러를 등록합니다
   * 중복 등록을 방지합니다
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
    return this.isConnected;
  }

  /**
   * 액세스 토큰을 가져옵니다
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * 메시지를 백엔드로 전송합니다
   */
  private sendMessage(message: OutgoingWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        
        // 개발 환경에서만 전송 메시지 로깅
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket] Sending message:', message);
        }
        
        this.ws.send(messageStr);
      } catch (error) {
        console.error('[WebSocket] 메시지 전송 중 오류:', error, message);
        
        // 전송 실패 시 에러 이벤트 발생
        const errorMessage: IncomingWebSocketMessage = {
          type: 'message.error',
          spaceSlug: this.spaceSlug || '',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error : new Error(String(error)),
        };
        this.emit('message.error', errorMessage);
      }
    } else {
      // 프로덕션에서는 재연결 시도
      if (process.env.NODE_ENV === 'production' && !this.isConnected) {
        this.scheduleReconnect();
      }
      
      // 개발 환경에서만 상세한 경고 로그
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 메시지 전송 실패 - 연결되지 않음:', {
          wsExists: !!this.ws,
          readyState: this.ws?.readyState,
          isConnected: this.isConnected,
          message
        });
      }
    }
  }

  /**
   * 백엔드로부터 받은 메시지를 처리합니다
   */
  private handleMessage(data: string): void {
    // 비동기로 메시지 처리하여 WebSocket 스레드 블로킹 방지
    setTimeout(() => {
      // 안전한 메시지 파싱
      const message = safeParseWebSocketMessage(data);
      
      if (!message) {
        console.error('[WebSocket] Failed to parse message:', data);
        const errorMessage: IncomingWebSocketMessage = {
          type: 'message.error',
          spaceSlug: this.spaceSlug || '',
          timestamp: new Date().toISOString(),
          error: 'Invalid message format',
          rawData: data,
        };
        this.emit('message.error', errorMessage);
        return;
      }

      // 개발 환경에서만 상세 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Parsed message:', message);
        debugWebSocketMessage(message);
      }

      // 핑/퐁 메시지 처리 (빠른 리턴)
      if (message.type === 'pong') {
        this.lastPongTime = Date.now();
        return;
      }

      // connection.established 이벤트 처리
      if (message.type === 'connection.established') {
        this.isConnected = true;
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
      
      // 개발 환경에서만 상태 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebSocket] Connection established, state updated:', {
          isConnected: this.isConnected,
          connectionState: this.connectionState,
          wsReadyState: this.ws?.readyState
        });
      }
    }

    // 등록된 핸들러들에게 메시지 전달 (비동기 처리로 성능 최적화)
    const handlers = this.eventHandlers.get(message.type);
    if (handlers && handlers.length > 0) {
      // 개발 환경에서만 핸들러 수 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WebSocket] Found ${handlers.length} handlers for message type: ${message.type}`);
      }
      
      // 핸들러들을 비동기로 실행하여 블로킹 방지
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocket] 핸들러 실행 에러:', error);
          // 개별 핸들러 에러가 전체 시스템에 영향을 주지 않도록
          const errorMessage: IncomingWebSocketMessage = {
            type: 'message.error',
            spaceSlug: this.spaceSlug || '',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error : new Error(String(error)),
            message,
          };
          this.emit('message.error', errorMessage);
        }
      });
    } else {
      if (process.env.NODE_ENV === 'development' && (message.type as string) !== 'pong') {
        console.warn(`[WebSocket] No handlers found for message type: ${message.type}`);
      }
    }
    }, 0);
  }


  /**
   * 재연결을 스케줄링합니다 (지수 백오프)
   */
  private scheduleReconnect(): void {
    // 최대 재연결 시도 횟수 도달 시 중단
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = 'error';
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WebSocket] 최대 재연결 시도 횟수 도달, 재연결 중단');
      }
      return;
    }

    // 이미 재연결 예정인 경우 중복 방지
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = 'reconnecting';

    // 지수 백오프 계산 (최대 30초)
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    // 개발 환경에서만 재연결 이벤트 emit
    if (process.env.NODE_ENV === 'development') {
      this.emit('connection.reconnecting', {
        type: 'connection.reconnecting',
        spaceSlug: this.spaceSlug || '',
        timestamp: new Date().toISOString(),
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        nextRetryIn: delay,
      });
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      // 최대 재시도 횟수 재확인 (타이머 동안 변경될 수 있음)
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.connectionState = 'error';
        return;
      }

      if (this.userID && this.spaceSlug) {
        this.connect(this.userID, this.spaceSlug).catch(_error => {
          // 프로덕션에서는 조용히 처리
          if (process.env.NODE_ENV === 'development') {
            console.warn('[WebSocket] 재연결 실패, 다시 시도합니다');
          }

          // 재연결 실패 시 다시 스케줄링 (최대 횟수 체크 포함)
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            this.connectionState = 'error';
          }
        });
      }
    }, delay);
  }

  /**
   * 연결 상태를 반환합니다
   */
  get connectionStatus(): ConnectionState {
    return this.connectionState;
  }

  /**
   * 디버깅을 위한 상태 정보 출력
   */
  debugInfo(): void {
    /* eslint-disable no-console */
    console.group('[WebSocket Debug Info]');
    console.log('연결 상태:', this.connectionState);
    console.log('WebSocket 연결:', this.isConnected);
    console.log('사용자 ID:', this.userID);
    console.log('스페이스 슬러그:', this.spaceSlug);
    console.log('구독 수:', this.subscriptions.size);
    console.log('등록된 이벤트 핸들러:');
    this.eventHandlers.forEach((handlers, eventType) => {
      console.log(`  ${eventType}: ${handlers.length}개`);
    });
    console.log('현재 구독 정보:');
    console.log('  댓글 구독 포스트 ID:', this.getSubscribedPostIds());
    console.log('  리액션 구독 포스트 ID:', this.getSubscribedReactionPostIds());
    console.log('  포스트 구독 스페이스 슬러그:', this.getSubscribedPostSpaceSlugs());
    console.groupEnd();
    /* eslint-enable no-console */
  }
}

// 싱글톤 인스턴스 생성
export const websocketService = new WebSocketService();

// 개발 환경에서 전역 디버깅 헬퍼 등록
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugWebSocket = () => websocketService.debugInfo();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).wsService = websocketService;
}

// React 훅을 위한 타입 내보내기
export type { WebSocketEventHandler, WebSocketEventType, IncomingWebSocketMessage, WebSocketHandlers };
