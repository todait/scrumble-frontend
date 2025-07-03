/**
 * 리액션 관련 React Query 훅들
 * Optimistic Update와 에러 롤백 기능을 포함합니다
 */

import type { Post, Reaction } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { reactionsApi } from '@/shared/lib/api/reactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsKeys } from './postsKeys';
import { reactionsKeys } from './reactionsKeys';

/**
 * 특정 대상의 리액션 목록을 조회하는 훅
 */
export function useReactions(targetType: 'posts' | 'comments', targetId: string) {
  return useQuery({
    queryKey: reactionsKeys.list(targetType, targetId),
    queryFn: () => reactionsApi.getReactions({ targetType, targetId }),
    enabled: !!targetId,
  });
}

/**
 * 리액션 추가를 위한 뮤테이션 훅
 * Optimistic Update를 통해 즉각적인 UI 반영을 제공합니다
 */
export function useAddReaction(spaceSlug: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    // 서버에 리액션 추가 요청 (API에는 targetPostId 불필요)
    mutationFn: (variables: {
      targetType: 'posts' | 'comments';
      targetId: string;
      targetPostId?: string; // 댓글의 경우 포스트 ID
      emoji: string;
    }) =>
      reactionsApi.addReaction({
        targetType: variables.targetType,
        targetId: variables.targetId,
        emoji: variables.emoji,
      }),

    // Optimistic Update: 서버 요청 전에 UI를 먼저 업데이트
    onMutate: async ({ targetType, targetId, targetPostId, emoji }) => {
      // 현재 캐시된 모든 목록 캐시 백업 (롤백용)
      const previousData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 캐시 데이터 낙관적 업데이트 (모든 목록 대상)
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;

          // 형태 1) infiniteQuery: {pages: [...], pageParams: [...]}
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data.map((post: Post) =>
                  targetType === 'posts'
                    ? applyAddReaction(post, targetId, emoji, user?.id)
                    : applyAddReactionToComment(post, targetPostId || '', targetId, emoji, user?.id)
                ),
              })),
            };
          }

          // 형태 2) 일반 리스트: {posts: [...]} 등
          if (oldData.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map((post: Post) =>
                targetType === 'posts'
                  ? applyAddReaction(post, targetId, emoji, user?.id)
                  : applyAddReactionToComment(post, targetPostId || '', targetId, emoji, user?.id)
              ),
            };
          }

          return oldData;
        }
      );

      return { previousData };
    },

    // 에러 발생 시: 백업 데이터로 롤백
    onError: (err, variables, context) => {
      console.error('[useAddReaction] 리액션 추가 실패:', err);

      // 백업 데이터가 있으면 롤백 (모든 쿼리)
      context?.previousData?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
}

// 공용 헬퍼: 포스트에 리액션 추가 낙관적 적용
function applyAddReaction(
  post: Post,
  targetId: string,
  emoji: string,
  userId: string | undefined
): Post {
  if (post.id !== targetId) return post;

  const existingIdx = post.reactions.findIndex(r => r.emoji === emoji);

  if (existingIdx >= 0) {
    const updated = [...post.reactions];
    const react = updated[existingIdx];

    if (!react.userIds.includes(userId || '')) {
      updated[existingIdx] = {
        ...react,
        count: react.count + 1,
        userIds: [...react.userIds, userId || ''],
      };
    }

    return { ...post, reactions: updated };
  }

  return {
    ...post,
    reactions: [...post.reactions, { emoji, count: 1, userIds: [userId || ''] }],
  };
}

// 공용 헬퍼: 댓글에 리액션 추가 낙관적 적용
function applyAddReactionToComment(
  post: Post,
  targetPostId: string,
  targetId: string,
  emoji: string,
  userId: string | undefined
): Post {
  // targetPostId가 일치하지 않으면 변경하지 않음 (성능 최적화)
  if (targetPostId && post.id !== targetPostId) return post;

  // 댓글이 없는 포스트는 건너뛰기
  if (!post.comments || post.comments.length === 0) return post;

  // 해당 댓글을 포함하고 있는지 빠르게 확인
  const hasTargetComment = post.comments.some(c => c.id === targetId);
  if (!hasTargetComment) return post;

  return {
    ...post,
    comments: post.comments.map(comment => {
      if (comment.id !== targetId) return comment;

      const existingIdx = (comment.reactions || []).findIndex(r => r.emoji === emoji);

      if (existingIdx >= 0) {
        const updated = [...(comment.reactions || [])];
        const react = updated[existingIdx];

        if (!react.userIds.includes(userId || '')) {
          updated[existingIdx] = {
            ...react,
            count: react.count + 1,
            userIds: [...react.userIds, userId || ''],
          };
        }

        return { ...comment, reactions: updated };
      }

      return {
        ...comment,
        reactions: [...(comment.reactions || []), { emoji, count: 1, userIds: [userId || ''] }],
      };
    }),
  };
}

