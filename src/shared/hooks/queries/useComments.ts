import type { Comment } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/contexts/AuthContext';
import { commentsApi } from '@/shared/lib/api/comments';
import type {
  CommentImage,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '@/shared/types/comment';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { getErrorMessage } from '@/shared/utils';
import { debug } from '@/shared/utils/debug';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { postsKeys } from './postsKeys';

/**
 * CommentImage를 ImageMetadata로 변환하는 유틸리티 함수
 * WebSocket 이벤트와 동일한 형식으로 통일
 */
const convertCommentImageToImageMetadata = (commentImage: CommentImage): ImageMetadata => ({
  id: commentImage.key, // key를 id로 사용하여 WebSocket과 통일
  url: commentImage.url,
  key: commentImage.key,
  size: commentImage.size,
  width: commentImage.width,
  height: commentImage.height,
  format: commentImage.format,
  name: commentImage.name,
  isTemporary: false, // 서버에서 받은 데이터는 완전한 데이터
});

/**
 * 댓글 생성 훅
 * 새로운 댓글을 작성합니다 (Optimistic Update 지원)
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();
  const { currentSpaceMember: member, currentSpaceSlug } = useAuth();

  type MutationContext = {
    previousQueries: [any, any][];
    optimisticComment: Comment;
    tempId: string;
  };

  return useMutation<CreateCommentResponse, Error, CreateCommentRequest, MutationContext>({
    mutationFn: params => {
      debug('useCreateComment', 'API call', {
        imageCount: params.images?.length || 0,
        images: params.images,
      });
      return commentsApi.createComment(params);
    },
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug || '') });

      // 현재 사용자 정보로 즉시 댓글 생성
      const tempId = `temp-${Date.now()}`;

      // 이미지 데이터를 서버 응답과 동일한 형식으로 정규화
      const normalizedImages =
        variables.images?.map(img => ({
          ...img,
          id: img.id || img.key, // id가 없으면 key를 사용하여 WebSocket 형식과 통일
          isTemporary: false, // 서버 응답과 동일하게 설정
        })) || [];

      debug('useCreateComment', 'onMutate', {
        inputImages: variables.images,
        normalizedImages,
      });

      const optimisticComment: Comment = {
        id: tempId, // 임시 ID
        author: {
          id: member?.id || '',
          name: member?.name || '',
          profileImage: member?.avatarURL || '',
        },
        content: variables.content,
        createdAt: new Date(),
        images: normalizedImages,
        reactions: [],
        _isOptimistic: true,
      };

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(currentSpaceSlug || ''),
        exact: false,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(currentSpaceSlug || ''), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) =>
              post.id === variables.postId
                ? {
                    ...post,
                    comments: [...post.comments, optimisticComment],
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

      const convertedImages = data.comment.images?.map(convertCommentImageToImageMetadata) || [];

      // 서버 응답에서 이미지 데이터가 없으면 기존 optimistic update의 이미지 유지
      const shouldKeepOptimisticImages = !data.comment.images || data.comment.images.length === 0;

      debug('useCreateComment', 'onSuccess', {
        serverImages: data.comment.images,
        convertedImages,
        shouldKeepOptimisticImages,
      });

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
        images: shouldKeepOptimisticImages ? context.optimisticComment.images : convertedImages,
        reactions: [],
      };

      debug('useCreateComment', 'Final actualComment', actualComment);

      // 임시 ID를 실제 ID로 교체
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(currentSpaceSlug || ''), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          const updatedData = {
            ...oldData,
            posts: oldData.posts.map((post: any) =>
              post.id === variables.postId
                ? {
                    ...post,
                    comments: post.comments.map((comment: Comment) => {
                      if (comment.id === context.tempId) {
                        debug('useCreateComment', 'Replacing optimistic comment', {
                          old: comment,
                          new: actualComment,
                        });
                        return actualComment;
                      }
                      return comment;
                    }),
                  }
                : post
            ),
          };

          return updatedData;
        }
      );

      success({
        title: '댓글 작성 완료',
        message: '댓글이 성공적으로 작성되었습니다.',
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
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();
  const { currentSpaceSlug } = useAuth();

  type MutationContext = {
    previousQueries: [any, any][];
    originalImages?: ImageMetadata[]; // 원본 이미지 저장
    newImages?: ImageMetadata[]; // 사용자가 새로 입력한 이미지
  };

  return useMutation<UpdateCommentResponse, Error, UpdateCommentRequest, MutationContext>({
    mutationFn: params => {
      debug('useUpdateComment', 'mutationFn called', {
        commentId: params.commentId,
        postId: params.postId,
        content: params.content,
        imageCount: params.images?.length || 0,
        images: params.images,
      });
      return commentsApi.updateComment(params);
    },
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug || '') });

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(currentSpaceSlug || ''),
        exact: false,
      });

      // 현재 댓글의 원본 이미지를 찾아 저장
      let originalImages: ImageMetadata[] | undefined;
      for (const [, data] of previousQueries) {
        if (data?.posts) {
          for (const post of data.posts) {
            const comment = post.comments?.find((c: any) => c.id === variables.commentId);
            if (comment?.images) {
              originalImages = comment.images;
              break;
            }
          }
          if (originalImages) break;
        }
      }

      // 사용자가 입력한 새 이미지 저장
      const newImages = variables.images || [];

      debug('useUpdateComment', 'onMutate', {
        commentId: variables.commentId,
        originalImages: originalImages?.map(img => ({ id: img.id, url: img.url })),
        originalImageCount: originalImages?.length || 0,
        newImages: newImages.map(img => ({ id: img.id, url: img.url })),
        newImageCount: newImages.length,
        hasNewImages: newImages.length > 0,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트 (Optimistic Update)
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(currentSpaceSlug || ''), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) => ({
              ...post,
              comments: post.comments.map((comment: any) => {
                if (comment.id === variables.commentId) {
                  const optimisticImages = variables.images && variables.images.length > 0 
                    ? variables.images 
                    : comment.images || [];
                  
                  debug('useUpdateComment', 'Optimistic Update - Images', {
                    commentId: comment.id,
                    currentImages: comment.images?.map((img: any) => ({ id: img.id, url: img.url })),
                    currentImageCount: comment.images?.length || 0,
                    newImages: variables.images?.map(img => ({ id: img.id, url: img.url })),
                    newImageCount: variables.images?.length || 0,
                    optimisticImages: optimisticImages.map((img: any) => ({ id: img.id, url: img.url })),
                    optimisticImageCount: optimisticImages.length,
                  });

                  return {
                    ...comment,
                    content: variables.content,
                    images: optimisticImages,
                    updatedAt: new Date(),
                    _isOptimistic: true, // 옵티미스틱 업데이트 표시
                  };
                }
                return comment;
              }),
            })),
          };
        }
      );

      return { previousQueries, originalImages, newImages };
    },
    onSuccess: (data, variables, context) => {
      // 서버 응답에서 이미지 데이터가 없으면 사용자가 입력한 새 이미지 사용
      const shouldUseNewImages = !data.comment.images || data.comment.images.length === 0;
      const convertedImages = data.comment.images?.map(convertCommentImageToImageMetadata) || [];

      debug('useUpdateComment', 'onSuccess - Server Response', {
        commentId: variables.commentId,
        serverComment: data.comment,
        serverImageCount: data.comment.images?.length || 0,
        serverImages: data.comment.images?.map(img => ({ 
          id: img.id, 
          url: img.url, 
          key: img.key,
          hasAllFields: !!(img.id && img.url && img.key && img.size && img.width && img.height)
        })),
      });

      debug('useUpdateComment', 'onSuccess - Image Processing', {
        convertedImages: convertedImages.map(img => ({ id: img.id, url: img.url })),
        convertedImageCount: convertedImages.length,
        shouldUseNewImages,
        originalImages: context?.originalImages?.map(img => ({ id: img.id, url: img.url })),
        originalImageCount: context?.originalImages?.length || 0,
        newImages: context?.newImages?.map(img => ({ id: img.id, url: img.url })),
        newImageCount: context?.newImages?.length || 0,
        finalImages: shouldUseNewImages 
          ? (context?.newImages || []).map(img => ({ id: img.id, url: img.url }))
          : convertedImages.map(img => ({ id: img.id, url: img.url })),
        finalImageCount: shouldUseNewImages 
          ? (context?.newImages?.length || 0) 
          : convertedImages.length,
      });

      // 서버 응답으로 최종 업데이트 (더 정확한 데이터 반영)
      const updatedComment: Partial<Comment> = {
        content: data.comment.content,
        images: shouldUseNewImages ? (context?.newImages || []) : convertedImages, // 서버에 이미지가 없으면 새로 입력한 이미지 사용
        updatedAt: new Date(data.comment.updatedAt || Date.now()), // 서버에서 온 수정 시간
      };

      debug('useUpdateComment', 'onSuccess - Final Update', {
        commentId: variables.commentId,
        finalContent: updatedComment.content,
        finalImages: updatedComment.images?.map(img => ({ id: img.id, url: img.url })),
        finalImageCount: updatedComment.images?.length || 0,
      });

      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(currentSpaceSlug || ''), exact: false },
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
                      ...updatedComment,
                      // 옵티미스틱 업데이트 시 발생할 수 있는 임시 필드 제거
                      _isOptimistic: undefined,
                    }
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
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { error, success } = useToast();
  const { currentSpaceSlug } = useAuth();

  type MutationContext = {
    previousQueries: [any, any][];
  };

  return useMutation<DeleteCommentResponse, Error, DeleteCommentRequest, MutationContext>({
    mutationFn: params => commentsApi.deleteComment(params),
    onMutate: async variables => {
      // 진행 중인 쿼리들 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug || '') });

      // 이전 데이터들을 백업 (모든 관련 캐시)
      const previousQueries = queryClient.getQueriesData<any>({
        queryKey: postsKeys.lists(currentSpaceSlug || ''),
        exact: false,
      });

      // 필터와 관계없이 모든 목록 캐시 업데이트
      queryClient.setQueriesData(
        { queryKey: postsKeys.lists(currentSpaceSlug || ''), exact: false },
        (oldData: any) => {
          if (!oldData?.posts) return oldData;

          return {
            ...oldData,
            posts: oldData.posts.map((post: any) => {
              const updatedComments = post.comments.filter(
                (comment: any) => comment.id !== variables.commentId
              );
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
