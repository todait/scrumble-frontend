/**
 * 리액션 관련 React Query 훅들
 * Optimistic Update와 에러 롤백 기능을 포함합니다
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reactionsApi } from '@/shared/lib/api/reactions';
import { postsKeys } from './postsKeys';
import type { Reaction, Post } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/hooks/auth/useAuth';
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
      // 진행 중인 refetch 취소 (데이터 충돌 방지)
      await queryClient.cancelQueries({ 
        queryKey: postsKeys.list(spaceSlug) 
      });

      // 현재 캐시된 데이터 백업 (롤백용)
      const previousData = queryClient.getQueryData(
        postsKeys.list(spaceSlug)
      );

      // 포스트 리액션인 경우 캐시 데이터 낙관적 업데이트
      if (targetType === 'posts') {
        queryClient.setQueryData(postsKeys.list(spaceSlug), (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((post: Post) => {
                // 해당 포스트가 아니면 그대로 반환
                if (post.id !== targetId) return post;

                // 기존 리액션 찾기
                const existingReactionIndex = post.reactions.findIndex(
                  (r: Reaction) => r.emoji === emoji
                );

                if (existingReactionIndex >= 0) {
                  // 기존 리액션이 있으면 count 증가 및 userId 추가
                  const updatedReactions = [...post.reactions];
                  const reaction = updatedReactions[existingReactionIndex];

                  // 이미 리액션한 경우는 무시
                  if (!reaction.userIds.includes(user?.id || '')) {
                    updatedReactions[existingReactionIndex] = {
                      ...reaction,
                      count: reaction.count + 1,
                      userIds: [...reaction.userIds, user?.id || ''],
                    };
                  }

                  return { ...post, reactions: updatedReactions };
                } else {
                  // 새로운 리액션 추가
                  return {
                    ...post,
                    reactions: [
                      ...post.reactions,
                      {
                        emoji,
                        count: 1,
                        userIds: [user?.id || ''],
                      },
                    ],
                  };
                }
              }),
            })),
          };
        });
      }

      // 백업 데이터 반환 (onError에서 사용)
      return { previousData };
    },

    // 에러 발생 시: 백업 데이터로 롤백
    onError: (err, variables, context) => {
      console.error('[useAddReaction] 리액션 추가 실패:', err);
      
      // 백업 데이터가 있으면 롤백
      if (context?.previousData) {
        queryClient.setQueryData(
          postsKeys.list(spaceSlug), 
          context.previousData
        );
      }
      
      // 사용자에게 에러 알림 (토스트 메시지 등)
      // TODO: 에러 토스트 표시 로직 추가
    },

    // 성공/실패 관계없이 마지막에 실행: 서버 데이터로 동기화
    onSettled: () => {
      // 서버에서 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ 
        queryKey: postsKeys.list(spaceSlug) 
      });
    },
  });
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
        queryKey: postsKeys.list(spaceSlug) 
      });

      const previousData = queryClient.getQueryData(
        postsKeys.list(spaceSlug)
      );

      // 포스트 리액션인 경우 캐시 데이터 낙관적 업데이트
      if (targetType === 'posts') {
        queryClient.setQueryData(postsKeys.list(spaceSlug), (oldData: any) => {
          if (!oldData?.pages) return oldData;

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
                    const newUserIds = reaction.userIds.filter(
                      id => id !== user?.id
                    );
                    
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
        });
      }

      return { previousData };
    },

    // 에러 시 롤백
    onError: (err, variables, context) => {
      console.error('[useRemoveReaction] 리액션 제거 실패:', err);
      
      if (context?.previousData) {
        queryClient.setQueryData(
          postsKeys.list(spaceSlug), 
          context.previousData
        );
      }
    },

    // 서버 데이터로 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: postsKeys.list(spaceSlug) 
      });
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
      currentReactions 
    }: { 
      targetType: 'posts' | 'comments';
      targetId: string; 
      emoji: string; 
      currentReactions: Reaction[] 
    }) => {
      const existingReaction = currentReactions.find(
        r => r.emoji === emoji
      );
      const userHasReacted = existingReaction?.userIds.includes(
        user?.id || ''
      );

      if (userHasReacted) {
        return removeReaction.mutateAsync({ targetType, targetId, emoji });
      } else {
        return addReaction.mutateAsync({ targetType, targetId, emoji });
      }
    },
  });
}