/**
 * 리액션 제거를 위한 뮤테이션 훅
 * 추가와 동일한 패턴으로 Optimistic Update 제공
 */
export function useRemoveReaction(spaceSlug: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    // 서버에 리액션 제거 요청 (API에는 targetPostId 불필요)
    mutationFn: (variables: {
      targetType: 'posts' | 'comments';
      targetId: string;
      targetPostId?: string; // 댓글의 경우 포스트 ID
      emoji: string;
    }) =>
      reactionsApi.removeReaction({
        targetType: variables.targetType,
        targetId: variables.targetId,
        emoji: variables.emoji,
      }),

    // Optimistic Update: UI 먼저 업데이트
    onMutate: async ({ targetType, targetId, targetPostId, emoji }) => {
      const previousData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 캐시 데이터 낙관적 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;

          // 형태 1) infiniteQuery: {pages: [...], pageParams: [...]}
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data.map((post: Post) =>
                  targetType === 'posts'
                    ? applyRemoveReaction(post, targetId, emoji, user?.id)
                    : applyRemoveReactionFromComment(
                        post,
                        targetPostId || '',
                        targetId,
                        emoji,
                        user?.id
                      )
                ),
              })),
            };
          }

          // 형태 2) 일반 리스트: {posts: [...]} 등
          if (oldData.posts) {
            return {
              ...oldData,
              posts: oldData.posts.map((post: Post) =>
                targetType === 'posts'
                  ? applyRemoveReaction(post, targetId, emoji, user?.id)
                  : applyRemoveReactionFromComment(
                      post,
                      targetPostId || '',
                      targetId,
                      emoji,
                      user?.id
                    )
              ),
            };
          }

          return oldData;
        }
      );

      return { previousData };
    },

    // 에러 시 롤백
    onError: (err, variables, context) => {
      console.error('[useRemoveReaction] 리액션 제거 실패:', err);

      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
  });
}

// 공용 헬퍼: 포스트에서 리액션 제거 낙관적 적용
function applyRemoveReaction(
  post: Post,
  targetId: string,
  emoji: string,
  userId: string | undefined
): Post {
  if (post.id !== targetId) return post;

  const updatedReactions = post.reactions
    .map((reaction: Reaction) => {
      if (reaction.emoji !== emoji) return reaction;

      // 사용자 ID 제거
      const newUserIds = reaction.userIds.filter(id => id !== userId);

      return {
        ...reaction,
        count: Math.max(0, reaction.count - 1),
        userIds: newUserIds,
      };
    })
    // count가 0인 리액션은 제거
    .filter((reaction: Reaction) => reaction.count > 0);

  return { ...post, reactions: updatedReactions };
}

// 공용 헬퍼: 댓글에서 리액션 제거 낙관적 적용
function applyRemoveReactionFromComment(
  post: Post,
  targetPostId: string,
  targetId: string,
  emoji: string,
  userId: string | undefined
): Post {
  // targetPostId가 일치하지 않으면 변경하지 않음 (성능 최적화)
  if (targetPostId && post.id !== targetPostId) return post;

  // 댓글이 없는 포스트는 건너뛰기
  if (!post.comments || post.comments.length === 0) return post;

  // 해당 댓글을 포함하고 있는지 빠르게 확인
  const hasTargetComment = post.comments.some(c => c.id === targetId);
  if (!hasTargetComment) return post;

  return {
    ...post,
    comments: post.comments.map(comment => {
      if (comment.id !== targetId) return comment;

      const updatedReactions = (comment.reactions || [])
        .map((reaction: Reaction) => {
          if (reaction.emoji !== emoji) return reaction;

          // 사용자 ID 제거
          const newUserIds = reaction.userIds.filter(id => id !== userId);

          return {
            ...reaction,
            count: Math.max(0, reaction.count - 1),
            userIds: newUserIds,
          };
        })
        // count가 0인 리액션은 제거
        .filter((reaction: Reaction) => reaction.count > 0);

      return { ...comment, reactions: updatedReactions };
    }),
  };
}

/**
 * 리액션 토글을 위한 편의 훅
 * 이미 리액션한 경우 제거, 아닌 경우 추가
 */
export function useToggleReaction(spaceSlug: string) {
  const addReaction = useAddReaction(spaceSlug);
  const removeReaction = useRemoveReaction(spaceSlug);
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      targetPostId,
      emoji,
      currentReactions,
    }: {
      targetType: 'posts' | 'comments';
      targetId: string;
      targetPostId?: string; // 댓글의 경우 포스트 ID
      emoji: string;
      currentReactions: Reaction[];
    }) => {
      const existingReaction = currentReactions.find(r => r.emoji === emoji);
      const userHasReacted = existingReaction?.userIds.includes(user?.id || '');

      if (userHasReacted) {
        return removeReaction.mutateAsync({ targetType, targetId, targetPostId, emoji });
      } else {
        return addReaction.mutateAsync({ targetType, targetId, targetPostId, emoji });
      }
    },
  });
}
