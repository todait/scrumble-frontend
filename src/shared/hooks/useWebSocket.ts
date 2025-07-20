/**
 * WebSocket을 사용하기 위한 React 훅
 * Centrifugo를 사용하도록 마이그레이션되었습니다.
 */

import type { WebSocketEventHandler, WebSocketEventType } from '../services/centrifugo.service';
import type { ExtractMessageType } from '../types/websocket.types';
import { debug } from '../utils/debug';
import { useCentrifugo, useCommentCentrifugo } from './useCentrifugo';

interface UseWebSocketOptions {
  spaceSlug: string;
  autoConnect?: boolean; // 자동 연결 여부 (기본값: true)
  subscribeToAllComments?: boolean; // 모든 댓글 구독 여부 (기본값: false)
  visiblePostIds?: string[]; // 현재 보이는 포스트 ID들
  // 재연결 시 데이터 동기화 관련
  onReconnectionDataSync?: () => void; // 재연결 시 호출될 데이터 동기화 함수
  dataSyncThresholdMs?: number; // 동기화 임계값 (기본값: 30초)
  memberId?: string; // 👈 추가
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
  // 알림 구독 함수들
  subscribeToNotifications: (memberId: string) => void;
  unsubscribeFromNotifications: (memberId: string) => void;
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
 * Centrifugo를 사용하도록 마이그레이션되었습니다.
 */
export function useWebSocket({
  spaceSlug,
  autoConnect = true,
  subscribeToAllComments = false,
  visiblePostIds = [],
  onReconnectionDataSync,
  dataSyncThresholdMs = 30000,
  memberId,
}: UseWebSocketOptions): UseWebSocketReturn {
  // Debug: Log visiblePostIds
  debug('useWebSocket', 'visiblePostIds', visiblePostIds);

  // Centrifugo 훅을 사용하여 동일한 인터페이스 제공
  return useCentrifugo({
    spaceSlug,
    autoConnect,
    subscribeToAllComments,
    visiblePostIds,
    onReconnectionDataSync,
    dataSyncThresholdMs,
    memberId,
  });
}

/**
 * 특정 포스트의 댓글에 대한 WebSocket 구독을 관리하는 훅
 * Centrifugo를 사용하도록 마이그레이션되었습니다.
 */
export function useCommentWebSocket(spaceSlug: string, postId: string) {
  return useCommentCentrifugo(spaceSlug, postId);
}
