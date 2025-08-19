/**
 * 포스트 관련 타입 정의
 * 체크인/체크아웃 포스트, 댓글, 반응 등 포스트 도메인 타입들
 */

import type { DateString, ID } from './api';
import type { ImageMetadata } from './upload.types';
import type { Reaction, Comment } from '@/features/feed/types/feed.types';

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
  spaceMemberId: ID;
  spaceSlug: string;
  author: PostAuthor;
  conditionScore?: number; // 체크인 전용 (1-10)
  conditionText?: string; // 체크인 메시지
  reflectionText?: string; // 체크아웃 메시지
  images: ImageMetadata[];
  comments: Comment[];
  reactions: Reaction[];
  todoCount?: number; // 해당 날짜의 Todo 개수
  completedTodoCount?: number; // 완료된 Todo 개수
  completionRate?: number; // 완료율 (0-100)
}

/**
 * 포스트 반응 (이모지)
 */
export interface PostReaction {
  id: ID;
  emoji: string;
  count: number;
  spaceMemberIds: ID[];
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
  date: string;
}

export interface GetFeedSummaryParams {
  date?: string; // 선택적, 기본값은 오늘 날짜
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
    nextCheckinOrder: number; // 다음 체크인 순서 번호
  };
}

export interface CreateCheckInRequest {
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
  postId: string;
}

export interface DeleteCheckInResponse {
  message: string;
}

export interface CreateCheckOutRequest {
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
  postId: string;
  reflectionText: string;
  images: ImageMetadata[];
}

export interface UpdateCheckOutResponse {
  message: string;
  post: CheckOutPostResponse;
}

export interface DeleteCheckOutRequest {
  postId: string;
}

export interface DeleteCheckOutResponse {
  message: string;
}

export interface GetPostDateParams {
  postId: string;
}

export interface GetPostDateResponse {
  date: string; // YYYY-MM-DD
}
