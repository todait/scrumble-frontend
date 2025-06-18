import type { ImageMetadata } from '@/shared/types/upload.types';
import type { TiptapDocument } from '@/shared/types/api';

export type PostType = 'checkin' | 'checkout';
export type FilterType = 'all' | 'checkin' | 'checkout';

export interface User {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  images?: ImageMetadata[];
}

export interface BasePost {
  id: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
  reactions: Reaction[];
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: Date;
  images?: ImageMetadata[];
}

export interface CheckinPost extends BasePost {
  type: 'checkin';
  conditionScore: number;
  conditionEmoji: string;
  conditionContent: TiptapDocument;
}

export interface CheckoutPost extends BasePost {
  type: 'checkout';
  reflectionContent: TiptapDocument;
}

export type Post = CheckinPost | CheckoutPost;

// 방법 1: 유틸리티 함수 사용 (가장 실용적)
export const getPostContent = (post: Post): TiptapDocument | null => {
  switch (post.type) {
    case 'checkin':
      return post.conditionContent || null;
    case 'checkout':
      return post.reflectionContent || null;
    default:
      return null;
  }
};

// 방법 2: 타입 가드와 함께 사용
export const isCheckinPost = (post: Post): post is CheckinPost => {
  return post.type === 'checkin';
};

export const isCheckoutPost = (post: Post): post is CheckoutPost => {
  return post.type === 'checkout';
};

export interface FeedData {
  posts: Post[];
  activeUsers: number;
  totalUsers: number;
}

export interface TeamSummary {
  teamCondition: number;
  checkedInCount: number;
  totalMembers: number;
  checkedOutCount: number;
}
