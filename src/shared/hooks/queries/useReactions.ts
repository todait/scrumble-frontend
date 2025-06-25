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
    // 서버에 리액션 추가 요청
    mutationFn: (variables: {
      targetType: 'posts' | 'comments';
      targetId: string;
      emoji: string;
    }) => reactionsApi.addReaction(variables),

    // Optimistic Update: 서버 요청 전에 UI를 먼저 업데이트
    onMutate: async ({ targetType, targetId, emoji }) => {
      // 🔄 모든 목록(필터/날짜 조합 포함) 취소
      await queryClient.cancelQueries({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 현재 캐시된 모든 목록 캐시 백업 (롤백용)
      const previousData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 포스트 리액션인 경우 캐시 데이터 낙관적 업데이트 (모든 목록 대상)
      if (targetType === 'posts') {
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
                    applyAddReaction(post, targetId, emoji, user?.id)
                  ),
                })),
              };
            }

            // 형태 2) 일반 리스트: {posts: [...]} 등
            if (oldData.posts) {
              return {
                ...oldData,
                posts: oldData.posts.map((post: Post) =>
                  applyAddReaction(post, targetId, emoji, user?.id)
                ),
              };
            }

            return oldData;
          }
        );
      }

      return { previousData };
    },

    // 에러 발생 시: 백업 데이터로 롤백
    onError: (err, variables, context) => {
      console.error('[useAddReaction] 리액션 추가 실패:', err);

      // 백업 데이터가 있으면 롤백 (모든 쿼리)
      context?.previousData?.forEach(([key, data]: any) => {
        queryClient.setQueryData(key, data);
      });

      // 사용자에게 에러 알림 (토스트 메시지 등)
      // TODO: 에러 토스트 표시 로직 추가
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

/**
 * 리액션 제거를 위한 뮤테이션 훅
 * 추가와 동일한 패턴으로 Optimistic Update 제공
 */
export function useRemoveReaction(spaceSlug: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    // 서버에 리액션 제거 요청
    mutationFn: (variables: {
      targetType: 'posts' | 'comments';
      targetId: string;
      emoji: string;
    }) => reactionsApi.removeReaction(variables),

    // Optimistic Update: UI 먼저 업데이트
    onMutate: async ({ targetType, targetId, emoji }) => {
      await queryClient.cancelQueries({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      const previousData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 포스트 리액션인 경우 캐시 데이터 낙관적 업데이트
      if (targetType === 'posts') {
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
                  data: page.data.map((post: Post) => {
                    if (post.id !== targetId) return post;

                    const updatedReactions = post.reactions
                      .map((reaction: Reaction) => {
                        if (reaction.emoji !== emoji) return reaction;

                        // 사용자 ID 제거
                        const newUserIds = reaction.userIds.filter(id => id !== user?.id);

                        return {
                          ...reaction,
                          count: Math.max(0, reaction.count - 1),
                          userIds: newUserIds,
                        };
                      })
                      // count가 0인 리액션은 제거
                      .filter((reaction: Reaction) => reaction.count > 0);

                    return { ...post, reactions: updatedReactions };
                  }),
                })),
              };
            }

            // 형태 2) 일반 리스트: {posts: [...]} 등
            if (oldData.posts) {
              return {
                ...oldData,
                posts: oldData.posts.map((post: Post) => {
                  if (post.id !== targetId) return post;

                  const updatedReactions = post.reactions
                    .map((reaction: Reaction) => {
                      if (reaction.emoji !== emoji) return reaction;

                      // 사용자 ID 제거
                      const newUserIds = reaction.userIds.filter(id => id !== user?.id);

                      return {
                        ...reaction,
                        count: Math.max(0, reaction.count - 1),
                        userIds: newUserIds,
                      };
                    })
                    // count가 0인 리액션은 제거
                    .filter((reaction: Reaction) => reaction.count > 0);

                  return { ...post, reactions: updatedReactions };
                }),
              };
            }

            return oldData;
          }
        );
      }

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
      emoji,
      currentReactions,
    }: {
      targetType: 'posts' | 'comments';
      targetId: string;
      emoji: string;
      currentReactions: Reaction[];
    }) => {
      const existingReaction = currentReactions.find(r => r.emoji === emoji);
      const userHasReacted = existingReaction?.userIds.includes(user?.id || '');

      if (userHasReacted) {
        return removeReaction.mutateAsync({ targetType, targetId, emoji });
      } else {
        return addReaction.mutateAsync({ targetType, targetId, emoji });
      }
    },
  });
}
