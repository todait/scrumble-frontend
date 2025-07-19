/**
 * NotificationPage 전용 커스텀 훅
 * 알림 페이지에서 필요한 모든 기능을 통합 관리
 */

import { useAuth } from '@/shared/contexts/AuthContext';
import {
  notificationKeys,
  useBulkMarkAsRead,
  useInfiniteNotifications,
  useMarkAllAsRead,
} from '@/shared/hooks/queries/useNotifications';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import type {
  NotificationCategory,
  NotificationDTO,
  NotificationFilter,
  NotificationType,
} from '@/shared/types/notification';
import type {
  NotificationCreatedMessage,
  NotificationEventData,
  NotificationReadMessage,
  WebSocketEventHandler,
} from '@/shared/types/websocket.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseNotificationPageOptions {
  spaceSlug: string;
}

interface UseNotificationPageReturn {
  // 데이터
  notifications: NotificationDTO[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasMore: boolean;

  // 필터링
  currentFilter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  setCategoryFilter: (category: NotificationCategory | 'all') => void;
  setReadFilter: (isRead?: boolean) => void;

  // 액션
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => void;

  // 상태
  isMarkingAsRead: boolean;
  isMarkingAllAsRead: boolean;
  isFetchingNextPage: boolean;

  // 통계
  totalCount: number;
  unreadCount: number;
}

/**
 * NotificationPage에서 사용하는 통합 훅
 */
export const useNotificationPage = ({
  spaceSlug,
}: UseNotificationPageOptions): UseNotificationPageReturn => {
  const { latestSpace } = useAuth();
  const queryClient = useQueryClient();

  // 필터 상태
  const [currentFilter, setCurrentFilter] = useState<NotificationFilter>({
    category: 'all',
    isRead: undefined,
  });

  // 무한 스크롤에서는 커서 상태가 자동 관리됨

  // 멤버 ID (현재 사용자)
  const memberId = latestSpace?.memberId;

  // WebSocket 연결
  const webSocketActions = useWebSocket({
    spaceSlug,
    memberId,
    onReconnectionDataSync: () => {
      // 재연결 시 알림 데이터 새로고침
      queryClient.invalidateQueries({
        queryKey: ['notifications', spaceSlug, memberId],
      });
    },
  });

  // 알림 데이터 조회 (무한 스크롤)
  const {
    data: notificationData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications({
    spaceSlug,
    memberId: memberId || '',
    filter: currentFilter,
    limit: 20,
    enabled: !!spaceSlug && !!memberId,
  });

  // Mutation 훅들
  const bulkMarkAsReadMutation = useBulkMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // 알림 목록 및 메타데이터 (무한 스크롤)
  const notifications = useMemo(() => {
    return notificationData?.pages.flatMap(page => page.notifications) || [];
  }, [notificationData]);

  const hasMore = hasNextPage || false;
  const totalCount = notificationData?.pages[0]?.total || 0;

  // 읽지 않은 알림 수 계산
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // 필터 변경 함수들
  const setFilter = useCallback((filter: NotificationFilter) => {
    setCurrentFilter(filter);
    // 무한 쿼리에서는 필터 변경 시 자동으로 데이터가 리셋됨
  }, []);

  const setCategoryFilter = useCallback(
    (category: NotificationCategory | 'all') => {
      setFilter({
        ...currentFilter,
        category,
      });
    },
    [currentFilter, setFilter]
  );

  const setReadFilter = useCallback(
    (isRead?: boolean) => {
      setFilter({
        ...currentFilter,
        isRead,
      });
    },
    [currentFilter, setFilter]
  );

  // 일괄 읽음 처리
  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (notificationIds.length === 0) return;

      try {
        await bulkMarkAsReadMutation.mutateAsync({
          spaceSlug,
          notificationIds,
        });

        // 성공 후 데이터 새로고침
        refetch();
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        throw error;
      }
    },
    [spaceSlug, bulkMarkAsReadMutation, refetch]
  );

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync(spaceSlug);

