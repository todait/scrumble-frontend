/**
 * 포스트 관련 타입 정의
 * 체크인/체크아웃 포스트, 댓글, 반응 등 포스트 도메인 타입들
 */

import type { DateString, ID } from './api';
import { Comment } from './comment';
import type { ImageMetadata } from './upload.types';

/**
 * 포스트 유형
 */
export type PostType = 'checkin' | 'checkout';

/**
 * 포스트 필터 유형 (UI에서 사용)
 */
export type PostFilterType = 'all' | 'checkin' | 'checkout';

/**
 * 포스트의 작성자 정보
 * 포스트에서 사용되는 간소화된 사용자 정보
 */
export interface PostAuthor {
  id: ID;
  name: string;
  email: string;
  avatarURL: string;
}

/**
 * 기본 포스트 정보
 * 애플리케이션에서 사용되는 포스트 타입
 */
export interface Post {
  id: ID;
  postType: PostType;
  postedAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
  userId: ID;
  spaceSlug: string;
  author: PostAuthor;
  conditionScore?: number; // 체크인 전용 (1-10)
  conditionText?: string; // 체크인 메시지
  reflectionText?: string; // 체크아웃 메시지
  images: ImageMetadata[];
  comments: Comment[];
}

/**
 * 포스트 반응 (이모지)
 */
export interface PostReaction {
  id: ID;
  emoji: string;
  count: number;
  userIds: ID[];
  createdAt: DateString;
}

/**
 * 확장된 포스트 정보 (댓글, 반응 포함)
 * 포스트 상세 페이지에서 사용
 */
export interface PostWithDetails extends Post {
  reactions: PostReaction[];
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: DateString;
}

/**
 * 포스트 생성 요청 데이터
 */
export interface CreatePostRequest {
  content: string;
  images?: ImageMetadata[];
  conditionScore?: number; // 체크인 전용
}

/**
 * 포스트 수정 요청 데이터
 */
export interface UpdatePostRequest {
  content?: string;
  images?: ImageMetadata[];
  conditionScore?: number; // 체크인 전용
}

/**
 * 포스트 목록 조회 파라미터
 */
export interface GetPostsParams {
  spaceSlug: string;
  date?: string; // YYYY-MM-DD
  types?: string; // "checkin,checkout"
  cursor?: string;
  limit?: number;
}

/**
 * 포스트 목록 응답
 */
export interface GetPostsResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ExistsCheckinResponse {
  exists: boolean;
}

export interface ExistsCheckinParams {
  spaceSlug: string;
  date: string;
}

export interface GetFeedSummaryParams {
  spaceSlug: string;
  date: string;
}

export interface GetFeedSummaryResponse {
  message: string;
  summary: {
    date: string;
    spaceSlug: string;
    checkinCount: number;
    checkOutCount: number;
    totalWorkdayMemberCount: number;
    averageConditionScore: number;
  };
}

export interface CreateCheckInRequest {
  spaceSlug: string;
  postedDate?: string; // YYYY-MM-DD
  conditionScore: number; // 1-10
  conditionText: string;
  images: ImageMetadata[];
}

export type CheckInPostResponse = Required<
  Pick<Post, 'id' | 'conditionScore' | 'conditionText' | 'postedAt' | 'createdAt' | 'updatedAt'>
>;

export interface CreateCheckInResponse {
  message: string;
  post: CheckInPostResponse;
}

export interface UpdateCheckInRequest {
  spaceSlug: string;
  postId: string;
  conditionScore: number;
  conditionText: string;
  images: ImageMetadata[];
}

export interface UpdateCheckInResponse {
  message: string;
  post: CheckInPostResponse;
}

export interface DeleteCheckInRequest {
  spaceSlug: string;
  postId: string;
}

export interface DeleteCheckInResponse {
  message: string;
}

export interface CreateCheckOutRequest {
  spaceSlug: string;
  postedDate?: string; // YYYY-MM-DD
  reflectionText?: string;
  images: ImageMetadata[];
}

export type CheckOutPostResponse = Required<
  Pick<Post, 'id' | 'reflectionText' | 'postedAt' | 'createdAt' | 'updatedAt'>
>;

export interface CreateCheckOutResponse {
  message: string;
  post: CheckOutPostResponse;
}

export interface UpdateCheckOutRequest {
  spaceSlug: string;
  postId: string;
  reflectionText: string;
  images: ImageMetadata[];
}

export interface UpdateCheckOutResponse {
  message: string;
  post: CheckOutPostResponse;
}

export interface DeleteCheckOutRequest {
  spaceSlug: string;
  postId: string;
}

export interface DeleteCheckOutResponse {
  message: string;
}
