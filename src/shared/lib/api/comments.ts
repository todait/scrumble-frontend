import { Comment } from '@/features/feed/types/feed.types';
import { ApiComment, ApiImage } from '@/shared/types/api';
import {
  CommentImage,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '@/shared/types/comment';
import { convertApiReactionsToReactions } from '@/shared/utils/reactions.utils';
import { normalizeApiJson } from '@/shared/utils/tiptap.utils';
import { apiClient } from '../api';

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
export const convertApiCommentToComment = (apiComment: ApiComment): Comment => ({
  id: apiComment.id,
  author: {
    id: apiComment.author.id,
    name: apiComment.author.name,
    profileImage: apiComment.author.avatar_url || '',
  },
  content: apiComment.content,
  contentJson: normalizeApiJson(apiComment.content_json, apiComment.content),
  createdAt: new Date(apiComment.created_at),
  images: apiComment.images?.map(convertApiImageToImage),
  reactions: convertApiReactionsToReactions(apiComment.reactions),
});

export const commentsApi = {
  createComment: async (params: CreateCommentRequest): Promise<CreateCommentResponse> => {
    const { data } = await apiClient.post(`/api/v1/posts/${params.postId}/comments`, {
      content: params.content,
      content_json: params.contentJson ?? null,
      images: params.images,
    });

    return {
      message: data.message,
      comment: {
        id: data.comment.id,
        postId: data.comment.post_id,
        content: data.comment.content,
        contentJson: normalizeApiJson(data.comment.content_json, data.comment.content),
        createdAt: data.comment.created_at,
        updatedAt: data.comment.updated_at,
        author: {
          id: data.comment.author.id,
          name: data.comment.author.name,
          email: data.comment.author.email,
          avatarURL: data.comment.author.avatar_url,
        },
        images: data.comment.images?.map(convertApiImageToImage),
      },
    };
  },

  updateComment: async (params: UpdateCommentRequest): Promise<UpdateCommentResponse> => {
    const { data } = await apiClient.patch(
      `/api/v1/posts/${params.postId}/comments/${params.commentId}`,
      {
        content: params.content,
        content_json: params.contentJson ?? null,
        images: params.images,
      }
    );

    return {
      message: data.message,
      comment: {
        id: data.comment.id,
        postId: data.comment.post_id,
        content: data.comment.content,
        contentJson: normalizeApiJson(data.comment.content_json, data.comment.content),
        createdAt: data.comment.created_at,
        updatedAt: data.comment.updated_at,
        author: {
          id: data.comment.author.id,
          name: data.comment.author.name,
          email: data.comment.author.email,
          avatarURL: data.comment.author.avatar_url,
        },
        images: data.comment.images?.map(convertApiImageToImage),
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
