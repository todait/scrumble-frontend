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

  // ✅ 댓글 관련 쿼리 무효화 제거
  // useFeedData.ts에서 선택적 캐시 업데이트로 처리하므로 중복 제거
  // 대신 이벤트만 전달하여 각 컴포넌트에서 적절히 처리하도록 함

  // 기본 이벤트 핸들러들
  const handleConnectionEstablished = useCallback((message: IncomingWebSocketMessage) => {
    if (message.type === 'connection.established') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] Connection established, updating React state');
      }
      setWsConnected(true);
    }
  }, []);

  const handleCommentCreated = useCallback((message: IncomingWebSocketMessage) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWebSocket] handleCommentCreated called with:', message);
    }

    if (message.type === 'comment.created') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] Processing comment.created for postId:', message.data?.postId);
        console.log('[useWebSocket] Event forwarded to useFeedData.ts for selective cache update');
      }

      // ✅ invalidateQueries 제거 - useFeedData.ts에서 선택적 캐시 업데이트 처리
      // 이벤트는 자동으로 다른 리스너들에게 전달됨
    }
  }, []);

  const handleCommentUpdated = useCallback((message: IncomingWebSocketMessage) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWebSocket] handleCommentUpdated called with:', message);
      console.log('[useWebSocket] Event forwarded to useFeedData.ts for selective cache update');
    }

    // ✅ invalidateQueries 제거 - useFeedData.ts에서 선택적 캐시 업데이트 처리
    // 이벤트는 자동으로 다른 리스너들에게 전달됨
  }, []);

  const handleCommentDeleted = useCallback((message: IncomingWebSocketMessage) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWebSocket] handleCommentDeleted called with:', message);
      console.log('[useWebSocket] Event forwarded to useFeedData.ts for selective cache update');
    }

    // ✅ invalidateQueries 제거 - useFeedData.ts에서 선택적 캐시 업데이트 처리
    // 이벤트는 자동으로 다른 리스너들에게 전달됨
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

  // Viewport 기반 자동 구독 관리
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWebSocket] Viewport subscription effect triggered', {
        wsConnected,
        websocketServiceConnected: websocketService.connected,
        subscribeToAllComments,
        visiblePostIdsLength: visiblePostIds.length,
        visiblePostIds,
      });
    }

    if (!wsConnected || subscribeToAllComments || visiblePostIds.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWebSocket] Subscription skipped:', {
          wsConnected,
          websocketServiceConnected: websocketService.connected,
          subscribeToAllComments,
          visiblePostIdsLength: visiblePostIds.length,
        });
      }
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

      // 이미 구독된 포스트 확인하여 중복 방지
      const subscribedComments = websocketService.getSubscribedPostIds();
      const subscribedReactions = websocketService.getSubscribedReactionPostIds();

      const newCommentSubscriptions = newlyVisible.filter(
        postId => !subscribedComments.includes(postId)
      );
      const newReactionSubscriptions = newlyVisible.filter(
        postId => !subscribedReactions.includes(postId)
      );

      // 새로 구독할 포스트가 있을 때만 구독 시도
      if (newCommentSubscriptions.length > 0 || newReactionSubscriptions.length > 0) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useWebSocket] Attempting batch subscribe for posts:', {
              newCommentSubscriptions,
              newReactionSubscriptions,
              alreadySubscribedComments: subscribedComments,
              alreadySubscribedReactions: subscribedReactions,
            });
          }

          // 배치 구독 (중복 방지됨)
          if (newCommentSubscriptions.length > 0) {
            batchSubscribeToComments(newCommentSubscriptions);
          }
          if (newReactionSubscriptions.length > 0) {
            batchSubscribeToReactions(newReactionSubscriptions);
          }
        } catch (error) {
          console.error(
            '[useWebSocket] Batch subscribe failed, falling back to individual:',
            error
          );
          newCommentSubscriptions.forEach(postId => subscribeToComments(postId));
          newReactionSubscriptions.forEach(postId => subscribeToReactions(postId));
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log(
          '[useWebSocket] All newly visible posts already subscribed, skipping subscription'
        );
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
  }, [
    wsConnected,
    visiblePostIds,
    subscribeToAllComments,
    batchSubscribeToComments,
    batchUnsubscribeFromComments,
    batchSubscribeToReactions,
    batchUnsubscribeFromReactions,
    subscribeToComments,
    subscribeToReactions,
  ]);

  // WebSocket 연결 상태 변화 감지하여 재구독 (중복 방지)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWebSocket] Connection state changed:', {
        wsConnected,
        websocketServiceConnected: websocketService.connected,
        visiblePostIdsLength: visiblePostIds.length,
      });
    }

    // 연결이 완료되고 처음으로 보이는 포스트가 있을 때만 구독
    if (wsConnected && visiblePostIds.length > 0 && !subscribeToAllComments) {
      // 이미 구독된 포스트 ID들 확인
      const subscribedComments = websocketService.getSubscribedPostIds();
      const subscribedReactions = websocketService.getSubscribedReactionPostIds();

      // 아직 구독되지 않은 포스트들만 필터링
      const newCommentSubscriptions = visiblePostIds.filter(
        postId => !subscribedComments.includes(postId)
      );
      const newReactionSubscriptions = visiblePostIds.filter(
        postId => !subscribedReactions.includes(postId)
      );

      if (newCommentSubscriptions.length > 0 || newReactionSubscriptions.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useWebSocket] Subscribing to new posts:', {
            newCommentSubscriptions,
            newReactionSubscriptions,
            alreadySubscribedComments: subscribedComments,
            alreadySubscribedReactions: subscribedReactions,
          });
        }

        try {
          // 배치 구독만 사용 (중복 방지)
          if (newCommentSubscriptions.length > 0) {
            batchSubscribeToComments(newCommentSubscriptions);
          }
          if (newReactionSubscriptions.length > 0) {
            batchSubscribeToReactions(newReactionSubscriptions);
          }
        } catch (error) {
          console.error('[useWebSocket] Subscription failed after connection:', error);
          // 실패 시 개별 구독으로 폴백
          newCommentSubscriptions.forEach(postId => subscribeToComments(postId));
          newReactionSubscriptions.forEach(postId => subscribeToReactions(postId));
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[useWebSocket] All visible posts already subscribed, skipping re-subscription'
          );
        }
      }
    }
  }, [
    wsConnected,
    subscribeToAllComments,
    batchSubscribeToComments,
    batchSubscribeToReactions,
    subscribeToComments,
    subscribeToReactions,
  ]);

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
              if (process.env.NODE_ENV === 'development') {
                console.log('[useWebSocket] Starting WebSocket connection after initial load');
              }

              // 프로덕션에서는 연결 Promise를 즉시 resolve하여 UI 블로킹 방지
              if (process.env.NODE_ENV === 'production') {
                websocketService.connect(user.id, spaceSlug).catch(() => {
                  // 프로덕션에서는 조용히 처리 (재연결은 WebSocket 서비스가 자동으로 처리)
                });
              } else {
                await websocketService.connect(user.id, spaceSlug);
              }

              // 기본 이벤트 핸들러 등록
              websocketService.addEventListener(
                'connection.established',
                handleConnectionEstablished
              );
              websocketService.addEventListener('comment.created', handleCommentCreated);
              websocketService.addEventListener('comment.updated', handleCommentUpdated);
              websocketService.addEventListener('comment.deleted', handleCommentDeleted);

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
        }, delay);
      } else {
        console.warn('[useWebSocket] 인증 토큰이 없어 WebSocket 연결을 건너뜁니다.');
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
