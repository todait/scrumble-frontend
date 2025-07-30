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

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * 포스트 타입에 따른 표시명 반환
 */
export const getPostTypeDisplayName = (postType: string): string => {
  return postType === 'check_in' ? '체크인' : '체크아웃';
};

/**
 * 작성자 이름을 현재 사용자와 비교하여 적절한 형태로 반환
 * 자신인 경우 "나", 타인인 경우 "이름님"으로 표시
 */
export const getAuthorDisplayName = (
  authorId: string,
  authorName: string,
  currentMemberId?: string
): string => {
  if (authorId === currentMemberId) {
    return '나';
  }
  return `${authorName}님`;
};

/**
 * 댓글/반응 작성자 이름을 표시 (항상 "님"이 붙음)
 * 자신인 경우에도 "나님"이 아닌 "나"만 표시하여 자연스럽게 처리
 */
export const getActionAuthorDisplayName = (
  authorId: string,
  authorName: string,
  currentMemberId?: string,
  action: '댓글' | '반응' = '댓글'
): string => {
  if (authorId === currentMemberId) {
    return `나의 ${action}`;
  }
  return `${authorName}님의 ${action}`;
};