      // 성공 후 데이터 새로고침
      refetch();
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      throw error;
    }
  }, [spaceSlug, markAllAsReadMutation, refetch]);

  // 더 많은 알림 로드
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 실시간 알림 이벤트 핸들러들
  const handleNotificationCreated = useCallback(
    (message: NotificationCreatedMessage) => {
      console.log('[useNotificationPage] handleNotificationCreated called', message);
      const { data } = message;

      // 현재 멤버의 알림인지 확인
      if (data.memberId !== memberId) {
        console.log('[useNotificationPage] Skipping notification - different member', {
          messageMemberId: data.memberId,
          currentMemberId: memberId,
        });
        return;
      }

      console.log('data', data);

      // convertEventToDTO 함수 사용
      const newNotification = convertEventToDTO(data, message.timestamp);

      console.log('[useNotificationPage] Creating new notification', newNotification);

      // React Query 캐시 업데이트 - 첫 번째 페이지 상단에 새 알림 추가
      const queryKey = notificationKeys.infinite(spaceSlug, memberId, currentFilter);
      console.log('[useNotificationPage] Updating cache with key', queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData || !oldData.pages) {
          return oldData;
        }

        const updatedPages = [...oldData.pages];
        const firstPage = updatedPages[0];

        if (firstPage) {
          // 중복 체크
          const exists = firstPage.notifications.some(
            (n: NotificationDTO) => n.id === newNotification.id
          );

          if (!exists) {
            updatedPages[0] = {
              ...firstPage,
              notifications: [newNotification, ...firstPage.notifications],
              total: firstPage.total + 1,
            };
          }
        }

        console.log('[useNotificationPage] Cache updated successfully');
        return {
          ...oldData,
          pages: updatedPages,
        };
      });
    },
    [memberId, spaceSlug, currentFilter, queryClient]
  );

  const handleNotificationRead = useCallback(
    (message: NotificationReadMessage) => {
      console.log('[useNotificationPage] handleNotificationRead called', message);
      const { data } = message;

      // 현재 멤버의 알림인지 확인
      if (data.memberId !== memberId) {
        console.log('[useNotificationPage] Skipping notification read - different member', {
          messageMemberId: data.memberId,
          currentMemberId: memberId,
        });
        return;
      }

      // React Query 캐시 업데이트 - 해당 알림의 읽음 상태 변경
      const queryKey = notificationKeys.infinite(spaceSlug, memberId, currentFilter);
      console.log('[useNotificationPage] Updating cache for read notification with key', queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData || !oldData.pages) {
          return oldData;
        }

        const updatedPages = oldData.pages.map((page: any) => ({
          ...page,
          notifications: page.notifications.map((notification: NotificationDTO) =>
            notification.id === data.notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));

        console.log('[useNotificationPage] Cache updated successfully for read notification');
        return {
          ...oldData,
          pages: updatedPages,
        };
      });
    },
    [memberId, spaceSlug, currentFilter, queryClient]
  );

  // WebSocket 이벤트 핸들러 메모이제이션 (useFeedData.ts 패턴)
  const eventHandlersRef = useRef<{
    notificationCreated: WebSocketEventHandler<NotificationCreatedMessage>;
    notificationRead: WebSocketEventHandler<NotificationReadMessage>;
  } | null>(null);

  // 핸들러 의존성 업데이트
  useEffect(() => {
    eventHandlersRef.current = {
      notificationCreated: (message: NotificationCreatedMessage) => {
        if (message.data.memberId === memberId) {
          handleNotificationCreated(message);
        }
      },
      notificationRead: (message: NotificationReadMessage) => {
        if (message.data.memberId === memberId) {
          handleNotificationRead(message);
        }
      },
    };
  }, [handleNotificationCreated, handleNotificationRead, memberId]);

  // WebSocket 이벤트 리스너 등록/해제
  useEffect(() => {
    if (!webSocketActions || !eventHandlersRef.current || !memberId) {
      return;
    }

    const handlers = eventHandlersRef.current;

    // 타입 안전한 이벤트 리스너 등록
    webSocketActions.addEventListener('notification.created', handlers.notificationCreated);
    webSocketActions.addEventListener('notification.read', handlers.notificationRead);

    // cleanup: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      webSocketActions.removeEventListener('notification.created', handlers.notificationCreated);
      webSocketActions.removeEventListener('notification.read', handlers.notificationRead);
    };
  }, [webSocketActions, memberId]);

  return {
    // 데이터
    notifications,
    isLoading,
    isError,
    error: error as Error | null,
    hasMore,

    // 필터링
    currentFilter,
    setFilter,
    setCategoryFilter,
    setReadFilter,

    // 액션
    markAsRead,
    markAllAsRead,
    loadMore,

    // 상태
    isMarkingAsRead: bulkMarkAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isFetchingNextPage,

    // 통계
    totalCount,
    unreadCount,
  };
};

function convertEventToDTO(eventData: NotificationEventData, timestamp: string): NotificationDTO {
  return {
    id: eventData.notificationId,
    category: eventData.category as NotificationCategory,
    type: eventData.type as NotificationType,
    isRead: false,
    createdAt: timestamp,
    deepLink: `/${eventData.spaceSlug}/notifications`,
    payload: {
      post: eventData.post,
      comment: eventData.comment,
      reaction: eventData.reaction,
    },
  };
}
