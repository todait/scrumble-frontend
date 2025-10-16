import type { DateString, ID } from './api';
import { ImageMetadata } from './upload.types';
import type { JSONContent } from '@tiptap/core';

export interface CommentAuthor {
  id: ID;
  name: string;
  email: string;
  avatarURL: string;
}

/**
 * 댓글에서 사용하는 이미지 정보
 * ImageMetadata를 확장하여 createdAt 필드 추가
 */
export interface CommentImage extends ImageMetadata {
  id: string; // Comment에서는 id가 필수
  createdAt: DateString;
}

export interface Comment {
  id: ID;
  postId: ID;
  author: CommentAuthor;
  content: string;
  contentJson?: JSONContent; // Tiptap JSON
  createdAt: DateString;
  updatedAt?: DateString;
  images?: CommentImage[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  contentJson?: JSONContent; // Tiptap JSON
  images: ImageMetadata[];
}

export type CommentResponse = Required<
  Pick<Comment, 'id' | 'postId' | 'author' | 'content' | 'createdAt' | 'updatedAt'>
> & Pick<Comment, 'images' | 'contentJson'>;

export interface CreateCommentResponse {
  message: string;
  comment: CommentResponse;
}

export interface UpdateCommentRequest {
  commentId: string;
  postId: string;
  content: string;
  contentJson?: JSONContent; // Tiptap JSON
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
