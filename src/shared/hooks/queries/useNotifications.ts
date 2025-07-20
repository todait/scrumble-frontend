/**
 * 알림 관련 React Query 훅들
 */

import { useToast } from '@/shared/hooks/useToast';
import { notificationsApi } from '@/shared/lib/api/notifications';
import type {
  BulkMarkAsReadRequest,
  GetNotificationsRequest,
  NotificationFilter,
} from '@/shared/types/notification';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (spaceSlug: string, memberId: string, filter?: NotificationFilter, cursor?: string) =>
    [...notificationKeys.lists(), spaceSlug, memberId, filter, cursor] as const,
  infinite: (spaceSlug: string, memberId: string, filter?: NotificationFilter) =>
    [...notificationKeys.lists(), 'infinite', spaceSlug, memberId, filter] as const,
  unreadCounts: () => [...notificationKeys.all, 'unreadCount'] as const,
  unreadCount: (spaceSlug: string, memberId: string) =>
    [...notificationKeys.unreadCounts(), spaceSlug, memberId] as const,
};

interface UseNotificationsOptions {
  spaceSlug: string;
  memberId: string;
  filter?: NotificationFilter;
  cursor?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * 알림 목록을 가져오는 React Query 훅
 */
export const useNotifications = (options: UseNotificationsOptions) => {
  const { spaceSlug, memberId, filter, cursor, limit = 20, enabled = true } = options;

  const queryParams: GetNotificationsRequest = {
    spaceSlug,
    memberId,
    cursor,
    limit,
    categories: filter?.category && filter.category !== 'all' ? filter.category : undefined,
    isRead: filter?.isRead,
  };

  return useQuery({
    queryKey: notificationKeys.list(spaceSlug, memberId, filter, cursor),
    queryFn: async () => {
      try {
        const result = await notificationsApi.getNotifications(queryParams);

        // 데이터 유효성 검사
        if (!result || !Array.isArray(result.notifications)) {
          throw new Error('Invalid notification data format');
        }

        return result;
      } catch (error: any) {
        console.error('알림 조회 실패:', error);

        // 네트워크 에러 처리
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        // 권한 에러 처리
        if (error.status === 401 || error.status === 403) {
          throw new Error('알림에 접근할 권한이 없습니다.');
        }

        // 서버 에러 처리
        if (error.status >= 500) {
          throw new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        throw error;
      }
    },
    enabled: enabled && !!spaceSlug && !!memberId,
    retry: (failureCount, error: any) => {
      // 권한 에러는 재시도하지 않음
      if (error.status === 401 || error.status === 403) {
        return false;
      }

      // 4xx 에러는 재시도하지 않음
      if (error.status >= 400 && error.status < 500) {
        return false;
      }

      // 최대 3번까지 재시도
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5분간 신선한 데이터로 간주
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
  });
};

/**
 * 알림을 일괄 읽음으로 표시하는 mutation 훅
 */
export const useBulkMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: BulkMarkAsReadRequest) => {
      try {
        return await notificationsApi.bulkMarkAsRead(params);
      } catch (error: any) {
        console.error('알림 일괄 읽음 처리 실패:', error);

        // 네트워크 에러 처리
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        // 권한 에러 처리
        if (error.status === 401 || error.status === 403) {
          throw new Error('알림을 읽음으로 표시할 권한이 없습니다.');
        }

        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // 해당 스페이스의 모든 알림 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      
      // 읽지 않은 알림 개수 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCounts(),
      });

      const { processedCount, skippedIds } = data;

      if (processedCount > 0) {
        toast('success', {
          title: `${processedCount}개의 알림을 읽음으로 표시했습니다.`,
        });
      }

      if (skippedIds.length > 0) {
        console.warn(`${skippedIds.length}개의 알림이 건너뛰어졌습니다:`, skippedIds);
      }
    },
    onError: (error: any) => {
      console.error('알림 일괄 읽음 처리 실패:', error);
      const errorMessage = error.message || '알림을 읽음으로 표시하는 중 오류가 발생했습니다.';
      toast('error', { title: errorMessage });
    },
    retry: 2, // 최대 2번 재시도
  });
};

