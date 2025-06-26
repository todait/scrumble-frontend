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
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`, // 임시 ID
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

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData(postsKeys.lists(spaceSlug));

      // 즉시 캐시에 댓글 추가 (Optimistic Update)
      queryClient.setQueryData(postsKeys.lists(spaceSlug), (oldData: any) => {
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
      });

      return { previousData, optimisticComment };
    },
    onSuccess: (_data, _variables) => {
      // WebSocket 이벤트가 실제 동기화를 담당하므로 invalidateQueries 제거
      // 대신 성공 토스트만 표시
      success({
        title: '댓글 작성 완료',
        message: '댓글이 성공적으로 작성되었습니다.',
      });
    },
    onError: (err: unknown, variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      const ctx = context as { previousData?: any; optimisticComment?: Comment } | undefined;
      if (ctx?.previousData) {
        queryClient.setQueryData(postsKeys.lists(spaceSlug), ctx.previousData);
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

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData(postsKeys.lists(spaceSlug));

      // 즉시 캐시에 댓글 업데이트 (Optimistic Update)
      queryClient.setQueryData(postsKeys.lists(spaceSlug), (oldData: any) => {
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
                    images: variables.images || comment.images,
                    updatedAt: new Date(),
                  }
                : comment
            ),
          })),
        };
      });

      return { previousData };
    },
    onSuccess: (_data, _variables) => {
      // WebSocket 이벤트가 실제 동기화를 담당하므로 invalidateQueries 제거
      success({
        title: '댓글 수정 완료',
        message: '댓글이 성공적으로 수정되었습니다.',
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      const ctx = context as { previousData?: any } | undefined;
      if (ctx?.previousData) {
        queryClient.setQueryData(postsKeys.lists(spaceSlug), ctx.previousData);
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

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData(postsKeys.lists(spaceSlug));

      // 즉시 캐시에서 댓글 삭제 (Optimistic Update)
      queryClient.setQueryData(postsKeys.lists(spaceSlug), (oldData: any) => {
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
      });

      return { previousData };
    },
    onSuccess: (_data, _variables) => {
      // WebSocket 이벤트가 실제 동기화를 담당하므로 invalidateQueries 제거
      success({
        title: '댓글 삭제 완료',
        message: '댓글이 성공적으로 삭제되었습니다.',
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      const ctx = context as { previousData?: any } | undefined;
      if (ctx?.previousData) {
        queryClient.setQueryData(postsKeys.lists(spaceSlug), ctx.previousData);
      }

      error({
        title: '댓글 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};
