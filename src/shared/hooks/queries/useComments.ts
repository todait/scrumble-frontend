import type { Comment } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/contexts/AuthContext';
import { commentsApi } from '@/shared/lib/api/comments';
import type {
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '@/shared/types/comment';
import { getErrorMessage } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { postsKeys } from './postsKeys';

/**
 * 댓글 생성 훅
 * 새로운 댓글을 작성합니다 (Optimistic Update 지원)
 */
export const useCreateComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();
  const { user } = useAuth();

  return useMutation<CreateCommentResponse, Error, CreateCommentRequest>({
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Comment API call - Images count:', params.images?.length || 0);
        console.warn('Comment API call - Images:', params.images);
      }
      return commentsApi.createComment(params);
    },
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(spaceSlug) });

      // 현재 사용자 정보로 즉시 댓글 생성
      const tempId = `temp-${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempId, // 임시 ID
        author: {
          id: user?.id || '',
          name: user?.name || '',
          profileImage: user?.avatarURL || '',
        },
        content: variables.content,
        createdAt: new Date(),
        images: variables.images || [],
        reactions: [],
      };

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) =>
              post.id === variables.postId
                ? {
                    ...post,
                    comments: [optimisticComment, ...post.comments],
                    commentCount: post.commentCount + 1,
                    lastCommentTime: new Date(),
                  }
                : post
            ),
          };
        }
      );

      return { previousQueries, optimisticComment, tempId };
    },
    onSuccess: (data, variables, context) => {
      if (!context) return;

      // 서버 응답의 실제 댓글 데이터로 임시 댓글 교체
      const actualComment: Comment = {
        id: data.comment.id,
        author: {
          id: data.comment.author.id,
          name: data.comment.author.name,
          profileImage: data.comment.author.avatarURL || '',
        },
        content: data.comment.content,
        createdAt: new Date(data.comment.createdAt),
        images: variables.images || [], // 서버 응답에 이미지가 없으므로 요청 데이터 사용
        reactions: [],
      };

      // 임시 ID를 실제 ID로 교체
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) =>
              post.id === variables.postId
                ? {
                    ...post,
                    comments: post.comments.map((comment: Comment) =>
                      comment.id === context.tempId ? actualComment : comment
                    ),
                  }
                : post
            ),
          };
        }
      );

      success({
        title: '댓글 작성 완료',
        message: '댓글이 성공적으로 작성되었습니다.',
      });
    },
    onError: (err: unknown, variables, context) => {
      // 에러 발생 시 모든 캐시를 이전 상태로 롤백
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }

      error({
        title: '댓글 작성 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

/**
 * 댓글 수정 훅
 * 기존 댓글을 수정합니다 (Optimistic Update 지원)
 */
export const useUpdateComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  return useMutation<UpdateCommentResponse, Error, UpdateCommentRequest>({
    mutationFn: params => commentsApi.updateComment(params),
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(spaceSlug) });

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) => ({
              ...post,
              comments: post.comments.map((comment: any) =>
                comment.id === variables.commentId
                  ? {
                      ...comment,
                      content: variables.content,
                      images: variables.images || [],
                      updatedAt: new Date(),
                    }
                  : comment
              ),
            })),
          };
        }
      );

      return { previousQueries };
    },
    onSuccess: (data, variables) => {
      // 서버 응답으로 최종 업데이트
      const updatedComment: Partial<Comment> = {
        content: data.comment.content,
        images: variables.images || [], // 서버 응답에 이미지가 없으므로 요청 데이터 사용
      };

      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) => ({
              ...post,
              comments: post.comments.map((comment: any) =>
                comment.id === variables.commentId
                  ? { ...comment, ...updatedComment }
                  : comment
              ),
            })),
          };
        }
      );

      success({
        title: '댓글 수정 완료',
        message: '댓글이 성공적으로 수정되었습니다.',
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 발생 시 모든 캐시를 이전 상태로 롤백
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }

      error({
        title: '댓글 수정 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

/**
 * 댓글 삭제 훅
 * 댓글을 삭제합니다 (Optimistic Update 지원)
 */
export const useDeleteComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  return useMutation<DeleteCommentResponse, Error, DeleteCommentRequest>({
    mutationFn: params => commentsApi.deleteComment(params),
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(spaceSlug) });

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(spaceSlug),
        exact: false,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) => {
              const updatedComments = post.comments.filter((comment: any) => comment.id !== variables.commentId);
              return {
                ...post,
                comments: updatedComments,
                commentCount: Math.max(0, post.commentCount - 1),
              };
            }),
          };
        }
      );

      return { previousQueries };
    },
    onSuccess: (_data, _variables) => {
      success({
        title: '댓글 삭제 완료',
        message: '댓글이 성공적으로 삭제되었습니다.',
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 발생 시 모든 캐시를 이전 상태로 롤백
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }

      error({
        title: '댓글 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};
