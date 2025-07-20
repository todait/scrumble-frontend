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

// 카테고리별 읽지 않은 알림 개수
export interface UnreadCountByCategory {
  feed: number;
  activity: number;
  notice: number;
}

// 읽지 않은 알림 개수 조회 응답
export interface GetUnreadCountResponse {
  totalUnreadCount: number;
  categories: UnreadCountByCategory;
}

// 알림 필터
export interface NotificationFilter {
  category?: NotificationCategory | 'all';
  isRead?: boolean;
}

// 기본 알림 타입 (title, content, relatedUser, relatedPost 제거)
export interface NotificationDTO<T = any> {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  deepLink: string;
  payload: T;
}

// 각 타입별 Payload 정의
export interface CheckInPostNotificationPayload {
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  content?: string;
  conditionScore?: number;
}

export interface CheckOutPostNotificationPayload {
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  content?: string;
  completedTodos?: number;
}

export interface MemberJoinLeaveNotificationPayload {
  member: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CommentNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}

export interface PostReactionNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  reaction: {
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}

export interface CommentReactionNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  reaction: {
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL?: string | null;
    };
  };
}

// 타입별 NotificationDTO
export type CheckInPostNotification = NotificationDTO<CheckInPostNotificationPayload>;
export type CheckOutPostNotification = NotificationDTO<CheckOutPostNotificationPayload>;
export type MemberJoinLeaveNotification = NotificationDTO<MemberJoinLeaveNotificationPayload>;
export type CommentNotification = NotificationDTO<CommentNotificationPayload>;
export type PostReactionNotification = NotificationDTO<PostReactionNotificationPayload>;
export type CommentReactionNotification = NotificationDTO<CommentReactionNotificationPayload>;

// Union type
export type TypedNotificationDTO =
  | CheckInPostNotification
  | CheckOutPostNotification
  | MemberJoinLeaveNotification
  | CommentNotification
  | PostReactionNotification
  | CommentReactionNotification
  | NotificationDTO; // 기타 타입들을 위한 fallback

// 타입 가드 함수들
export function isCheckInPostNotification(
  notification: NotificationDTO
): notification is CheckInPostNotification {
  return notification.type === 'check_in_post';
}

export function isCheckOutPostNotification(
  notification: NotificationDTO
): notification is CheckOutPostNotification {
  return notification.type === 'check_out_post';
}

export function isMemberJoinLeaveNotification(
  notification: NotificationDTO
): notification is MemberJoinLeaveNotification {
  return notification.type === 'member_joined' || notification.type === 'member_left';
}

export function isCommentNotification(
  notification: NotificationDTO
): notification is CommentNotification {
  return (
    notification.type === 'comment' &&
    'comment' in notification.payload &&
    'post' in notification.payload
  );
}

export function isPostReactionNotification(
  notification: NotificationDTO
): notification is PostReactionNotification {
  return (
    notification.type === 'emoji_reaction' &&
    'reaction' in notification.payload &&
    'post' in notification.payload &&
    !('comment' in notification.payload)
  );
}

export function isCommentReactionNotification(
  notification: NotificationDTO
): notification is CommentReactionNotification {
  return (
    notification.type === 'emoji_reaction' &&
    'reaction' in notification.payload &&
    'comment' in notification.payload &&
    'post' in notification.payload
  );
}
