/**
 * 리액션 관련 React Query 키 관리
 */

export const reactionsKeys = {
  all: ['reactions'] as const,
  lists: () => [...reactionsKeys.all, 'list'] as const,
  list: (targetType: 'posts' | 'comments', targetId: string) => 
    [...reactionsKeys.lists(), { targetType, targetId }] as const,
  details: () => [...reactionsKeys.all, 'detail'] as const,
  detail: (targetType: 'posts' | 'comments', targetId: string, userId: string) =>
    [...reactionsKeys.details(), { targetType, targetId, userId }] as const,
};