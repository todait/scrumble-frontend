/**
 * WebSocket 메시지 타입 정의
 * 백엔드와 주고받는 모든 WebSocket 메시지의 타입을 정의합니다.
 */

// 이미지 메타데이터 타입 (Feed와 공유)
export interface ImageMetadata {
  url: string;
  width: number;
  height: number;
  alt?: string;
}

// 기본 메시지 구조
interface BaseWebSocketMessage {
  type: string;
  spaceSlug: string;
  timestamp: string;
}

// 댓글 생성 메시지
export interface CommentCreatedMessage extends BaseWebSocketMessage {
  type: 'comment.created';
  postId: string;
  comment: {
    id: string;
    author: {
      id: string;
      name: string;
      avatarURL: string;
    };
    content: string;
    createdAt: string;
    images?: ImageMetadata[];
  };
}

// 댓글 수정 메시지
export interface CommentUpdatedMessage extends BaseWebSocketMessage {
  type: 'comment.updated';
  postId: string;
  comment: {
    id: string;
    content: string;
    updatedAt: string;
    images?: ImageMetadata[];
  };
}

// 댓글 삭제 메시지
export interface CommentDeletedMessage extends BaseWebSocketMessage {
  type: 'comment.deleted';
  postId: string;
  commentId: string;
}

// 연결 상태 메시지
export interface ConnectionEstablishedMessage extends BaseWebSocketMessage {
  type: 'connection.established';
  postId: string;
  userId: string;
  data?: any;
}

export interface ConnectionReconnectingMessage extends BaseWebSocketMessage {
  type: 'connection.reconnecting';
  attempt: number;
  maxAttempts: number;
  nextRetryIn: number;
}

export interface ConnectionFailedMessage extends BaseWebSocketMessage {
  type: 'connection.failed';
  reason: string;
  attempts: number;
}

// 에러 메시지
export interface MessageErrorMessage extends BaseWebSocketMessage {
  type: 'message.error';
  error: string | Error;
  rawData?: string;
  message?: IncomingWebSocketMessage;
}

// 구독 메시지 (클라이언트 -> 서버)
export interface SubscribeMessage {
  type: 'subscribe';
  spaceSlug: string;
  postId: string;
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  spaceSlug: string;
  postId: string;
}

// 배치 구독 메시지
export interface BatchSubscribeMessage {
  type: 'batchSubscribe';
  spaceSlug: string;
  postIds: string[];
}

export interface BatchUnsubscribeMessage {
  type: 'batchUnsubscribe';
  spaceSlug: string;
  postIds: string[];
}

// Heartbeat 메시지
export interface PingMessage {
  type: 'ping';
}

export interface PongMessage extends BaseWebSocketMessage {
  type: 'pong';
}

// 구독 응답 메시지
export interface SubscriptionResponseMessage extends BaseWebSocketMessage {
  type: 'subscription.response';
  postId: string;
  success: boolean;
  message?: string;
}

// 서버에서 받는 모든 메시지의 유니온 타입
export type IncomingWebSocketMessage = 
  | CommentCreatedMessage
  | CommentUpdatedMessage
  | CommentDeletedMessage
  | ConnectionEstablishedMessage
  | ConnectionReconnectingMessage
  | ConnectionFailedMessage
  | MessageErrorMessage
  | PongMessage
  | SubscriptionResponseMessage;

// 클라이언트에서 보내는 모든 메시지의 유니온 타입
export type OutgoingWebSocketMessage =
  | SubscribeMessage
  | UnsubscribeMessage
  | BatchSubscribeMessage
  | BatchUnsubscribeMessage
  | PingMessage;

// 모든 웹소켓 메시지의 유니온 타입
export type WebSocketMessage = IncomingWebSocketMessage | OutgoingWebSocketMessage;

// 이벤트 타입 추출
export type WebSocketEventType = WebSocketMessage['type'];

// 타입 가드 함수들
export const isCommentCreatedMessage = (msg: WebSocketMessage): msg is CommentCreatedMessage => 
  msg.type === 'comment.created';

export const isCommentUpdatedMessage = (msg: WebSocketMessage): msg is CommentUpdatedMessage => 
  msg.type === 'comment.updated';

export const isCommentDeletedMessage = (msg: WebSocketMessage): msg is CommentDeletedMessage => 
  msg.type === 'comment.deleted';

export const isConnectionEstablishedMessage = (msg: WebSocketMessage): msg is ConnectionEstablishedMessage =>
  msg.type === 'connection.established';

export const isConnectionReconnectingMessage = (msg: WebSocketMessage): msg is ConnectionReconnectingMessage =>
  msg.type === 'connection.reconnecting';

export const isConnectionFailedMessage = (msg: WebSocketMessage): msg is ConnectionFailedMessage =>
  msg.type === 'connection.failed';

export const isMessageErrorMessage = (msg: WebSocketMessage): msg is MessageErrorMessage =>
  msg.type === 'message.error';

export const isPongMessage = (msg: WebSocketMessage): msg is PongMessage =>
  msg.type === 'pong';

// 이벤트 핸들러 타입
export type WebSocketEventHandler<T extends IncomingWebSocketMessage = IncomingWebSocketMessage> = (message: T) => void;

// 타입별 핸들러 맵
export interface WebSocketHandlers {
  'comment.created'?: WebSocketEventHandler<CommentCreatedMessage>;
  'comment.updated'?: WebSocketEventHandler<CommentUpdatedMessage>;
  'comment.deleted'?: WebSocketEventHandler<CommentDeletedMessage>;
  'connection.established'?: WebSocketEventHandler<ConnectionEstablishedMessage>;
  'connection.reconnecting'?: WebSocketEventHandler<ConnectionReconnectingMessage>;
  'connection.failed'?: WebSocketEventHandler<ConnectionFailedMessage>;
  'message.error'?: WebSocketEventHandler<MessageErrorMessage>;
  'pong'?: WebSocketEventHandler<PongMessage>;
}

// 연결 상태 타입
export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

// WebSocket 구독 정보 (deprecated - use SubscribeMessage instead)
export interface WebSocketSubscription {
  type: 'subscribe' | 'unsubscribe';
  spaceSlug: string;
  postId: string;
}

// 특정 메시지 타입 추출 헬퍼
export type ExtractMessageType<T extends WebSocketEventType> = Extract<IncomingWebSocketMessage, { type: T }>;