/**
 * WebSocket 서비스
 * 백엔드와 실시간 통신을 위한 WebSocket 연결을 관리합니다.
 */

type WebSocketEventType = 'comment.created' | 'comment.updated' | 'comment.deleted' | 'pong';

interface WebSocketMessage {
  type: WebSocketEventType;
  spaceSlug: string;
  postId: string;
  userId: string;
  data: {
    commentId: string;
    action: string;
    content?: string;
  };
  timestamp: string;
}

interface WebSocketEventHandler {
  (message: WebSocketMessage): void;
}

interface CommentEventMessage {
  postId: string;
  userId: string;
  data: {
    commentId: string;
    action: string;
    content?: string;
  };
}

interface WebSocketSubscription {
  type: string;
  spaceSlug: string;
  postId: string;
}

/**
 * WebSocket 연결을 관리하는 클래스
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1초부터 시작
  private eventHandlers = new Map<string, WebSocketEventHandler[]>();
  private subscriptions = new Map<string, WebSocketSubscription>();
  private connectionPromise: Promise<void> | null = null;

  // 연결 정보
  private userID: string | null = null;
  private spaceSlug: string | null = null;
  private wsUrl: string;

  constructor() {
    // 환경 변수에서 WebSocket URL 가져오기
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
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

    // 이미 연결 중이라면 기존 Promise 반환
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // JWT 토큰 가져오기
        const token = this.getAccessToken();
        if (!token) {
          reject(new Error('인증 토큰이 없습니다.'));
          return;
        }

        // WebSocket URL 구성 (Authorization 헤더는 WebSocket에서 직접 지원하지 않으므로 쿼리로 전달)
        const url = `${this.wsUrl}/spaces/${spaceSlug}?userId=${userID}&spaceSlug=${spaceSlug}&token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(url);

        // 연결 성공 핸들러
        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        };

        // 메시지 수신 핸들러
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // 연결 종료 핸들러
        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.connectionPromise = null;

          // 정상적인 종료가 아니라면 재연결 시도
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // 에러 핸들러
        this.ws.onerror = (error) => {
          this.connectionPromise = null;
          // 개발 환경에서는 핫 리로드로 인한 일시적 연결 실패가 정상적임
          if (process.env.NODE_ENV === 'development') {
            reject(new Error('WebSocket connection temporarily failed'));
          } else {
            reject(new Error('WebSocket 연결에 실패했습니다.'));
          }
        };

        // 연결 타임아웃 설정 (10초)
        setTimeout(() => {
          if (!this.isConnected) {
            this.connectionPromise = null;
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 10000);

      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * WebSocket 연결을 종료합니다
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.isConnected = false;
    this.eventHandlers.clear();
    this.subscriptions.clear();
    this.connectionPromise = null;
  }

  /**
   * 특정 포스트의 댓글 이벤트를 구독합니다
   */
  subscribeToComments(postId: string): void {
    if (!this.isConnected || !this.spaceSlug) {
      console.warn('[WebSocket] 연결되지 않았거나 스페이스 정보가 없음');
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

    const unsubscription = {
      type: 'unsubscribe',
      spaceSlug: this.spaceSlug,
      postId,
    };

    this.subscriptions.delete(subscriptionKey);

    // 백엔드에 구독 해제 요청 전송
    this.sendMessage(unsubscription);
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
  private sendMessage(message: object): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * 백엔드로부터 받은 메시지를 처리합니다
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      // 핑/퐁 메시지 처리
      if (message.type === 'pong') {
        return;
      }

      // 등록된 핸들러들에게 메시지 전달
      const handlers = this.eventHandlers.get(message.type);
      if (handlers && handlers.length > 0) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('[WebSocket] 핸들러 실행 에러:', error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocket] 메시지 파싱 에러:', error);
    }
  }

  /**
   * 재연결을 스케줄링합니다
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    setTimeout(() => {
      if (this.userID && this.spaceSlug) {
        this.connect(this.userID, this.spaceSlug).catch(error => {
          // 개발 환경에서는 재연결 실패 로그 생략 (핫 리로드로 인한 정상적 현상)
        if (process.env.NODE_ENV !== 'development') {
          console.warn('[WebSocket] 재연결 실패, 다시 시도합니다');
        }
        });
      }
    }, delay);
  }
}

// 싱글톤 인스턴스 생성
export const websocketService = new WebSocketService();

// React 훅을 위한 타입 내보내기
export type { WebSocketMessage, WebSocketEventType, WebSocketEventHandler, CommentEventMessage };