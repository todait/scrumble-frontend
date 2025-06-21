import { ApiComment, ApiImage, ApiUser } from '@/shared/types/api';
import {
  Comment,
  CommentImage,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '@/shared/types/comment';
import { apiClient } from '../api';

/**
 * API 사용자 정보를 프론트엔드 형식으로 변환
 */
export const convertApiUserToUser = (apiUser: ApiUser) => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  avatarURL: apiUser.avatar_url,
});

/**
 * API 이미지 정보를 프론트엔드 형식으로 변환
 */
export const convertApiImageToImage = (apiImage: ApiImage): CommentImage => ({
  id: apiImage.id,
  createdAt: apiImage.created_at,
  url: apiImage.url,
  key: apiImage.key,
  size: apiImage.size,
  width: apiImage.width,
  height: apiImage.height,
  format: apiImage.format,
  name: apiImage.name,
});

/**
 * API 댓글 데이터를 프론트엔드 Comment 타입으로 변환
 * @param apiComment - 백엔드 API에서 반환된 댓글 데이터
 * @returns 프론트엔드에서 사용하는 Comment 타입
 */
export const convertApiCommentToComment = (apiComment: ApiComment): Comment => {
  return {
    id: apiComment.id,
    postId: apiComment.post_id,
    author: convertApiUserToUser(apiComment.author),
    content: apiComment.content,
    createdAt: apiComment.created_at,
    updatedAt: apiComment.updated_at,
    images: apiComment.images?.map(convertApiImageToImage),
  };
};

export const commentsApi = {
  createComment: async (params: CreateCommentRequest): Promise<CreateCommentResponse> => {
    const { data } = await apiClient.post(`/api/v1/posts/${params.postId}/comments`, {
      content: params.content,
      images: params.images,
    });

    return {
      message: data.message,
      comment: {
        id: data.comment.id,
        postId: data.comment.post_id,
        content: data.comment.content,
        createdAt: data.comment.created_at,
        updatedAt: data.comment.updated_at,
        author: {
          id: data.comment.author.id,
          name: data.comment.author.name,
          email: data.comment.author.email,
          avatarURL: data.comment.author.avatar_url,
        },
      },
    };
  },

  updateComment: async (params: UpdateCommentRequest): Promise<UpdateCommentResponse> => {
    const { data } = await apiClient.put(
      `/api/v1/posts/${params.postId}/comments/${params.commentId}`,
      {
        content: params.content,
        images: params.images,
      }
    );

    return {
      message: data.message,
      comment: {
        id: data.comment.id,
        postId: data.comment.post_id,
        content: data.comment.content,
        createdAt: data.comment.created_at,
        updatedAt: data.comment.updated_at,
        author: {
          id: data.comment.author.id,
          name: data.comment.author.name,
          email: data.comment.author.email,
          avatarURL: data.comment.author.avatar_url,
        },
      },
    };
  },

  deleteComment: async (params: DeleteCommentRequest): Promise<DeleteCommentResponse> => {
    const { data } = await apiClient.delete(
      `/api/v1/posts/${params.postId}/comments/${params.commentId}`
    );

    return {
      message: data.message,
    };
  },
};
