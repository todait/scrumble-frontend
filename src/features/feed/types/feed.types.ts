import type { ImageMetadata } from '@/shared/types/upload.types';

export type PostType = 'checkin' | 'checkout';
export type FilterType = 'all' | 'checkin' | 'checkout';

export interface Member {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  spaceMemberIds: string[];
}

export interface Comment {
  id: string;
  author: Member;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  images?: ImageMetadata[];
  reactions?: Reaction[];
  _isOptimistic?: boolean;
}

export interface BasePost {
  id: string;
  author: Member;
  postedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
  reactions: Reaction[];
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: Date;
  images?: ImageMetadata[];
  todoCount?: number;
}

export interface CheckinPost extends BasePost {
  type: 'checkin';
  conditionScore: number;
  conditionEmoji: string;
  conditionText: string;
}

export interface CheckoutPost extends BasePost {
  type: 'checkout';
  reflectionText: string;
}

export type Post = CheckinPost | CheckoutPost;

// 방법 1: 유틸리티 함수 사용 (가장 실용적)
export const getPostContent = (post: Post): string => {
  switch (post.type) {
    case 'checkin':
      return post.conditionText || '';
    case 'checkout':
      return post.reflectionText || '';
    default:
      return '';
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
  activeMembers: number;
  totalMembers: number;
}

export interface TeamSummary {
  teamCondition: number;
  checkedInCount: number;
  totalMembers: number;
  checkedOutCount: number;
  nextCheckinOrder: number;
}

// WebSocket에서 받는 댓글 데이터
export interface WebSocketComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatarURL: string; // WebSocket에서는 avatarURL
  };
  content: string;
  createdAt: string; // WebSocket에서는 string
  images?: ImageMetadata[];
}

// 댓글 변환 유틸리티
export const transformWebSocketComment = (wsComment: WebSocketComment): Comment => ({
  id: wsComment.id,
  author: {
    id: wsComment.author.id,
    name: wsComment.author.name,
    profileImage: wsComment.author.avatarURL, // avatarURL -> profileImage
  },
  content: wsComment.content,
  createdAt: new Date(wsComment.createdAt), // string -> Date
  images: wsComment.images || [],
});

// 포스트 가시성 상태
export interface PostVisibilityState {
  postId: string;
  isVisible: boolean;
  lastVisibleAt?: Date;
  subscriptionStatus: 'subscribed' | 'pending' | 'unsubscribed';
}

// 실시간 업데이트 액션
export interface RealtimeUpdateAction {
  type: 'ADD_COMMENT' | 'DELETE_COMMENT' | 'UPDATE_REACTION' | 'UPDATE_COMMENT';
  postId: string;
  payload: Comment | Reaction | { commentId: string } | unknown;
  timestamp: Date;
}

// 포스트 구독 상태
export interface PostSubscriptionState {
  visiblePostIds: string[];
  subscribedPostIds: string[];
  pendingUnsubscribe: Map<string, NodeJS.Timeout>;
}

export interface EmojiData {
  /** i.e. "grinning_face" */
  id: string;
  /** i.e. "Grinning Face" */
  name: string;
  /** 실제 이모지 문자 */
  native: string;
  skin?: number;
  keywords?: string[];
}
