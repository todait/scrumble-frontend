import type { DateString, ID } from './api';
import { ImageMetadata } from './upload.types';

export interface CommentAuthor {
  id: ID;
  name: string;
  email: string;
  avatarURL: string;
}

export interface Comment {
  id: ID;
  postId: ID;
  author: CommentAuthor;
  content: string;
  createdAt: DateString;
  updatedAt?: DateString;
  images?: ImageMetadata[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  images: ImageMetadata[];
}

export type CommentResponse = Required<
  Pick<Comment, 'id' | 'postId' | 'author' | 'content' | 'createdAt' | 'updatedAt'>
>;

export interface CreateCommentResponse {
  message: string;
  comment: CommentResponse;
}

export interface UpdateCommentRequest {
  commentId: string;
  postId: string;
  content: string;
  images: ImageMetadata[];
}

export interface UpdateCommentResponse {
  message: string;
  comment: CommentResponse;
}

export interface DeleteCommentRequest {
  commentId: string;
  postId: string;
}

export interface DeleteCommentResponse {
  message: string;
}
