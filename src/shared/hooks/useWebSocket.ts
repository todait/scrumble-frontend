/**
 * WebSocket을 사용하기 위한 React 훅
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TokenManager } from '../lib/token';
import {
  WebSocketEventHandler,
  WebSocketEventType,
  websocketService,
} from '../services/websocket.service';
import type { ExtractMessageType, IncomingWebSocketMessage } from '../types/websocket.types';
import { debug } from '../utils/debug';
import { useAuth } from './auth/useAuth';
import { useDebounce } from './useDebounce';

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
  // 타입 안전한 이벤트 리스너 함수들
  addEventListener: <T extends WebSocketEventType>(
    eventType: T,
    handler: WebSocketEventHandler<ExtractMessageType<T>>
  ) => void;
  removeEventListener: <T extends WebSocketEventType>(
    eventType: T,
    handler: WebSocketEventHandler<ExtractMessageType<T>>
  ) => void;
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
  const eventHandlersRef = useRef<Map<WebSocketEventType, WebSocketEventHandler[]>>(new Map());
  const subscriptionTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastVisiblePostIdsRef = useRef<Set<string>>(new Set());
  const [wsConnected, setWsConnected] = useState(false);

  // 스크롤 시 과도한 구독/해제 방지를 위한 디바운스
  const debouncedVisibleIds = useDebounce(visiblePostIds, 150);

  // 연결 상태 핸들러 (유일한 기본 핸들러)
  const handleConnectionEstablished = useCallback((message: IncomingWebSocketMessage) => {
    if (message.type === 'connection.established') {
      debug('useWebSocket', 'Connection established, updating React state');
      setWsConnected(true);
    }
  }, []);

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

  // Viewport 기반 자동 구독 관리 (디바운스 적용) - 통합된 효과
  useEffect(() => {
    // 조건 체크: 연결되지 않았거나 모든 댓글 구독 모드이거나 보이는 포스트가 없으면 스킵
    if (!wsConnected || subscribeToAllComments || debouncedVisibleIds.length === 0) {
      return;
    }

    const currentVisibleSet = new Set<string>(debouncedVisibleIds);
    const previousVisibleSet = lastVisiblePostIdsRef.current;

    // 현재 보이는 포스트 ID들과 이전 ID들을 비교
    const isInitialLoad = previousVisibleSet.size === 0;
    const hasChanged = !isInitialLoad && (
      currentVisibleSet.size !== previousVisibleSet.size ||
      [...currentVisibleSet].some(id => !previousVisibleSet.has(id)) ||
      [...previousVisibleSet].some(id => !currentVisibleSet.has(id))
    );

    // 초기 로드이거나 실제로 변경된 경우에만 처리
    if (isInitialLoad || hasChanged) {
      // 이미 구독된 포스트 ID들 확인
      const subscribedComments = websocketService.getSubscribedPostIds();
      const subscribedReactions = websocketService.getSubscribedReactionPostIds();

      // 새로 구독할 포스트들 (현재 보이는 것 중 아직 구독되지 않은 것들)
      const newCommentSubscriptions = debouncedVisibleIds.filter(
        (postId: string) => !subscribedComments.includes(postId)
      );
      const newReactionSubscriptions = debouncedVisibleIds.filter(
        (postId: string) => !subscribedReactions.includes(postId)
      );

      // 새로 구독할 포스트가 있을 때만 구독 시도
      if (newCommentSubscriptions.length > 0 || newReactionSubscriptions.length > 0) {
        try {
          // 배치 구독 (중복 방지됨)
          if (newCommentSubscriptions.length > 0) {
            batchSubscribeToComments(newCommentSubscriptions);
          }
          if (newReactionSubscriptions.length > 0) {
            batchSubscribeToReactions(newReactionSubscriptions);
          }
        } catch (error) {
          console.error('[WS] Batch subscribe failed, falling back to individual:', error);
          newCommentSubscriptions.forEach((postId: string) => subscribeToComments(postId));
          newReactionSubscriptions.forEach((postId: string) => subscribeToReactions(postId));
        }
      }

      // 더 이상 보이지 않는 포스트들 지연 구독 해제 (초기 로드가 아닌 경우에만)
      if (!isInitialLoad) {
        const noLongerVisible = Array.from(previousVisibleSet).filter(
          (id: string) => !currentVisibleSet.has(id)
        );

        if (noLongerVisible.length > 0) {
          noLongerVisible.forEach((postId: string) => {
            // 기존 타이머가 있다면 취소
            const existingTimer = subscriptionTimersRef.current.get(postId);
            if (existingTimer) {
              clearTimeout(existingTimer);
            }

            // 30초 후 구독 해제 (다시 스크롤해서 보일 수 있으므로)
            const timer = setTimeout(() => {
              const stillNotVisible = !debouncedVisibleIds.includes(postId);
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
      }

      // 현재 보이는 포스트 ID 업데이트
      lastVisiblePostIdsRef.current = currentVisibleSet;
    }
  }, [
    wsConnected,
    debouncedVisibleIds,
    subscribeToAllComments,
    // 함수들은 useCallback으로 메모이제이션되어 있으므로 의존성에서 제거
  ]);

  // 타입 안전한 이벤트 리스너 추가 함수
  const addEventListener = useCallback(
    <T extends WebSocketEventType>(
      eventType: T,
      handler: WebSocketEventHandler<ExtractMessageType<T>>
    ) => {
      // 핸들러 참조 저장 (cleanup을 위해)
      if (!eventHandlersRef.current.has(eventType)) {
        eventHandlersRef.current.set(eventType, []);
      }
      eventHandlersRef.current.get(eventType)!.push(handler as WebSocketEventHandler);

      // WebSocket 서비스에 핸들러 등록
      websocketService.addEventListener(eventType, handler as WebSocketEventHandler);
    },
    []
  );

  // 타입 안전한 이벤트 리스너 제거 함수
  const removeEventListener = useCallback(
    <T extends WebSocketEventType>(
      eventType: T,
      handler: WebSocketEventHandler<ExtractMessageType<T>>
    ) => {
      // 핸들러 참조에서 제거
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler as WebSocketEventHandler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }

      // WebSocket 서비스에서 핸들러 제거
      websocketService.removeEventListener(eventType, handler as WebSocketEventHandler);
    },
    []
  );

  // 자동 연결 및 정리 - 초기 로드 후 지연 실행
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let connectionTimeout: NodeJS.Timeout | undefined;

    if (autoConnect && user?.id) {
      // 토큰이 있는지 확인 후 연결
      const token = TokenManager.getAccessToken();
      if (token) {
        // 프로덕션에서는 더 긴 지연으로 초기 로드 완료 보장 (500ms)
        const delay = process.env.NODE_ENV === 'production' ? 500 : 100;
        connectionTimeout = setTimeout(() => {
          // 연결 및 핸들러 등록
          const setupConnection = async () => {
            try {
              debug('useWebSocket', 'Starting WebSocket connection after initial load');

              // 프로덕션에서는 연결 Promise를 즉시 resolve하여 UI 블로킹 방지
              if (process.env.NODE_ENV === 'production') {
                websocketService.connect(user.id, spaceSlug).catch(() => {
                  // 프로덕션에서는 조용히 처리 (재연결은 WebSocket 서비스가 자동으로 처리)
                });
              } else {
                await websocketService.connect(user.id, spaceSlug);
              }

              // 연결 상태 핸들러만 등록
              websocketService.addEventListener(
                'connection.established',
                handleConnectionEstablished
              );

              // cleanup 함수 설정
              cleanup = () => {
                // 타이머 정리
                subscriptionTimersRef.current.forEach(timer => clearTimeout(timer));
                subscriptionTimersRef.current.clear();

                // 이벤트 핸들러 제거
                websocketService.removeEventListener(
                  'connection.established',
                  handleConnectionEstablished
                );

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
                console.warn('[WS] WebSocket 일시적 연결 실패 (재연결 시도 중)');
              } else {
                console.error('[WS] WebSocket 연결 실패:', error);
              }
            }
          };

          setupConnection();
        }, delay);
      } else {
        console.warn('[WS] 인증 토큰이 없어 WebSocket 연결을 건너뜁니다.');
      }
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [autoConnect, user?.id, spaceSlug, handleConnectionEstablished]);

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
    // 타입 안전한 이벤트 리스너 함수들
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
