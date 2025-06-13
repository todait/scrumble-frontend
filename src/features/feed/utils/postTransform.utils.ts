import type { Post as ApiPost } from '@/shared/types/post';
import type { Post as FeedPost, CheckinPost, CheckoutPost } from '../types/feed.types';

/**
 * 컨디션 점수에 따른 이모지 반환
 * @param score 컨디션 점수 (1-10)
 * @returns 컨디션에 맞는 이모지
 */
export const getConditionEmoji = (score: number): string => {
  if (score <= 3) return '😞';
  if (score <= 6) return '😐';
  return '😊';
};

/**
 * API Post 타입을 Feed Post 타입으로 변환
 * @param apiPost API에서 받은 포스트 데이터
 * @returns Feed용 포스트 데이터
 */
export const convertApiPostToFeedPost = (apiPost: ApiPost): FeedPost => {
  const basePost = {
    id: apiPost.id,
    createdAt: new Date(apiPost.createdAt),
    updatedAt: apiPost.updatedAt ? new Date(apiPost.updatedAt) : undefined,
    reactions: [],
    comments: [],
    commentCount: 0,
    images: [],
    author: {
      id: apiPost.author.id,
      name: apiPost.author.name,
      profileImage: apiPost.author.avatarURL,
    },
  };

  if (apiPost.postType === 'checkin') {
    return {
      ...basePost,
      type: 'checkin' as const,
      conditionScore: apiPost.conditionScore || 5,
      conditionEmoji: getConditionEmoji(apiPost.conditionScore || 5),
      conditionText: apiPost.conditionText || '',
    } satisfies CheckinPost;
  } else {
    return {
      ...basePost,
      type: 'checkout' as const,
      reflectionText: apiPost.reflectionText || '',
    } satisfies CheckoutPost;
  }
};

/**
 * API 포스트 배열을 Feed 포스트 배열로 변환
 * @param apiPosts API에서 받은 포스트 배열
 * @returns Feed용 포스트 배열
 */
export const convertApiPostsToFeedPosts = (apiPosts: ApiPost[]): FeedPost[] => {
  return apiPosts.map(convertApiPostToFeedPost);
};