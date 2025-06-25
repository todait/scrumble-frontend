/**
 * WebSocket을 사용하기 위한 React 훅
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TokenManager } from '../lib/token';
import {
  WebSocketEventHandler,
  WebSocketEventType,
  websocketService,
} from '../services/websocket.service';
import type { IncomingWebSocketMessage } from '../types/websocket.types';
import { useAuth } from './auth/useAuth';
import { commentsKeys } from './queries/commentsKeys';
import { postsKeys } from './queries/postsKeys';

interface UseWebSocketOptions {
  spaceSlug: string;
  autoConnect?: boolean; // 자동 연결 여부 (기본값: true)
  subscribeToAllComments?: boolean; // 모든 댓글 구독 여부 (기본값: false)
  visiblePostIds?: string[]; // 현재 보이는 포스트 ID들
}

interface UseWebSocketReturn {
  connected: boolean;
  // 댓글 구독 함수들
  subscribeToComments: (postId: string) => void;
  unsubscribeFromComments: (postId: string) => void;
  batchSubscribeToComments: (postIds: string[]) => void;
  batchUnsubscribeFromComments: (postIds: string[]) => void;
  // 리액션 구독 함수들
  subscribeToReactions: (postId: string) => void;
  unsubscribeFromReactions: (postId: string) => void;
  batchSubscribeToReactions: (postIds: string[]) => void;
  batchUnsubscribeFromReactions: (postIds: string[]) => void;
  // 이벤트 리스너 함수들
  addEventListener: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
  removeEventListener: (eventType: WebSocketEventType, handler: WebSocketEventHandler) => void;
}

/**
 * WebSocket 연결과 이벤트를 관리하는 훅
 */
