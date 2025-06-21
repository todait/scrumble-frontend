/**
 * 댓글 관련 React Query 키 관리
 */

export const commentsKeys = {
  all: ['comments'] as const,
  lists: () => [...commentsKeys.all, 'list'] as const,
  list: (postId: string) => [...commentsKeys.lists(), { postId }] as const,
  details: () => [...commentsKeys.all, 'detail'] as const,
  detail: (postId: string, commentId: string) => 
    [...commentsKeys.details(), { postId, commentId }] as const,
};