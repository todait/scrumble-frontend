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
  images?: string[];
}

export interface BasePost {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  reactions: Reaction[];
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: Date;
  images?: string[];
}

export interface CheckinPost extends BasePost {
  type: 'checkin';
  conditionScore: number;
  conditionEmoji: string;
}

export interface CheckoutPost extends BasePost {
  type: 'checkout';
}

export type Post = CheckinPost | CheckoutPost;

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

// API 요청/응답 타입들
export interface PostCreateRequest {
  content: string;
  images?: string[];
  conditionScore?: number; // 체크인 전용
}

export interface PostUpdateRequest {
  content?: string;
  images?: string[];
  conditionScore?: number; // 체크인 전용
}
