import {
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '@/shared/types/comment';
import { apiClient } from '../api';

const convertApiCommentToComment = (apiComment: GetCommentsApiResponse['comments'][0]): Comments => {

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
