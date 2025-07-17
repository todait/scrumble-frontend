/**
 * Notification 관련 타입 정의
 */

// 알림 카테고리
export type NotificationCategory = 'feed' | 'activity' | 'notice';

// 알림 타입
export type NotificationType =
  | 'check_in_post'
  | 'check_out_post'
  | 'comment'
  | 'emoji_reaction'
  | 'member_joined'
  | 'member_left'
  | 'system_notice'
  | 'space_notice'
  | 'mention'
  | 'role_update'
  | 'space_info_update';

// 관련 사용자 정보
export interface RelatedUser {
  id: string;
  name: string;
  avatarUrl: string;
}

// 관련 포스트 정보
export interface RelatedPost {
  id: string;
  type: string;
}

// 알림 DTO (API 응답)
export interface NotificationDTO {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  payload?: Record<string, any>;
  relatedUser?: RelatedUser;
  relatedPost?: RelatedPost;
  deepLink: string;
}

// 알림 목록 조회 요청
export interface GetNotificationsRequest {
  spaceSlug: string;
  memberId: string;
  cursor?: string;
  limit?: number;
  categories?: string; // 쉼표로 구분된 카테고리 목록
  types?: string; // 쉼표로 구분된 타입 목록
  isRead?: boolean;
}

// 알림 목록 조회 응답
export interface GetNotificationsResponse {
  notifications: NotificationDTO[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

// 일괄 읽음 처리 요청
export interface BulkMarkAsReadRequest {
  spaceSlug: string;
  notificationIds: string[];
}

// 일괄 읽음 처리 응답
export interface BulkMarkAsReadResponse {
  message: string;
  processedIds: string[];
  skippedIds: string[];
  processedCount: number;
  totalRequested: number;
}

// 모든 알림 읽음 처리 응답
export interface MarkAllAsReadResponse {
  message: string;
  processedCount: number;
}

// 알림 필터
export interface NotificationFilter {
  category?: NotificationCategory | 'all';
  isRead?: boolean;
}
