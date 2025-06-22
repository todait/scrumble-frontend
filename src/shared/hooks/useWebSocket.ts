/**
 * WebSocket을 사용하기 위한 React 훅
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  websocketService,
  WebSocketEventType,
  WebSocketEventHandler,
  WebSocketMessage,
} from '../services/websocket.service';
import { useAuth } from './auth/useAuth';
import { commentsKeys } from './queries/commentsKeys';
import { postsKeys } from './queries/postsKeys';
import { TokenManager } from '../lib/token';

interface UseWebSocketOptions {
  spaceSlug: string;
  autoConnect?: boolean; // 자동 연결 여부 (기본값: true)
}

interface UseWebSocketReturn {
  connected: boolean;
  subscribeToComments: (postId: string) => void;
  unsubscribeFromComments: (postId: string) => void;
  addEventListener: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
  removeEventListener: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
}

/**
 * WebSocket 연결과 이벤트를 관리하는 훅
 */
export function useWebSocket({
  spaceSlug,
  autoConnect = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventHandlersRef = useRef<Map<WebSocketEventType, WebSocketEventHandler[]>>(new Map());

  // 댓글 관련 쿼리 무효화 함수
  const invalidateCommentQueries = useCallback(
    (postId: string) => {
      // 특정 포스트의 댓글 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: commentsKeys.list(postId),
      });

      // 포스트 목록 쿼리도 무효화 (댓글 수 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(),
      });
    },
    [queryClient]
  );

  // 기본 이벤트 핸들러들
  const handleCommentCreated = useCallback(
    (message: WebSocketMessage) => {
      invalidateCommentQueries(message.postId);
    },
    [invalidateCommentQueries]
  );

  const handleCommentUpdated = useCallback(
    (message: WebSocketMessage) => {
      invalidateCommentQueries(message.postId);
    },
    [invalidateCommentQueries]
  );

  const handleCommentDeleted = useCallback(
    (message: WebSocketMessage) => {
      invalidateCommentQueries(message.postId);
    },
    [invalidateCommentQueries]
  );


  // 댓글 구독 함수
  const subscribeToComments = useCallback((postId: string) => {
    websocketService.subscribeToComments(postId);
  }, []);

  // 댓글 구독 해제 함수
  const unsubscribeFromComments = useCallback((postId: string) => {
    websocketService.unsubscribeFromComments(postId);
  }, []);

  // 이벤트 리스너 추가 함수
  const addEventListener = useCallback(
    (eventType: WebSocketEventType, handler: WebSocketEventHandler) => {
      // 핸들러 참조 저장 (cleanup을 위해)
      if (!eventHandlersRef.current.has(eventType)) {
        eventHandlersRef.current.set(eventType, []);
      }
      eventHandlersRef.current.get(eventType)!.push(handler);

      // WebSocket 서비스에 핸들러 등록
      websocketService.addEventListener(eventType, handler);
    },
    []
  );

  // 이벤트 리스너 제거 함수
  const removeEventListener = useCallback(
    (eventType: WebSocketEventType, handler: WebSocketEventHandler) => {
      // 핸들러 참조에서 제거
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }

      // WebSocket 서비스에서 핸들러 제거
      websocketService.removeEventListener(eventType, handler);
    },
    []
  );

  // 자동 연결 및 정리
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (autoConnect && user?.id) {
      // 토큰이 있는지 확인 후 연결
      const token = TokenManager.getAccessToken();
      if (token) {
        // 연결 및 핸들러 등록
        const setupConnection = async () => {
          try {
            await websocketService.connect(user.id, spaceSlug);

            // 기본 이벤트 핸들러 등록
            websocketService.addEventListener('comment.created', handleCommentCreated);
            websocketService.addEventListener('comment.updated', handleCommentUpdated);
            websocketService.addEventListener('comment.deleted', handleCommentDeleted);

            // cleanup 함수 설정
            cleanup = () => {
              // 이벤트 핸들러 제거
              websocketService.removeEventListener('comment.created', handleCommentCreated);
              websocketService.removeEventListener('comment.updated', handleCommentUpdated);
              websocketService.removeEventListener('comment.deleted', handleCommentDeleted);

              // 사용자 정의 핸들러들 제거
              eventHandlersRef.current.forEach((handlers, eventType) => {
                handlers.forEach(handler => {
                  websocketService.removeEventListener(eventType, handler);
                });
              });
              eventHandlersRef.current.clear();

              websocketService.disconnect();
            };
          } catch (error) {
            // 개발 환경에서는 핫 리로드로 인한 일시적 연결 실패가 정상적임
            if (process.env.NODE_ENV === 'development') {
              console.warn('[useWebSocket] WebSocket 일시적 연결 실패 (재연결 시도 중)');
            } else {
              console.error('[useWebSocket] WebSocket 연결 실패:', error);
            }
          }
        };

        setupConnection();
      } else {
        console.warn('[useWebSocket] 인증 토큰이 없어 WebSocket 연결을 건너뜁니다.');
      }
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [autoConnect, user?.id, spaceSlug]);

  return {
    connected: websocketService.connected,
    subscribeToComments,
    unsubscribeFromComments,
    addEventListener,
    removeEventListener,
  };
}

/**
 * 특정 포스트의 댓글에 대한 WebSocket 구독을 관리하는 훅
 */
export function useCommentWebSocket(spaceSlug: string, postId: string) {
  const webSocket = useWebSocket({ spaceSlug });

  useEffect(() => {
    if (webSocket.connected && postId) {
      // 댓글 구독
      webSocket.subscribeToComments(postId);

      // 컴포넌트 언마운트 시 구독 해제
      return () => {
        webSocket.unsubscribeFromComments(postId);
      };
    }
  }, [webSocket.connected, postId, webSocket.subscribeToComments, webSocket.unsubscribeFromComments]);

  return {
    connected: webSocket.connected,
    subscribeToComments: webSocket.subscribeToComments,
    unsubscribeFromComments: webSocket.unsubscribeFromComments,
  };
}
