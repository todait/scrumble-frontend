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
import { postsKeys } from './postsKeys';
import { commentsKeys } from './commentsKeys';
import { useToast } from '../useToast';

/**
 * 댓글 생성 훅
 * 새로운 댓글을 작성합니다
 */
export const useCreateComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  return useMutation<CreateCommentResponse, Error, CreateCommentRequest>({
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Comment API call - Images count:', params.images?.length || 0);
        console.warn('Comment API call - Images:', params.images);
      }
      return commentsApi.createComment(params);
    },
    onSuccess: (data, variables) => {
      // 포스트 목록 무효화 (댓글이 추가되었으므로)
      queryClient.invalidateQueries({ queryKey: postsKeys.lists(spaceSlug) });
      // 해당 포스트의 댓글 목록 무효화
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(variables.postId) });
      
      success({
        title: '댓글 작성 완료',
        message: '댓글이 성공적으로 작성되었습니다.',
      });
    },
    onError: (err: unknown) => {
      error({
        title: '댓글 작성 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

/**
 * 댓글 수정 훅
 * 기존 댓글을 수정합니다
 */
export const useUpdateComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  return useMutation<UpdateCommentResponse, Error, UpdateCommentRequest>({
    mutationFn: params => commentsApi.updateComment(params),
    onSuccess: (data, variables) => {
      // 포스트 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists(spaceSlug) });
      // 해당 포스트의 댓글 목록 무효화
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(variables.postId) });
      // 특정 댓글 상세 정보 무효화
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.detail(variables.postId, variables.commentId) 
      });
      
      success({
        title: '댓글 수정 완료',
        message: '댓글이 성공적으로 수정되었습니다.',
      });
    },
    onError: (err: unknown) => {
      error({
        title: '댓글 수정 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

/**
 * 댓글 삭제 훅
 * 댓글을 삭제합니다
 */
export const useDeleteComment = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();

  return useMutation<DeleteCommentResponse, Error, DeleteCommentRequest>({
    mutationFn: params => commentsApi.deleteComment(params),
    onSuccess: (data, variables) => {
      // 포스트 목록 무효화 (댓글이 삭제되었으므로)
      queryClient.invalidateQueries({ queryKey: postsKeys.lists(spaceSlug) });
      // 해당 포스트의 댓글 목록 무효화
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(variables.postId) });
      
      success({
        title: '댓글 삭제 완료',
        message: '댓글이 성공적으로 삭제되었습니다.',
      });
    },
    onError: (err: unknown) => {
      error({
        title: '댓글 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};