/**
 * Centrifugo WebSocket을 사용하기 위한 React 훅
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  centrifugoService,
  WebSocketEventHandler,
  WebSocketEventType,
} from '../services/centrifugo.service';
import type { ExtractMessageType, IncomingWebSocketMessage } from '../types/websocket.types';
import { debug } from '../utils/debug';
import { createDataSyncCallback, reconnectionManager } from '../utils/reconnection';
import { useAuth } from './auth/useAuth';
import { useDebounce } from './useDebounce';

interface UseCentrifugoOptions {
  spaceSlug: string;
  autoConnect?: boolean; // 자동 연결 여부 (기본값: true)
  subscribeToAllComments?: boolean; // 모든 댓글 구독 여부 (기본값: false)
  visiblePostIds?: string[]; // 현재 보이는 포스트 ID들
  // 재연결 시 데이터 동기화 관련
  onReconnectionDataSync?: () => void; // 재연결 시 호출될 데이터 동기화 함수
  dataSyncThresholdMs?: number; // 동기화 임계값 (기본값: 30초)
}

interface UseCentrifugoReturn {
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
 * Centrifugo WebSocket 연결과 이벤트를 관리하는 훅
 */
export function useCentrifugo({
  spaceSlug,
  autoConnect = true,
  subscribeToAllComments = false,
  visiblePostIds = [],
  onReconnectionDataSync,
  dataSyncThresholdMs = 30000, // 30초
}: UseCentrifugoOptions): UseCentrifugoReturn {
  debug('useCentrifugo', 'Hook called with', {
    spaceSlug,
    visiblePostIds,
    autoConnect,
  });
  const { user } = useAuth();
  const eventHandlersRef = useRef<Map<WebSocketEventType, WebSocketEventHandler[]>>(new Map());
  const subscriptionTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastVisiblePostIdsRef = useRef<Set<string>>(new Set());
  const [wsConnected, setWsConnected] = useState(false);

  // Debug wsConnected state changes
  useEffect(() => {
    debug('useCentrifugo', 'wsConnected state changed to', wsConnected);
  }, [wsConnected]);

  // 재연결 감지를 위한 상태 추적
  const hasConnectedOnceRef = useRef<boolean>(false); // 최초 연결 여부

  // 스크롤 시 과도한 구독/해제 방지를 위한 디바운스
  const debouncedVisibleIds = useDebounce(visiblePostIds, 150);

  // 연결 상태 핸들러들
  const handleConnectionEstablished = useCallback((message: IncomingWebSocketMessage) => {
    if (message.type === 'connection.established') {
      debug('useCentrifugo', 'Connection established, updating React state');
      setWsConnected(true);
      hasConnectedOnceRef.current = true;
    }
  }, []);

  const handleConnectionLost = useCallback((message: IncomingWebSocketMessage) => {
    if (message.type === 'connection.lost') {
      debug('useCentrifugo', 'Connection lost, updating React state');
      setWsConnected(false);
    }
  }, []);

  // 연결 상태 동기화 - centrifugoService.connected 상태가 변경될 때 React 상태도 업데이트
  useEffect(() => {
    const syncConnectionState = () => {
      const serviceConnected = centrifugoService.connected;
      if (wsConnected !== serviceConnected) {
        debug('useCentrifugo', 'Syncing connection state', {
          wsConnected,
          serviceConnected,
          updating: 'wsConnected to ' + serviceConnected,
        });
        setWsConnected(serviceConnected);
      }
    };

    // 주기적으로 연결 상태 동기화 (1초마다)
    const syncInterval = setInterval(syncConnectionState, 1000);

    // 즉시 한 번 실행
    syncConnectionState();

    return () => clearInterval(syncInterval);
  }, [wsConnected]);

  // 재연결 감지 및 데이터 동기화 (wsConnected state 기반)
  useEffect(() => {
    // 재연결 감지: 한 번 연결되었었고, 현재 연결됨 (즉, 재연결됨)
    const isReconnection = hasConnectedOnceRef.current && wsConnected;

    if (isReconnection) {
      // 첫 연결 직후가 아닌 실제 재연결인지 확인하기 위해 약간의 지연
      const timer = setTimeout(() => {
        debug('useCentrifugo', 'Reconnection detected, checking if data sync needed');

        // 데이터 동기화 필요 여부 확인
        if (reconnectionManager.shouldRefetchData(dataSyncThresholdMs)) {
          debug('useCentrifugo', 'Data sync needed after reconnection');

          // 외부에서 제공된 동기화 함수 실행
          if (onReconnectionDataSync) {
            try {
              onReconnectionDataSync();
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[useCentrifugo] 데이터 동기화 실행 중 에러:', error);
              }
            }
          }

          // 등록된 모든 재연결 콜백 실행
          reconnectionManager.executeReconnectionCallbacks();

          // 마지막 활성 시간 업데이트
          reconnectionManager.updateLastActiveTime();
        }
      }, 1000); // 1초 지연으로 첫 연결과 구분

      return () => clearTimeout(timer);
    }
  }, [wsConnected, onReconnectionDataSync, dataSyncThresholdMs]);

  // 댓글 구독 함수
  const subscribeToComments = useCallback((postId: string) => {
    centrifugoService.subscribeToComments(postId);
  }, []);

  // 댓글 구독 해제 함수
  const unsubscribeFromComments = useCallback((postId: string) => {
    centrifugoService.unsubscribeFromComments(postId);
  }, []);

  // 배치 구독 함수
  const batchSubscribeToComments = useCallback((postIds: string[]) => {
    centrifugoService.batchSubscribeToComments(postIds);
  }, []);

  // 배치 구독 해제 함수
  const batchUnsubscribeFromComments = useCallback((postIds: string[]) => {
    centrifugoService.batchUnsubscribeFromComments(postIds);
  }, []);

  // 리액션 구독 함수
  const subscribeToReactions = useCallback((postId: string) => {
    centrifugoService.subscribeToReactions(postId);
  }, []);

  // 리액션 구독 해제 함수
  const unsubscribeFromReactions = useCallback((postId: string) => {
    centrifugoService.unsubscribeFromReactions(postId);
  }, []);

  // 배치 리액션 구독 함수
  const batchSubscribeToReactions = useCallback((postIds: string[]) => {
    centrifugoService.batchSubscribeToReactions(postIds);
  }, []);

  // 배치 리액션 구독 해제 함수
  const batchUnsubscribeFromReactions = useCallback((postIds: string[]) => {
    centrifugoService.batchUnsubscribeFromReactions(postIds);
  }, []);

  // Viewport 기반 자동 구독 관리 (디바운스 적용) - 통합된 효과
  useEffect(() => {
    debug('useCentrifugo', 'Subscription effect triggered', {
      wsConnected,
      serviceConnected: centrifugoService.connected,
      subscribeToAllComments,
      debouncedVisibleIds,
      visiblePostsCount: debouncedVisibleIds.length,
    });

    // 조건 체크: 연결되지 않았거나 모든 댓글 구독 모드이거나 보이는 포스트가 없으면 스킵
    if (
      !wsConnected ||
      !centrifugoService.connected ||
      subscribeToAllComments ||
      debouncedVisibleIds.length === 0
    ) {
      debug('useCentrifugo', 'Skipping subscription update', {
        wsConnected,
        serviceConnected: centrifugoService.connected,
        subscribeToAllComments,
        visiblePostsCount: debouncedVisibleIds.length,
      });
      return;
    }

    debug('useCentrifugo', 'Processing subscriptions for visible posts');

    const currentVisibleSet = new Set<string>(debouncedVisibleIds);
    const previousVisibleSet = lastVisiblePostIdsRef.current;

    // 현재 보이는 포스트 ID들과 이전 ID들을 비교
    const isInitialLoad = previousVisibleSet.size === 0;
    const hasChanged =
      !isInitialLoad &&
      (currentVisibleSet.size !== previousVisibleSet.size ||
        [...currentVisibleSet].some(id => !previousVisibleSet.has(id)) ||
        [...previousVisibleSet].some(id => !currentVisibleSet.has(id)));

    // 초기 로드이거나 실제로 변경된 경우에만 처리
    if (isInitialLoad || hasChanged) {
      // 이미 구독된 포스트 ID들 확인
      const subscribedComments = centrifugoService.getSubscribedPostIds();
      const subscribedReactions = centrifugoService.getSubscribedReactionPostIds();

      // 새로 구독할 포스트들 (현재 보이는 것 중 아직 구독되지 않은 것들)
      const newCommentSubscriptions = debouncedVisibleIds.filter(
        (postId: string) => !subscribedComments.includes(postId)
      );
      const newReactionSubscriptions = debouncedVisibleIds.filter(
        (postId: string) => !subscribedReactions.includes(postId)
      );

      // 새로 구독할 포스트가 있을 때만 구독 시도
      if (newCommentSubscriptions.length > 0 || newReactionSubscriptions.length > 0) {
        debug('useCentrifugo', 'Starting batch subscriptions', {
          newCommentSubscriptions,
          newReactionSubscriptions,
        });

        try {
          // 배치 구독 (중복 방지됨)
          if (newCommentSubscriptions.length > 0) {
            debug('useCentrifugo', 'Subscribing to comments for posts', newCommentSubscriptions);
            batchSubscribeToComments(newCommentSubscriptions);
          }
          if (newReactionSubscriptions.length > 0) {
            debug('useCentrifugo', 'Subscribing to reactions for posts', newReactionSubscriptions);
            batchSubscribeToReactions(newReactionSubscriptions);
          }

          // 구독 완료 후 상태 확인
          setTimeout(() => {
            debug('useCentrifugo', 'Subscription status after batch subscribe', {
              subscribedComments: centrifugoService.getSubscribedPostIds(),
              subscribedReactions: centrifugoService.getSubscribedReactionPostIds(),
              totalSubscriptions:
                centrifugoService.getSubscribedPostIds().length +
                centrifugoService.getSubscribedReactionPostIds().length,
            });
          }, 1000);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              '[Centrifugo] Batch subscribe failed, falling back to individual:',
              error
            );
          }
          newCommentSubscriptions.forEach((postId: string) => subscribeToComments(postId));
          newReactionSubscriptions.forEach((postId: string) => subscribeToReactions(postId));
        }
      } else {
        debug('useCentrifugo', 'No new subscriptions needed', {
          alreadySubscribedComments: subscribedComments,
          alreadySubscribedReactions: subscribedReactions,
        });
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
    batchSubscribeToComments,
    batchSubscribeToReactions,
    batchUnsubscribeFromComments,
    batchUnsubscribeFromReactions,
    subscribeToComments,
    subscribeToReactions,
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

      // Centrifugo 서비스에 핸들러 등록
      centrifugoService.addEventListener(eventType, handler as WebSocketEventHandler);
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

      // Centrifugo 서비스에서 핸들러 제거
      centrifugoService.removeEventListener(eventType, handler as WebSocketEventHandler);
    },
    []
  );

  // 연결 관리를 위한 ref 추가
  const isConnectedRef = useRef<boolean>(false);
  const connectionIdentityRef = useRef<string>('');

  // 자동 연결 및 정리 - 안정화된 연결 관리
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let connectionTimeout: NodeJS.Timeout | undefined;
    let visibilityCleanup: (() => void) | undefined;
    let reconnectionCleanup: (() => void) | undefined;

    if (autoConnect && user?.id && user.centrifugoToken) {
      // 연결 식별자 생성 (동일한 연결인지 확인하기 위해)
      const connectionIdentity = `${user.id}-${spaceSlug}`;

      // 이미 같은 연결이 활성화되어 있으면 스킵
      if (isConnectedRef.current && connectionIdentityRef.current === connectionIdentity) {
        debug('useCentrifugo', 'Connection already active for same identity, skipping');
        return;
      }

      // Page Visibility 추적 시작 (한 번만)
      if (!visibilityCleanup) {
        visibilityCleanup = reconnectionManager.startVisibilityTracking();
      }

      // 재연결 콜백 등록 (외부 동기화 함수가 있는 경우)
      if (onReconnectionDataSync) {
        const syncCallback = createDataSyncCallback(onReconnectionDataSync, 'Feed');
        reconnectionCleanup = reconnectionManager.addReconnectionCallback(syncCallback);
      }

      // 연결 설정
      const setupConnection = async () => {
        try {
          debug('useCentrifugo', 'Setting up Centrifugo connection', { connectionIdentity });

          // 기존 연결이 있고 다른 identity이면 먼저 정리
          if (isConnectedRef.current && connectionIdentityRef.current !== connectionIdentity) {
            debug('useCentrifugo', 'Cleaning up previous connection for different identity');
            centrifugoService.disconnect();
            isConnectedRef.current = false;
          }

          // 새 연결 설정
          await centrifugoService.connect(user.id, spaceSlug, user.centrifugoToken!);

          // 연결 성공 표시
          isConnectedRef.current = true;
          connectionIdentityRef.current = connectionIdentity;

          // 연결 상태 핸들러들 등록
          centrifugoService.addEventListener('connection.established', handleConnectionEstablished);
          centrifugoService.addEventListener('connection.lost', handleConnectionLost);

          // cleanup 함수 설정
          cleanup = () => {
            debug('useCentrifugo', 'Cleaning up connection');

            // 타이머 정리
            subscriptionTimersRef.current.forEach(timer => clearTimeout(timer));
            subscriptionTimersRef.current.clear();

            // 이벤트 핸들러 제거
            centrifugoService.removeEventListener(
              'connection.established',
              handleConnectionEstablished
            );
            centrifugoService.removeEventListener('connection.lost', handleConnectionLost);

            // 사용자 정의 핸들러들 제거
            eventHandlersRef.current.forEach((handlers, eventType) => {
              handlers.forEach(handler => {
                centrifugoService.removeEventListener(eventType, handler);
              });
            });
            eventHandlersRef.current.clear();

            // 연결 해제
            centrifugoService.disconnect();
            isConnectedRef.current = false;
            connectionIdentityRef.current = '';
          };
        } catch (error) {
          // 연결 실패 시 상태 리셋
          isConnectedRef.current = false;
          connectionIdentityRef.current = '';

          // 개발 환경에서는 핫 리로드로 인한 일시적 연결 실패가 정상적임
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Centrifugo] 일시적 연결 실패 (재연결 시도 중)', error);
          }
        }
      };

      // 개발 환경에서는 짧은 지연, 프로덕션에서는 더 긴 지연
      const delay = process.env.NODE_ENV === 'production' ? 500 : 200;
      connectionTimeout = setTimeout(setupConnection, delay);
    } else if (!user?.centrifugoToken) {
      debug('useCentrifugo', 'Centrifugo 토큰이 없어 연결을 건너뜁니다');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (cleanup) {
        cleanup();
      }
      if (visibilityCleanup) {
        visibilityCleanup();
      }
      if (reconnectionCleanup) {
        reconnectionCleanup();
      }
    };
  }, [autoConnect, user?.id, user?.centrifugoToken, spaceSlug]);

  return {
    connected: centrifugoService.connected,
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
 * 특정 포스트의 댓글에 대한 Centrifugo 구독을 관리하는 훅
 */
export function useCommentCentrifugo(spaceSlug: string, postId: string) {
  const centrifugo = useCentrifugo({ spaceSlug });

  useEffect(() => {
    if (centrifugo.connected && postId) {
      // 댓글 구독
      centrifugo.subscribeToComments(postId);

      // 컴포넌트 언마운트 시 구독 해제
      return () => {
        centrifugo.unsubscribeFromComments(postId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    centrifugo.connected,
    postId,
    centrifugo.subscribeToComments,
    centrifugo.unsubscribeFromComments,
  ]);

  return {
    connected: centrifugo.connected,
    subscribeToComments: centrifugo.subscribeToComments,
    unsubscribeFromComments: centrifugo.unsubscribeFromComments,
  };
}
