/**
 * 알림 관련 유틸리티 함수들
 */

import type { NotificationCategory } from '@/shared/types/notification';

/**
 * 카테고리 라벨 반환
 */
export const getCategoryLabel = (category: NotificationCategory | 'all'): string => {
  switch (category) {
    case 'all':
      return '전체';
    case 'feed':
      return '피드';
    case 'activity':
      return '활동';
    case 'notice':
      return '공지';
    default:
      return '전체';
  }
};

/**
 * 알림 타입별 아이콘 반환
 */
export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'check_in_post':
    case 'check_out_post':
      return '📝';
    case 'comment':
      return '💬';
    case 'emoji_reaction':
      return '😊';
    case 'mention':
      return '@';
    case 'space_notice':
      return '📢';
    case 'role_update':
      return '👤';
    case 'space_info_update':
      return 'ℹ️';
    case 'member_joined':
      return '👋';
    case 'member_left':
      return '👋';
    default:
      return '🔔';
  }
};