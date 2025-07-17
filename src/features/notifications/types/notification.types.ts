/**
 * Notification 관련 타입 정의
 */

// 사용자 타입
export interface User {
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
}

// 알림 카테고리
export enum NotificationCategory {
  FEED = 'Feed',
  ACTIVITY = 'Activity',
  NOTICE = 'Notice',
}

// 알림 타입
export enum NotificationType {
  CHECK_IN_POST = 1,
  CHECK_OUT_POST = 2,
  COMMENT = 3,
  EMOJI_REACTION = 4,
  MENTION = 5,
  SPACE_NOTICE = 6,
  ROLE_UPDATE = 7,
  SPACE_INFO_UPDATE = 8,
  MEMBER_JOIN_LEAVE = 9,
}

// 기본 알림 인터페이스
export interface BaseNotification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  spaceId: string;
}

// 체크인 포스트 알림
export interface CheckInPostNotification extends BaseNotification {
  type: NotificationType.CHECK_IN_POST;
  user: User;
  post: {
    id: string;
    content: string;
    conditionScore: number;
  };
}

// 체크아웃 포스트 알림
export interface CheckOutPostNotification extends BaseNotification {
  type: NotificationType.CHECK_OUT_POST;
  user: User;
  post: {
    id: string;
    content: string;
  };
}

// 댓글 알림
export interface CommentNotification extends BaseNotification {
  type: NotificationType.COMMENT;
  commenter: User;
  comment: {
    id: string;
    content: string;
  };
  targetPost: {
    id: string;
    content: string;
  };
}

// 이모지 반응 알림
export interface EmojiReactionNotification extends BaseNotification {
  type: NotificationType.EMOJI_REACTION;
  reactor: User;
  emoji: string;
  targetPost: {
    id: string;
    content: string;
  };
}

// 멘션 알림
export interface MentionNotification extends BaseNotification {
  type: NotificationType.MENTION;
  mentioner: User;
  content: string;
  context: {
    type: 'post' | 'comment';
    id: string;
  };
}

// 스페이스 공지 알림
export interface SpaceNoticeNotification extends BaseNotification {
  type: NotificationType.SPACE_NOTICE;
  title: string;
  content: string;
  author: User;
}

// 역할 업데이트 알림
export interface RoleUpdateNotification extends BaseNotification {
  type: NotificationType.ROLE_UPDATE;
  updatedBy: User;
  targetUser: User;
  oldRole: string;
  newRole: string;
}

// 스페이스 정보 업데이트 알림
export interface SpaceInfoUpdateNotification extends BaseNotification {
  type: NotificationType.SPACE_INFO_UPDATE;
  updatedBy: User;
  updateType: 'name' | 'description' | 'settings';
  oldValue?: string;
  newValue?: string;
}

// 멤버 가입/탈퇴 알림
export interface MemberJoinLeaveNotification extends BaseNotification {
  type: NotificationType.MEMBER_JOIN_LEAVE;
  member: User;
  action: 'joined' | 'left';
}

// 통합 알림 타입
export type Notification =
  | CheckInPostNotification
  | CheckOutPostNotification
  | CommentNotification
  | EmojiReactionNotification
  | MentionNotification
  | SpaceNoticeNotification
  | RoleUpdateNotification
  | SpaceInfoUpdateNotification
  | MemberJoinLeaveNotification;

// 알림 필터
export interface NotificationFilter {
  category: NotificationCategory | 'ALL';
  isRead?: boolean;
}