export function useWebSocket({
  spaceSlug,
  autoConnect = true,
  subscribeToAllComments = false,
  visiblePostIds = [],
}: UseWebSocketOptions): UseWebSocketReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventHandlersRef = useRef<Map<WebSocketEventType, WebSocketEventHandler[]>>(new Map());
  const subscriptionTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastVisiblePostIdsRef = useRef<Set<string>>(new Set());
  const [wsConnected, setWsConnected] = useState(false);

  // 댓글 관련 쿼리 무효화 함수
  const invalidateCommentQueries = useCallback(
    (postId: string) => {
      // 특정 포스트의 댓글 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: commentsKeys.list(postId),
      });

      // 포스트 목록 쿼리도 무효화 (댓글 수 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(spaceSlug),
      });
    },
    [queryClient, spaceSlug]
  );

  // 기본 이벤트 핸들러들
  const handleConnectionEstablished = useCallback(
    (message: IncomingWebSocketMessage) => {
      if (message.type === 'connection.established') {
        console.log('[useWebSocket] Connection established, updating React state');
        setWsConnected(true);
      }
    },
    []
  );

  const handleCommentCreated = useCallback(
    (message: IncomingWebSocketMessage) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] handleCommentCreated called with:', message);
      }
      
      if (message.type === 'comment.created') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useWebSocket] Processing comment.created for postId:', message.data?.postId);
        }
        
        // 안전하게 postId 추출
        const postId = message.data?.postId || message.postId;
        if (postId) {
          invalidateCommentQueries(postId);
        } else {
          console.warn('[useWebSocket] No postId found in comment.created message:', message);
        }
      }
    },
    [invalidateCommentQueries]
  );

  const handleCommentUpdated = useCallback(
    (message: IncomingWebSocketMessage) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] handleCommentUpdated called with:', message);
      }
      
      if (message.type === 'comment.updated') {
        const postId = message.data?.postId || message.postId;
        if (postId) {
          invalidateCommentQueries(postId);
        } else {
          console.warn('[useWebSocket] No postId found in comment.updated message:', message);
        }
      }
    },
    [invalidateCommentQueries]
  );

  const handleCommentDeleted = useCallback(
    (message: IncomingWebSocketMessage) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] handleCommentDeleted called with:', message);
      }
      
      if (message.type === 'comment.deleted') {
        const postId = message.data?.postId || message.postId;
        if (postId) {
          invalidateCommentQueries(postId);
        } else {
          console.warn('[useWebSocket] No postId found in comment.deleted message:', message);
        }
      }
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

  // 배치 구독 함수
  const batchSubscribeToComments = useCallback((postIds: string[]) => {
    websocketService.batchSubscribeToComments(postIds);
  }, []);

  // 배치 구독 해제 함수
  const batchUnsubscribeFromComments = useCallback((postIds: string[]) => {
    websocketService.batchUnsubscribeFromComments(postIds);
  }, []);

  // 리액션 구독 함수
  const subscribeToReactions = useCallback((postId: string) => {
    websocketService.subscribeToReactions(postId);
  }, []);

  // 리액션 구독 해제 함수
  const unsubscribeFromReactions = useCallback((postId: string) => {
    websocketService.unsubscribeFromReactions(postId);
  }, []);

  // 배치 리액션 구독 함수
  const batchSubscribeToReactions = useCallback((postIds: string[]) => {
    websocketService.batchSubscribeToReactions(postIds);
  }, []);

  // 배치 리액션 구독 해제 함수
  const batchUnsubscribeFromReactions = useCallback((postIds: string[]) => {
    websocketService.batchUnsubscribeFromReactions(postIds);
  }, []);

  // Viewport 기반 자동 구독 관리
  useEffect(() => {
    console.log('[useWebSocket] Viewport subscription effect triggered', {
      wsConnected,
      websocketServiceConnected: websocketService.connected,
      subscribeToAllComments,
      visiblePostIdsLength: visiblePostIds.length,
      visiblePostIds
    });

    if (!wsConnected || subscribeToAllComments || visiblePostIds.length === 0) {
      console.log('[useWebSocket] Subscription skipped:', {
        wsConnected,
        websocketServiceConnected: websocketService.connected,
        subscribeToAllComments,
        visiblePostIdsLength: visiblePostIds.length
      });
      return;
    }

    const currentVisibleSet = new Set(visiblePostIds);
    const previousVisibleSet = lastVisiblePostIdsRef.current;

    // 새로 보이게 된 포스트들
    const newlyVisible = visiblePostIds.filter(id => !previousVisibleSet.has(id));

    // 더 이상 보이지 않는 포스트들
    const noLongerVisible = Array.from(previousVisibleSet).filter(id => !currentVisibleSet.has(id));

    // 새로 보이는 포스트들 구독
    if (newlyVisible.length > 0) {
      // 지연 구독 타이머가 있다면 취소
      newlyVisible.forEach(postId => {
        const timer = subscriptionTimersRef.current.get(postId);
        if (timer) {
          clearTimeout(timer);
          subscriptionTimersRef.current.delete(postId);
        }
      });

      // 댓글과 리액션 배치 구독
      try {
        console.log('[useWebSocket] Attempting batch subscribe for posts:', newlyVisible);
        batchSubscribeToComments(newlyVisible);
        batchSubscribeToReactions(newlyVisible);
        
        // 배치 구독 후에도 개별 구독 시도 (임시 디버깅용)
        if (process.env.NODE_ENV === 'development') {
          console.log('[useWebSocket] Also trying individual subscriptions for debugging');
          newlyVisible.forEach(postId => {
            subscribeToComments(postId);
            subscribeToReactions(postId);
          });
        }
      } catch (error) {
        console.error('[useWebSocket] Batch subscribe failed, falling back to individual:', error);
        newlyVisible.forEach(postId => {
          subscribeToComments(postId);
          subscribeToReactions(postId);
        });
      }
    }

    // 더 이상 보이지 않는 포스트들 지연 구독 해제
    if (noLongerVisible.length > 0) {
      noLongerVisible.forEach(postId => {
        // 기존 타이머가 있다면 취소
        const existingTimer = subscriptionTimersRef.current.get(postId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // 30초 후 구독 해제 (다시 스크롤해서 보일 수 있으므로)
        const timer = setTimeout(() => {
          const stillNotVisible = !visiblePostIds.includes(postId);
          if (stillNotVisible) {
            // 댓글과 리액션 구독 해제
            batchUnsubscribeFromComments([postId]);
            batchUnsubscribeFromReactions([postId]);
          }
          subscriptionTimersRef.current.delete(postId);
        }, 30000); // 30초 지연

        subscriptionTimersRef.current.set(postId, timer);
      });
    }

    // 현재 보이는 포스트 ID 업데이트
    lastVisiblePostIdsRef.current = currentVisibleSet;
  }, [wsConnected, visiblePostIds, subscribeToAllComments, batchSubscribeToComments, batchUnsubscribeFromComments, batchSubscribeToReactions, batchUnsubscribeFromReactions, subscribeToComments, subscribeToReactions]);

  // WebSocket 연결 상태 변화 감지하여 재구독
  useEffect(() => {
    console.log('[useWebSocket] Connection state changed:', {
      wsConnected,
      websocketServiceConnected: websocketService.connected,
      visiblePostIdsLength: visiblePostIds.length
    });

    if (wsConnected && visiblePostIds.length > 0 && !subscribeToAllComments) {
      console.log('[useWebSocket] Re-subscribing due to connection state change');
      // 연결이 완료된 후 현재 보이는 포스트들에 대해 구독
      try {
        batchSubscribeToComments(visiblePostIds);
        batchSubscribeToReactions(visiblePostIds);
        // 디버깅용 개별 구독도 시도
        visiblePostIds.forEach(postId => {
          subscribeToComments(postId);
          subscribeToReactions(postId);
        });
      } catch (error) {
        console.error('[useWebSocket] Subscription failed after connection:', error);
      }
    }
  }, [wsConnected, visiblePostIds, subscribeToAllComments, batchSubscribeToComments, batchSubscribeToReactions, subscribeToComments, subscribeToReactions]);

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
            websocketService.addEventListener('connection.established', handleConnectionEstablished);
            websocketService.addEventListener('comment.created', handleCommentCreated);
            websocketService.addEventListener('comment.updated', handleCommentUpdated);
            websocketService.addEventListener('comment.deleted', handleCommentDeleted);

            // cleanup 함수 설정
            cleanup = () => {
              // 타이머 정리
              subscriptionTimersRef.current.forEach(timer => clearTimeout(timer));
              subscriptionTimersRef.current.clear();

              // 이벤트 핸들러 제거
              websocketService.removeEventListener('connection.established', handleConnectionEstablished);
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
  }, [
    autoConnect,
    user?.id,
    spaceSlug,
    handleConnectionEstablished,
    handleCommentCreated,
    handleCommentUpdated,
    handleCommentDeleted,
  ]);

  return {
    connected: websocketService.connected,
    // 댓글 구독 함수들
    subscribeToComments,
    unsubscribeFromComments,
    batchSubscribeToComments,
    batchUnsubscribeFromComments,
    // 리액션 구독 함수들
    subscribeToReactions,
    unsubscribeFromReactions,
    batchSubscribeToReactions,
    batchUnsubscribeFromReactions,
    // 이벤트 리스너 함수들
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    webSocket.connected,
    postId,
    webSocket.subscribeToComments,
    webSocket.unsubscribeFromComments,
  ]);

  return {
    connected: webSocket.connected,
    subscribeToComments: webSocket.subscribeToComments,
    unsubscribeFromComments: webSocket.unsubscribeFromComments,
  };
}
