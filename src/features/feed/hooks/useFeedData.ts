import { useAuth } from '@/shared/contexts/AuthContext';
import { postsKeys } from '@/shared/hooks/queries/postsKeys';
import { useExistsCheckin, usePosts } from '@/shared/hooks/queries/usePosts';
import { useTeamSummary } from '@/shared/hooks/queries/useTeamSummary';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useDateStore } from '@/shared/stores/useDateStore';
import type { Post as ApiPost } from '@/shared/types/post';
import type {
  CommentCreatedMessage,
  CommentDeletedMessage,
  CommentUpdatedMessage,
  ReactionAddedMessage,
  ReactionRemovedMessage,
  WebSocketEventHandler,
} from '@/shared/types/websocket.types';
import { convertWebSocketImageToImageMetadata } from '@/shared/types/websocket.types';
import { formatDateToAPIString, getErrorMessage } from '@/shared/utils';
import { debug } from '@/shared/utils/debug';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Comment, FilterType, Post, Reaction } from '../types/feed.types';
import { convertApiPostsToFeedPosts } from '../utils/postTransform.utils';

interface UseFeedDataOptions {
  onReconnectionDataSync?: () => void;
  visiblePostIds?: string[]; // 현재 화면에 보이는 포스트 ID들
}

export const useFeedData = (spaceSlug: string, options?: UseFeedDataOptions) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { selectedDate } = useDateStore();
  const { currentSpaceSlug } = useAuth();
  const queryClient = useQueryClient();

  // 쿼리 키 빌더 - 메모이제이션으로 불필요한 재생성 방지
  const buildListKey = useCallback(
    () =>
      postsKeys.list(spaceSlug, {
        filterType,
        date: formatDateToAPIString(selectedDate),
      }),
    [spaceSlug, filterType, selectedDate]
  );

  const existsCheckinQuery = useExistsCheckin({
    date: formatDateToAPIString(selectedDate),
  });

  // 실제 API 또는 Mock 데이터 사용
  const postsQuery = usePosts({
    filterType,
    selectedDate,
    enabled: true,
  });

  // 팀 요약 정보
  const teamSummaryQuery = useTeamSummary({
    date: selectedDate,
  });

  // 데이터 변환 및 계산된 값들 (WebSocket에서 사용하기 위해 먼저 계산)
  const { posts, isLoading, hasMore, nextCursor } = useMemo(() => {
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
  }, [postsQuery.data, postsQuery.isLoading]);

  // 디버깅: visiblePostIds 전달 확인
  useEffect(() => {
    debug('useFeedData', 'visiblePostIds passed to useWebSocket', options?.visiblePostIds || []);
  }, [options?.visiblePostIds]);

  // WebSocket 연결 및 이벤트 핸들러 (currentSpaceSlug 사용으로 Space 전환 시 자동 재연결)
  const webSocketActions = useWebSocket({
    spaceSlug: currentSpaceSlug || spaceSlug, // currentSpaceSlug를 우선 사용하여 Space 전환 시 재연결
    visiblePostIds: options?.visiblePostIds || [], // 현재 화면에 보이는 포스트 ID들
    onReconnectionDataSync: () => {
      debug('useFeedData', 'Reconnection data sync called');
      debug('useFeedData', '재연결 후 데이터 동기화 실행');

      // 외부에서 제공된 콜백 먼저 실행
      if (options?.onReconnectionDataSync) {
        options.onReconnectionDataSync();
      }

      // 포스트 데이터 refetch
      if (postsQuery.refetch) {
        postsQuery.refetch();
      }

      // 팀 요약 데이터도 refetch
      if (teamSummaryQuery.refetch) {
        teamSummaryQuery.refetch();
      }
    },
  });

  // Debug: Log when visiblePostIds change
  useEffect(() => {
    debug('useFeedData', 'visiblePostIds passed to useWebSocket', options?.visiblePostIds);
  }, [options?.visiblePostIds]);

  // 댓글 추가 핸들러
  const handleCommentAdded = useCallback(
    (postId: string, comment: Comment) => {
      const queryKey = buildListKey();

      debug('useFeedData', 'handleCommentAdded called', { postId, comment });

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        const targetPost = oldData.posts.find((p: Post) => p.id === postId);
        if (!targetPost) {
          debug('useFeedData', 'Target post not found', postId);
          return oldData;
        }

        const existingComments = targetPost.comments || [];

        // 실제 ID로 중복 체크
        const isDuplicate = existingComments.some((c: Comment) => c.id === comment.id);
        if (isDuplicate) {
          debug('useFeedData', 'Duplicate comment found, skipping', comment.id);
          return oldData; // 이미 존재하는 댓글이면 변경 없음
        }

        // 임시 ID를 가진 댓글이 있는지 체크 (작성자와 내용으로 매칭)
        const tempCommentIndex = existingComments.findIndex(
          (c: Comment) =>
            c.id.startsWith('temp-') &&
            c.author.id === comment.author.id &&
            c.content === comment.content
        );

        if (tempCommentIndex >= 0) {
          debug('useFeedData', 'Replacing temp comment', {
            tempComment: existingComments[tempCommentIndex],
            newComment: comment,
          });
        }

        return {
          ...oldData,
          posts: oldData.posts.map((post: any) => {
            if (post.id === postId) {
              let updatedComments = [...existingComments];

              if (tempCommentIndex >= 0) {
                // 임시 댓글을 실제 댓글로 교체
                updatedComments[tempCommentIndex] = comment;
              } else {
                // 새 댓글 추가 (WebSocket 이벤트가 optimistic update보다 먼저 도착한 경우)
                updatedComments = [...updatedComments, comment];
              }

              return {
                ...post,
                comments: updatedComments,
                commentCount: tempCommentIndex >= 0 ? post.commentCount : post.commentCount + 1,
                lastCommentTime: comment.createdAt,
              };
            }
            return post;
          }),
        };
      });
    },
    [queryClient, buildListKey]
  );

  const handleCommentUpdated = useCallback(
    (postId: string, comment: Comment) => {
      const queryKey = buildListKey();

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.posts) return old;

        const targetPost = old.posts.find((p: Post) => p.id === postId);
        if (!targetPost) return old;

        const existingComment = targetPost.comments.find((c: Comment) => c.id === comment.id);
        if (!existingComment) return old;

        // WebSocket 이벤트로 인한 중복 업데이트 방지
        // 기존 댓글의 updatedAt이 더 최신이면 업데이트 건너뛰기
        if (existingComment.updatedAt && comment.createdAt < existingComment.updatedAt) {
          return old;
        }

        return {
          ...old,
          posts: old.posts.map((post: Post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map((c: Comment) =>
                    c.id === comment.id
                      ? {
                          ...c, // 기존 데이터 유지 (생성시간, 작성자 등)
                          content: comment.content,
                          images: comment.images || c.images || [], // 새 이미지 사용 또는 기존 이미지 유지
                          updatedAt: new Date(), // 수정 시간 업데이트
                        }
                      : c
                  ),
                }
              : post
          ),
        };
      });
    },
    [queryClient, buildListKey]
  );

  // 댓글 삭제 핸들러
  const handleCommentDeleted = useCallback(
    (postId: string, commentId: string) => {
      const queryKey = buildListKey();

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
    [queryClient, buildListKey]
  );

  /**
   * 다른 사용자가 리액션을 추가했을 때 처리
   * WebSocket으로 받은 메시지를 기반으로 캐시 업데이트
   */
  const handleReactionAdded = useCallback(
    (message: ReactionAddedMessage) => {
      // 다른 스페이스의 메시지는 무시
      if (message.spaceSlug !== spaceSlug) return;

      debug('useFeedData', '리액션 추가 수신', message);

      const queryKey = buildListKey();

      // React Query 캐시 업데이트
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        // 포스트 리액션인 경우
        if (message.data.targetType === 'post') {
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

                // 스마트 업데이트: 이미 사용자가 있으면 업데이트하지 않음
                if (!reaction.spaceMemberIds.includes(message.data.spaceMemberId)) {
                  debug('useFeedData', '리액션 추가 실행 - 새로운 사용자', {
                    emoji: message.data.emoji,
                    spaceMemberId: message.data.spaceMemberId,
                  });
                  updatedReactions[existingReactionIndex] = {
                    ...reaction,
                    count: reaction.count + 1,
                    spaceMemberIds: [...reaction.spaceMemberIds, message.data.spaceMemberId],
                  };
                } else {
                  debug('useFeedData', '리액션 추가 스킵 - 이미 존재하는 사용자', {
                    emoji: message.data.emoji,
                    spaceMemberId: message.data.spaceMemberId,
                  });
                }

                return { ...post, reactions: updatedReactions };
              } else {
                // 새로운 리액션 추가
                debug('useFeedData', '새로운 리액션 추가', {
                  emoji: message.data.emoji,
                  spaceMemberId: message.data.spaceMemberId,
                });
                return {
                  ...post,
                  reactions: [
                    ...post.reactions,
                    {
                      emoji: message.data.emoji,
                      count: 1,
                      spaceMemberIds: [message.data.spaceMemberId],
                    },
                  ],
                };
              }
            }),
          };
        }

        // 댓글 리액션인 경우
        if (message.data.targetType === 'comment') {
          return {
            ...oldData,
            posts: oldData.posts.map((post: Post) => {
              // 해당 포스트가 아니면 그대로 반환
              if (post.id !== message.postId) return post;

              // 댓글 업데이트
              return {
                ...post,
                comments: post.comments.map((comment: Comment) => {
                  // 해당 댓글이 아니면 그대로 반환
                  if (comment.id !== message.data.targetId) return comment;

                  // 기존 리액션 찾기
                  const existingReactionIndex = (comment.reactions || []).findIndex(
                    (r: Reaction) => r.emoji === message.data.emoji
                  );

                  if (existingReactionIndex >= 0) {
                    // 기존 리액션에 사용자 추가
                    const updatedReactions = [...(comment.reactions || [])];
                    const reaction = updatedReactions[existingReactionIndex];

                    // 스마트 업데이트: 이미 사용자가 있으면 업데이트하지 않음
                    if (!reaction.spaceMemberIds.includes(message.data.spaceMemberId)) {
                      debug('useFeedData', '댓글 리액션 추가 실행 - 새로운 사용자', {
                        emoji: message.data.emoji,
                        spaceMemberId: message.data.spaceMemberId,
                      });
                      updatedReactions[existingReactionIndex] = {
                        ...reaction,
                        count: reaction.count + 1,
                        spaceMemberIds: [...reaction.spaceMemberIds, message.data.spaceMemberId],
                      };
                    } else {
                      debug('useFeedData', '댓글 리액션 추가 스킵 - 이미 존재하는 사용자', {
                        emoji: message.data.emoji,
                        spaceMemberId: message.data.spaceMemberId,
                      });
                    }

                    return { ...comment, reactions: updatedReactions };
                  } else {
                    // 새로운 리액션 추가
                    debug('useFeedData', '새로운 댓글 리액션 추가', {
                      emoji: message.data.emoji,
                      spaceMemberId: message.data.spaceMemberId,
                    });
                    return {
                      ...comment,
                      reactions: [
                        ...(comment.reactions || []),
                        {
                          emoji: message.data.emoji,
                          count: 1,
                          spaceMemberIds: [message.data.spaceMemberId],
                        },
                      ],
                    };
                  }
                }),
              };
            }),
          };
        }

        return oldData;
      });
    },
    [spaceSlug, queryClient, buildListKey]
  );

  /**
   * 다른 사용자가 리액션을 제거했을 때 처리
   * WebSocket으로 받은 메시지를 기반으로 캐시 업데이트
   */
  const handleReactionRemoved = useCallback(
    (message: ReactionRemovedMessage) => {
      // 다른 스페이스의 메시지는 무시
      if (message.spaceSlug !== spaceSlug) return;

      debug('useFeedData', '리액션 제거 수신', message);

      const queryKey = buildListKey();

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.posts) return oldData;

        // 포스트 리액션인 경우
        if (message.data.targetType === 'post') {
          return {
            ...oldData,
            posts: oldData.posts.map((post: Post) => {
              if (post.id !== message.data.targetId) return post;

              // 스마트 업데이트: 해당 사용자가 실제로 있을 때만 제거
              const updatedReactions = post.reactions
                .map((reaction: Reaction) => {
                  if (reaction.emoji !== message.data.emoji) {
                    return reaction;
                  }

                  // 스마트 업데이트: 해당 사용자가 있는지 확인
                  if (reaction.spaceMemberIds.includes(message.data.spaceMemberId)) {
                    debug('useFeedData', '리액션 제거 실행 - 사용자 존재', {
                      emoji: message.data.emoji,
                      spaceMemberId: message.data.spaceMemberId,
                    });
                    const newspaceMemberIds = reaction.spaceMemberIds.filter(
                      id => id !== message.data.spaceMemberId
                    );
                    return {
                      ...reaction,
                      count: Math.max(0, reaction.count - 1),
                      spaceMemberIds: newspaceMemberIds,
                    };
                  } else {
                    debug('useFeedData', '리액션 제거 스킵 - 사용자 없음', {
                      emoji: message.data.emoji,
                      spaceMemberId: message.data.spaceMemberId,
                    });
                    return reaction;
                  }
                })
                // count가 0인 리액션은 제거
                .filter((reaction: Reaction) => reaction.count > 0);

              return { ...post, reactions: updatedReactions };
            }),
          };
        }

        // 댓글 리액션인 경우
        if (message.data.targetType === 'comment') {
          return {
            ...oldData,
            posts: oldData.posts.map((post: Post) => {
              // 해당 포스트가 아니면 그대로 반환
              if (post.id !== message.postId) return post;

              // 댓글 업데이트
              return {
                ...post,
                comments: post.comments.map((comment: Comment) => {
                  // 해당 댓글이 아니면 그대로 반환
                  if (comment.id !== message.data.targetId) return comment;

                  // 스마트 업데이트: 해당 사용자가 실제로 있을 때만 제거
                  const updatedReactions = (comment.reactions || [])
                    .map((reaction: Reaction) => {
                      if (reaction.emoji !== message.data.emoji) {
                        return reaction;
                      }

                      // 스마트 업데이트: 해당 사용자가 있는지 확인
                      if (reaction.spaceMemberIds.includes(message.data.spaceMemberId)) {
                        debug('useFeedData', '댓글 리액션 제거 실행 - 사용자 존재', {
                          emoji: message.data.emoji,
                          spaceMemberId: message.data.spaceMemberId,
                        });
                        const newspaceMemberIds = reaction.spaceMemberIds.filter(
                          id => id !== message.data.spaceMemberId
                        );
                        return {
                          ...reaction,
                          count: Math.max(0, reaction.count - 1),
                          spaceMemberIds: newspaceMemberIds,
                        };
                      } else {
                        debug('useFeedData', '댓글 리액션 제거 스킵 - 사용자 없음', {
                          emoji: message.data.emoji,
                          spaceMemberId: message.data.spaceMemberId,
                        });
                        return reaction;
                      }
                    })
                    // count가 0인 리액션은 제거
                    .filter((reaction: Reaction) => reaction.count > 0);

                  return { ...comment, reactions: updatedReactions };
                }),
              };
            }),
          };
        }

        return oldData;
      });
    },
    [spaceSlug, queryClient, buildListKey]
  );

  // WebSocket 이벤트 래퍼 함수들을 useRef로 메모이제이션
  // 초기값은 null로 설정하고 useEffect에서만 업데이트
  const eventHandlersRef = useRef<{
    commentCreated: WebSocketEventHandler<CommentCreatedMessage>;
    commentUpdated: WebSocketEventHandler<CommentUpdatedMessage>;
    commentDeleted: WebSocketEventHandler<CommentDeletedMessage>;
    reactionAdded: WebSocketEventHandler<ReactionAddedMessage>;
    reactionRemoved: WebSocketEventHandler<ReactionRemovedMessage>;
  } | null>(null);

  // 핸들러 의존성 업데이트
  useEffect(() => {
    eventHandlersRef.current = {
      commentCreated: (message: CommentCreatedMessage) => {
        if (message.data?.postId && message.data?.commentId) {
          const convertedImages = (message.data.images || []).map(
            convertWebSocketImageToImageMetadata
          );

          debug('WebSocket', 'commentCreated', {
            messageData: message.data,
            convertedImages,
          });

          const comment: Comment = {
            id: message.data.commentId,
            author: {
              id: message.data.spaceMemberId,
              name: message.data.userName,
              profileImage: message.data.userAvatarURL,
            },
            content: message.data.content || '',
            createdAt: new Date(),
            images: convertedImages,
            reactions: [],
          };

          handleCommentAdded(message.data.postId, comment);
        }
      },
      commentUpdated: (message: CommentUpdatedMessage) => {
        if (message.data?.postId && message.data?.commentId) {
          // WebSocket 이벤트에서 옵티미스틱 업데이트를 덮어쓰지 않도록 최소한의 데이터만 전달
          const comment: Comment = {
            id: message.data.commentId,
            author: {
              id: message.data.spaceMemberId,
              name: message.data.userName,
              profileImage: message.data.userAvatarURL,
            },
            content: message.data.content || '',
            createdAt: new Date(message.timestamp || Date.now()), // 서버 타임스탬프 사용
            images: (message.data.images || []).map(convertWebSocketImageToImageMetadata),
            reactions: [], // 리액션은 별도로 처리되므로 비워둡
          };
          handleCommentUpdated(message.data.postId, comment);
        }
      },
      commentDeleted: (message: CommentDeletedMessage) => {
        if (message.data?.postId && message.data?.commentId) {
          handleCommentDeleted(message.data.postId, message.data.commentId);
        }
      },
      reactionAdded: (message: ReactionAddedMessage) => {
        handleReactionAdded(message);
      },
      reactionRemoved: (message: ReactionRemovedMessage) => {
        handleReactionRemoved(message);
      },
    };
  }, [
    handleCommentAdded,
    handleCommentUpdated,
    handleCommentDeleted,
    handleReactionAdded,
    handleReactionRemoved,
  ]);

  // WebSocket 이벤트 리스너 등록
  useEffect(() => {
    if (!webSocketActions || !eventHandlersRef.current) return;

    const handlers = eventHandlersRef.current;

    // 타입 안전한 이벤트 리스너 등록
    webSocketActions.addEventListener('comment.created', handlers.commentCreated);
    webSocketActions.addEventListener('comment.updated', handlers.commentUpdated);
    webSocketActions.addEventListener('comment.deleted', handlers.commentDeleted);
    webSocketActions.addEventListener('reaction.added', handlers.reactionAdded);
    webSocketActions.addEventListener('reaction.removed', handlers.reactionRemoved);

    // cleanup: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      webSocketActions.removeEventListener('comment.created', handlers.commentCreated);
      webSocketActions.removeEventListener('comment.updated', handlers.commentUpdated);
      webSocketActions.removeEventListener('comment.deleted', handlers.commentDeleted);
      webSocketActions.removeEventListener('reaction.added', handlers.reactionAdded);
      webSocketActions.removeEventListener('reaction.removed', handlers.reactionRemoved);
    };
  }, [webSocketActions]);

  return {
    existsCheckinQuery,
    teamSummaryQuery,
    // 데이터
    posts,
    teamSummary: teamSummaryQuery.data,

    // 필터 상태
    filterType,
    setFilterType,

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
  };
};
