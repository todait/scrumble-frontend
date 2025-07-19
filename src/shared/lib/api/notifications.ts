/**
 * Notification 관련 API 함수들
 * 알림 조회, 읽음 처리, 일괄 읽음 처리 등
 */

import type {
  BulkMarkAsReadRequest,
  BulkMarkAsReadResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkAllAsReadResponse,
  NotificationDTO,
} from '@/shared/types/notification';
import { debug } from '@/shared/utils/debug';
import { apiClient } from '../api';

/**
 * 백엔드 API 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환
 */
const convertApiNotificationToNotification = (apiNotification: any): NotificationDTO => {
  return {
    id: apiNotification.id,
    category: apiNotification.category,
    type: apiNotification.type,
    isRead: apiNotification.is_read,
    readAt: apiNotification.read_at,
    createdAt: apiNotification.created_at,
    deepLink: apiNotification.deep_link,
    payload: apiNotification.payload || {},
  };
};

/**
 * Notification 관련 API 함수들
 */
export const notificationsApi = {
  /**
   * 알림 목록 조회
   * @param request 알림 조회 요청
   * @returns 알림 목록 (페이지네이션 포함)
   */
  getNotifications: async (request: GetNotificationsRequest): Promise<GetNotificationsResponse> => {
    debug('getNotifications', `spaceSlug: ${request.spaceSlug}, memberId: ${request.memberId}`);
    debug('getNotifications', `cursor: ${request.cursor}, limit: ${request.limit}`);
    debug('getNotifications', `categories: ${request.categories}, types: ${request.types}`);
    debug('getNotifications', `isRead: ${request.isRead}`);

    const queryParams = new URLSearchParams();

    if (request.cursor) {
      queryParams.append('cursor', request.cursor);
    }

    if (request.limit) {
      queryParams.append('limit', request.limit.toString());
    }

    if (request.categories) {
      queryParams.append('categories', request.categories);
    }

    if (request.types) {
      queryParams.append('types', request.types);
    }

    if (request.isRead !== undefined) {
      queryParams.append('is_read', request.isRead.toString());
    }

    const { data } = await apiClient.get(
      `/api/v1/spaces/${request.spaceSlug}/notifications/${request.memberId}?${queryParams.toString()}`
    );

    return {
      notifications: data.notifications.map(convertApiNotificationToNotification),
      nextCursor: data.next_cursor,
      hasMore: data.has_more,
      total: data.total,
    };
  },

  /**
   * 알림 일괄 읽음 처리
   * @param request 일괄 읽음 처리 요청
   * @returns 처리 결과
   */
  bulkMarkAsRead: async (request: BulkMarkAsReadRequest): Promise<BulkMarkAsReadResponse> => {
    debug('bulkMarkAsRead', `spaceSlug: ${request.spaceSlug}`);
    debug('bulkMarkAsRead', `notificationIds count: ${request.notificationIds.length}`);

    const { data } = await apiClient.post(
      `/api/v1/spaces/${request.spaceSlug}/notifications/bulk-read`,
      {
        notification_ids: request.notificationIds,
      }
    );

    return {
      message: data.message,
      processedIds: data.processed_ids,
      skippedIds: data.skipped_ids,
      processedCount: data.processed_count,
      totalRequested: data.total_requested,
    };
  },

  /**
   * 모든 알림 읽음 처리
   * @param spaceSlug 스페이스 식별자
   * @returns 처리 결과
   */
  markAllAsRead: async (spaceSlug: string): Promise<MarkAllAsReadResponse> => {
    debug('markAllAsRead', `spaceSlug: ${spaceSlug}`);

    const { data } = await apiClient.post(
      `/api/v1/spaces/${spaceSlug}/notifications/mark-all-read`
    );

    return {
      message: data.message,
      processedCount: data.processed_count,
    };
  },
};
