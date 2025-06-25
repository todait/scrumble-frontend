import { postsKeys } from '@/shared/hooks/queries/postsKeys';
import { useExistsCheckin, usePosts } from '@/shared/hooks/queries/usePosts';
import { useTeamSummary } from '@/shared/hooks/queries/useTeamSummary';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import type { Post as ApiPost } from '@/shared/types/post';
import type { ReactionAddedMessage, ReactionRemovedMessage } from '@/shared/types/websocket.types';
import { formatDateToAPIString, getErrorMessage } from '@/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Comment, FilterType, Post, Reaction } from '../types/feed.types';
import { convertApiPostsToFeedPosts } from '../utils/postTransform.utils';
import { useMockPosts } from './useMockPosts';

export const useFeedData = (spaceSlug: string) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  // temp-space-id일 때는 mock 데이터 사용
  const useMockData = spaceSlug === 'temp-space-id';

  const existsCheckinQuery = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(selectedDate),
  });

  // 실제 API 또는 Mock 데이터 사용
  const realPostsQuery = usePosts({
    spaceSlug,
    filterType,
    selectedDate,
    enabled: !useMockData,
  });

  const mockPostsQuery = useMockPosts({
    filterType,
  });

  const postsQuery = useMockData ? mockPostsQuery : realPostsQuery;

  // 팀 요약 정보
  const teamSummaryQuery = useTeamSummary({
    spaceSlug,
    date: selectedDate,
    enabled: true, // 팀 요약은 항상 활성화
  });

  // 데이터 변환 및 계산된 값들 (WebSocket에서 사용하기 위해 먼저 계산)
  const { posts, isLoading, hasMore, nextCursor } = useMemo(() => {
    if (useMockData) {
      // Mock 데이터는 이미 Feed Post 타입으로 정의됨
      return {
        posts: postsQuery.data?.posts || [],
        isLoading: postsQuery.isLoading,
        hasMore: postsQuery.data?.hasMore || false,
        nextCursor: postsQuery.data?.nextCursor,
      };
    }

    // API 데이터는 변환 필요
    const apiPosts = (postsQuery.data?.posts || []) as ApiPost[];
    // invalidation 후 새로운 데이터를 가져오는 중이거나 초기 로딩 중일 때
    const shouldShowLoading = postsQuery.isLoading;

    return {
      posts: convertApiPostsToFeedPosts(apiPosts),
      isLoading: shouldShowLoading,
      hasMore: postsQuery.data?.hasMore || false,
      nextCursor: postsQuery.data?.nextCursor,
    };
  }, [useMockData, postsQuery.data, postsQuery.isLoading]);

  // WebSocket 연결 및 이벤트 핸들러
  const webSocketActions = useWebSocket({
    spaceSlug,
    visiblePostIds: posts.map(p => p.id), // 현재 보이는 포스트 ID들
  });

  // 댓글 추가 핸들러
  const handleCommentAdded = useCallback(
    (postId: string, comment: Comment) => {
      // 현재 필터 조건에 맞는 쿼리 키 생성
      const queryKey = postsKeys.list(spaceSlug, {
        filterType,
        date: formatDateToAPIString(selectedDate),
      });

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        const existingComments = oldData.posts.find((p: Post) => p.id === postId)?.comments || [];
        const isDuplicate = existingComments.some((c: Comment) => c.id === comment.id);
        if (isDuplicate) {
          return oldData; // 중복이면 변경 없음
        }

        return {
          ...oldData,
          posts: oldData.posts.map((post: any) => {
            if (post.id === postId) {
              return {
                ...post,
                commentCount: post.commentCount + 1,
                comments: [...existingComments, comment],
                lastCommentTime: comment.createdAt,
              };
            }
            return post;
          }),
        };
      });
    },
    [queryClient, spaceSlug, filterType, selectedDate]
  );

  // 댓글 삭제 핸들러
  const handleCommentDeleted = useCallback(
    (postId: string, commentId: string) => {
      const queryKey = postsKeys.list(spaceSlug, {
        filterType,
        date: formatDateToAPIString(selectedDate),
      });

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        return {
          ...oldData,
          posts: oldData.posts.map((post: any) => {
            if (post.id === postId) {
              const updatedComments = (post.comments || []).filter(
                (c: Comment) => c.id !== commentId
              );
              return {
                ...post,
                commentCount: Math.max(0, post.commentCount - 1),
                comments: updatedComments,
                lastCommentTime:
                  updatedComments.length > 0
                    ? updatedComments[updatedComments.length - 1].createdAt
                    : post.lastCommentTime,
              };
            }
            return post;
          }),
        };
      });
    },
    [queryClient, spaceSlug, filterType, selectedDate]
  );

  /**
   * 다른 사용자가 리액션을 추가했을 때 처리
   * WebSocket으로 받은 메시지를 기반으로 캐시 업데이트
   */
  const handleReactionAdded = useCallback(
    (message: ReactionAddedMessage) => {
      // 다른 스페이스의 메시지는 무시
      if (message.spaceSlug !== spaceSlug) return;

      if (process.env.NODE_ENV === 'development') {
        console.log('[Feed] 리액션 추가 수신:', message);
      }

      // 현재 필터 조건에 맞는 쿼리 키
      const queryKey = postsKeys.list(spaceSlug, {
        filterType,
        date: formatDateToAPIString(selectedDate),
      });

      // React Query 캐시 업데이트
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        return {
          ...oldData,
          posts: oldData.posts.map((post: Post) => {
            // 해당 포스트가 아니면 그대로 반환
            if (post.id !== message.data.targetId) return post;

            // 기존 리액션 찾기
            const existingReactionIndex = post.reactions.findIndex(
              (r: Reaction) => r.emoji === message.data.emoji
            );

            if (existingReactionIndex >= 0) {
              // 기존 리액션에 사용자 추가
              const updatedReactions = [...post.reactions];
              const reaction = updatedReactions[existingReactionIndex];

              // 중복 체크
              if (!reaction.userIds.includes(message.data.userId)) {
                updatedReactions[existingReactionIndex] = {
                  ...reaction,
                  count: reaction.count + 1,
                  userIds: [...reaction.userIds, message.data.userId],
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
                    emoji: message.data.emoji,
                    count: 1,
                    userIds: [message.data.userId],
                  },
                ],
              };
            }
          }),
        };
      });
    },
    [spaceSlug, queryClient, filterType, selectedDate]
  );

  /**
   * 다른 사용자가 리액션을 제거했을 때 처리
   * WebSocket으로 받은 메시지를 기반으로 캐시 업데이트
   */
  const handleReactionRemoved = useCallback(
    (message: ReactionRemovedMessage) => {
      // 다른 스페이스의 메시지는 무시
      if (message.spaceSlug !== spaceSlug) return;

      if (process.env.NODE_ENV === 'development') {
        console.log('[Feed] 리액션 제거 수신:', message);
      }

      const queryKey = postsKeys.list(spaceSlug, {
        filterType,
        date: formatDateToAPIString(selectedDate),
      });

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        return {
          ...oldData,
          posts: oldData.posts.map((post: Post) => {
            if (post.id !== message.data.targetId) return post;

            // 해당 리액션 업데이트
            const updatedReactions = post.reactions
              .map((reaction: Reaction) => {
                if (reaction.emoji !== message.data.emoji) {
                  return reaction;
                }

                // 사용자 ID 제거
                const newUserIds = reaction.userIds.filter(id => id !== message.data.userId);

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
      });
    },
    [spaceSlug, queryClient, filterType, selectedDate]
  );

  // WebSocket 이벤트 리스너 등록
  useEffect(() => {
    if (!webSocketActions) return;

    // 댓글 이벤트 래퍼 함수들
    const handleCommentCreatedWrapper = (message: any) => {
      if (message.type === 'comment.created' && message.data?.postId && message.data?.commentId) {
        // WebSocket 메시지를 Comment 형태로 변환
        const comment: Comment = {
          id: message.data.commentId,
          author: {
            id: message.data.userId,
            name: message.data.userName || 'Unknown User',
            profileImage: message.data.userAvatarURL || '',
          },
          content: message.data.content || '',
          createdAt: new Date(),
          images: [],
          reactions: [],
        };
        handleCommentAdded(message.data.postId, comment);
      }
    };

    const handleCommentDeletedWrapper = (message: any) => {
      if (message.type === 'comment.deleted' && message.data?.postId && message.data?.commentId) {
        handleCommentDeleted(message.data.postId, message.data.commentId);
      }
    };

    // 리액션 이벤트 래퍼 함수들
    const handleReactionAddedWrapper = (message: any) => {
      if (message.type === 'reaction.added') {
        handleReactionAdded(message as ReactionAddedMessage);
      }
    };

    const handleReactionRemovedWrapper = (message: any) => {
      if (message.type === 'reaction.removed') {
        handleReactionRemoved(message as ReactionRemovedMessage);
      }
    };

    // 이벤트 리스너 등록
    webSocketActions.addEventListener('comment.created', handleCommentCreatedWrapper);
    webSocketActions.addEventListener('comment.deleted', handleCommentDeletedWrapper);
    webSocketActions.addEventListener('reaction.added', handleReactionAddedWrapper);
    webSocketActions.addEventListener('reaction.removed', handleReactionRemovedWrapper);

    // cleanup: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      webSocketActions.removeEventListener('comment.created', handleCommentCreatedWrapper);
      webSocketActions.removeEventListener('comment.deleted', handleCommentDeletedWrapper);
      webSocketActions.removeEventListener('reaction.added', handleReactionAddedWrapper);
      webSocketActions.removeEventListener('reaction.removed', handleReactionRemovedWrapper);
    };
  }, [
    webSocketActions,
    handleCommentAdded,
    handleCommentDeleted,
    handleReactionAdded,
    handleReactionRemoved,
  ]);

  return {
    existsCheckinQuery,
    teamSummaryQuery,
    // 데이터
    posts,
    teamSummary: teamSummaryQuery.data,

    // 필터 상태
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,

    // 로딩 및 에러 상태
    isLoading: isLoading || teamSummaryQuery.isLoading,
    error: postsQuery.error
      ? getErrorMessage(postsQuery.error)
      : teamSummaryQuery.error
        ? getErrorMessage(teamSummaryQuery.error)
        : null,
    isError: postsQuery.isError || teamSummaryQuery.isError,

    // 페이지네이션
    hasMore,
    nextCursor,
    refetch: postsQuery.refetch,

    // 디버깅
    useMockData,
  };
};
