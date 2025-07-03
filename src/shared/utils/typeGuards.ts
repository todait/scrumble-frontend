/**
 * 타입 가드 및 안전한 타입 변환 유틸리티
 * 런타임에서 타입 안정성을 보장하고 예기치 않은 에러를 방지합니다.
 */

import type { Comment, WebSocketComment } from '@/features/feed/types/feed.types';
import type {
  CommentCreatedMessage,
  CommentDeletedMessage,
  CommentUpdatedMessage,
  ConnectionEstablishedMessage,
  ConnectionFailedMessage,
  ConnectionReconnectingMessage,
  IncomingWebSocketMessage,
  MessageErrorMessage,
} from '@/shared/types/websocket.types';
import { debug as logDebug } from '@/shared/utils/debug';

// 기본 타입 체크 함수들
export const isTruthy = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// WebSocket 메시지 타입 가드들
export const isValidWebSocketMessage = (data: any): data is IncomingWebSocketMessage => {
  return isObject(data) && isString(data.type) && data.type.length > 0 && isString(data.timestamp);
};

export const isValidWebSocketComment = (data: any): data is WebSocketComment => {
  return (
    isObject(data) &&
    isString(data.id) &&
    isObject(data.author) &&
    isString(data.author.id) &&
    isString(data.author.name) &&
    isString(data.author.avatarURL) &&
    isString(data.content) &&
    isString(data.createdAt)
  );
};

// 특정 WebSocket 메시지 타입 검증
export const isCommentCreatedMessage = (data: any): data is CommentCreatedMessage => {
  const isValid = isValidWebSocketMessage(data) && data.type === 'comment.created';
  // 임시로 엄격한 검증 제거

  if (process.env.NODE_ENV === 'development') {
    logDebug('TypeGuard', 'isCommentCreatedMessage check', {
      data,
      isValid,
      hasData: isObject(data.data),
      hasPostIdInData: data.data?.postId,
      hasCommentIdInData: data.data?.commentId,
    });
  }

  return isValid;
};

export const isCommentUpdatedMessage = (data: any): data is CommentUpdatedMessage => {
  const isValid = isValidWebSocketMessage(data) && data.type === 'comment.updated';
  // 임시로 엄격한 검증 제거

  if (process.env.NODE_ENV === 'development') {
    logDebug('TypeGuard', 'isCommentUpdatedMessage check', {
      data,
      isValid,
      hasData: isObject(data.data),
      hasPostIdInData: data.data?.postId,
    });
  }

  return isValid;
};

export const isCommentDeletedMessage = (data: any): data is CommentDeletedMessage => {
  const isValid = isValidWebSocketMessage(data) && data.type === 'comment.deleted';
  // 임시로 엄격한 검증 제거

  if (process.env.NODE_ENV === 'development') {
    logDebug('TypeGuard', 'isCommentDeletedMessage check', {
      data,
      isValid,
      hasData: isObject(data.data),
      hasPostIdInData: data.data?.postId,
    });
  }

  return isValid;
};

export const isConnectionEstablishedMessage = (data: any): data is ConnectionEstablishedMessage => {
  return (
    isValidWebSocketMessage(data) &&
    data.type === 'connection.established' &&
    isString(data.postId) &&
    isString(data.userId)
  );
};

export const isConnectionReconnectingMessage = (
  data: any
): data is ConnectionReconnectingMessage => {
  return (
    isValidWebSocketMessage(data) &&
    data.type === 'connection.reconnecting' &&
    isNumber(data.attempt) &&
    isNumber(data.maxAttempts) &&
    isNumber(data.nextRetryIn)
  );
};

export const isConnectionFailedMessage = (data: any): data is ConnectionFailedMessage => {
  return (
    isValidWebSocketMessage(data) &&
    data.type === 'connection.failed' &&
    isString(data.reason) &&
    isNumber(data.attempts)
  );
};

export const isMessageErrorMessage = (data: any): data is MessageErrorMessage => {
  return (
    isValidWebSocketMessage(data) &&
    data.type === 'message.error' &&
    (isString(data.error) || data.error instanceof Error)
  );
};

// 안전한 변환 함수들
export const safeTransformComment = (
  wsComment: unknown,
  fallback?: Comment
): Comment | undefined => {
  try {
    if (!isValidWebSocketComment(wsComment)) {
      logDebug('TypeGuard', 'Invalid WebSocket comment structure', wsComment);
      return fallback;
    }

    return {
      id: wsComment.id,
      author: {
        id: wsComment.author.id,
        name: wsComment.author.name,
        profileImage: wsComment.author.avatarURL || '',
      },
      content: wsComment.content,
      createdAt: new Date(wsComment.createdAt),
      images: Array.isArray(wsComment.images) ? wsComment.images : [],
    };
  } catch (error) {
    logDebug('TypeGuard', 'Comment transformation error', error);
    return fallback;
  }
};

export const safeParseWebSocketMessage = (data: string): IncomingWebSocketMessage | null => {
  try {
    const parsed = JSON.parse(data);

    if (!isValidWebSocketMessage(parsed)) {
      logDebug('TypeGuard', 'Invalid WebSocket message format', parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    logDebug('TypeGuard', 'WebSocket message parsing error', error);
    return null;
  }
};

// 배치 작업용 유틸리티
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than 0');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// 개발 환경 타입 체크
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};

// React Query 에러 타입 가드
export const isQueryError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.name === 'NetworkError')
  );
};

// 웹소켓 메시지 디버깅 유틸리티
export const debugWebSocketMessage = (message: IncomingWebSocketMessage): void => {
  if (process.env.NODE_ENV === 'development') {
    logDebug('WebSocket', `Group start - ${message.type}`);

    // pong 메시지는 로그를 간소화 (heartbeat이므로 너무 상세할 필요 없음)
    if (message.type === 'pong') {
      logDebug('WebSocket', 'Heartbeat response received');
    } else {
      logDebug('WebSocket', `Timestamp: ${new Date(message.timestamp).toISOString()}`);
      logDebug('WebSocket', `Space: ${message.spaceSlug}`);
      logDebug('WebSocket', 'Payload', message);
    }

    logDebug('WebSocket', `Group end - ${message.type}`);
  }
};

// 성능 모니터링 유틸리티
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    logDebug('Performance', `${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
};

// 비동기 함수 성능 측정
export const measureAsyncPerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    logDebug('Performance', `${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
};

// 데이터 검증 헬퍼
export const validatePostId = (postId: unknown): postId is string => {
  return isString(postId) && postId.length > 0;
};

export const validateSpaceSlug = (spaceSlug: unknown): spaceSlug is string => {
  return isString(spaceSlug) && spaceSlug.length > 0 && /^[a-zA-Z0-9-_]+$/.test(spaceSlug);
};

export const validateCommentId = (commentId: unknown): commentId is string => {
  return isString(commentId) && commentId.length > 0;
};

// 안전한 JSON 파싱
export const safeJsonParse = <T = any>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logDebug('TypeGuard', 'JSON parsing failed', error);
    return fallback;
  }
};

// 환경 변수 검증
export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

export const getOptionalEnvVar = (name: string, defaultValue: string): string => {
  return process.env[name] || defaultValue;
};
