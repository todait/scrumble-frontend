import type { Post as ApiPost } from '@/shared/types/post';
import { normalizeApiJson } from '@/shared/utils/tiptap.utils';
import type { CheckinPost, CheckoutPost, Post as FeedPost } from '../types/feed.types';

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
    postedAt: new Date(apiPost.postedAt),
    createdAt: new Date(apiPost.createdAt),
    updatedAt: apiPost.updatedAt ? new Date(apiPost.updatedAt) : undefined,
    reactions: apiPost.reactions || [], // API에서 받은 reactions 사용
    comments:
      apiPost.comments?.map(comment => ({
        id: comment.id,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          profileImage: comment.author.profileImage ?? '',
        },
        content: comment.content,
        contentJson: normalizeApiJson(comment.contentJson, comment.content),
        createdAt: new Date(comment.createdAt),
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
        images: comment.images,
        reactions: comment.reactions || [], // 댓글 reactions 추가
      })) || [],
    commentCount: apiPost.comments?.length || 0,
    lastCommentTime:
      apiPost.comments?.length > 0
        ? new Date(apiPost.comments[apiPost.comments.length - 1].createdAt)
        : undefined,
    images: apiPost.images,
    author: {
      id: apiPost.author.id,
      name: apiPost.author.name,
      profileImage: apiPost.author.avatarURL,
    },
    todoCount: apiPost.todoCount,
    completedTodoCount: apiPost.completedTodoCount,
    completionRate: apiPost.completionRate,
  };

  if (apiPost.postType === 'checkin') {
    return {
      ...basePost,
      type: 'checkin' as const,
      conditionScore: apiPost.conditionScore || 5,
      conditionEmoji: getConditionEmoji(apiPost.conditionScore || 5),
      conditionText: apiPost.conditionText || '',
      conditionTextJson: apiPost.conditionTextJson || null,
    } satisfies CheckinPost;
  } else {
    return {
      ...basePost,
      type: 'checkout' as const,
      reflectionText: apiPost.reflectionText || '',
      reflectionTextJson: apiPost.reflectionTextJson || null,
    } satisfies CheckoutPost;
  }
};

/**
 * API 포스트 배열을 Feed 포스트 배열로 변환
 * @param apiPosts API에서 받은 포스트 배열
 * @returns Feed용 포스트 배열
 */
export const convertApiPostsToFeedPosts = (apiPosts: ApiPost[]): FeedPost[] => {
  const seenIds = new Set<string>();
  const uniquePosts: FeedPost[] = [];

  apiPosts.forEach(apiPost => {
    if (!seenIds.has(apiPost.id)) {
      seenIds.add(apiPost.id);
      uniquePosts.push(convertApiPostToFeedPost(apiPost));
    }
  });

  return uniquePosts;
};