/**
 * 모든 알림을 읽음으로 표시하는 mutation 훅
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (spaceSlug: string) => notificationsApi.markAllAsRead(spaceSlug),
    onSuccess: (data, spaceSlug) => {
      // 해당 스페이스의 모든 알림 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      
      // 읽지 않은 알림 개수 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCounts(),
      });

      const { processedCount } = data;

      if (processedCount > 0) {
        toast('success', {
          title: `모든 알림(${processedCount}개)을 읽음으로 표시했습니다.`,
        });
      } else {
        toast('info', {
          title: '읽지 않은 알림이 없습니다.',
        });
      }
    },
    onError: (error: any) => {
      console.error('모든 알림 읽음 처리 실패:', error);
      const errorMessage = error.message || '모든 알림을 읽음으로 표시하는 중 오류가 발생했습니다.';
      toast('error', { title: errorMessage });
    },
    retry: 2, // 최대 2번 재시도
  });
};

interface UseInfiniteNotificationsOptions {
  spaceSlug: string;
  memberId: string;
  filter?: NotificationFilter;
  limit?: number;
  enabled?: boolean;
}

/**
 * 무한 스크롤을 위한 알림 목록 훅
 */
export const useInfiniteNotifications = (options: UseInfiniteNotificationsOptions) => {
  const { spaceSlug, memberId, filter, limit = 20, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(spaceSlug, memberId, filter),
    queryFn: async ({ pageParam }) => {
      try {
        const queryParams: GetNotificationsRequest = {
          spaceSlug,
          memberId,
          cursor: pageParam,
          limit,
          categories: filter?.category && filter.category !== 'all' ? filter.category : undefined,
          isRead: filter?.isRead,
        };

        const result = await notificationsApi.getNotifications(queryParams);

        // 데이터 유효성 검사
        if (!result || !Array.isArray(result.notifications)) {
          throw new Error('Invalid notification data format');
        }

        return result;
      } catch (error: any) {
        console.error('알림 조회 실패:', error);

        // 네트워크 에러 처리
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        // 권한 에러 처리
        if (error.status === 401 || error.status === 403) {
          throw new Error('알림에 접근할 권한이 없습니다.');
        }

        // 서버 에러 처리
        if (error.status >= 500) {
          throw new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!spaceSlug && !!memberId,
    retry: (failureCount, error: any) => {
      // 권한 에러는 재시도하지 않음
      if (error.status === 401 || error.status === 403) {
        return false;
      }

      // 4xx 에러는 재시도하지 않음
      if (error.status >= 400 && error.status < 500) {
        return false;
      }

      // 최대 3번까지 재시도
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5분간 신선한 데이터로 간주
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
  });
};

interface UseNotificationUnreadCountOptions {
  spaceSlug: string;
  memberId: string;
  enabled?: boolean;
  refetchInterval?: number | false;
}

/**
 * 읽지 않은 알림 개수를 가져오는 React Query 훅
 */
export const useNotificationUnreadCount = (options: UseNotificationUnreadCountOptions) => {
  const { spaceSlug, memberId, enabled = true, refetchInterval = 30000 } = options; // 기본 30초마다 자동 갱신
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: notificationKeys.unreadCount(spaceSlug, memberId),
    queryFn: async () => {
      try {
        const result = await notificationsApi.getUnreadCount(spaceSlug, memberId);

        // 데이터 유효성 검사
        if (!result || typeof result.totalUnreadCount !== 'number') {
          throw new Error('Invalid unread count data format');
        }

        return result;
      } catch (error: any) {
        console.error('읽지 않은 알림 개수 조회 실패:', error);

        // 네트워크 에러 처리
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        // 권한 에러 처리
        if (error.status === 401 || error.status === 403) {
          throw new Error('알림 개수에 접근할 권한이 없습니다.');
        }

        // 서버 에러 처리
        if (error.status >= 500) {
          throw new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        throw error;
      }
    },
    enabled: enabled && !!spaceSlug && !!memberId,
    refetchInterval, // 주기적 자동 갱신
    refetchOnWindowFocus: true, // 윈도우 포커스 시 재조회
    retry: (failureCount, error: any) => {
      // 권한 에러는 재시도하지 않음
      if (error.status === 401 || error.status === 403) {
        return false;
      }

      // 4xx 에러는 재시도하지 않음
      if (error.status >= 400 && error.status < 500) {
        return false;
      }

      // 최대 3번까지 재시도
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 15, // 15초간 신선한 데이터로 간주 (더 자주 업데이트)
    gcTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};