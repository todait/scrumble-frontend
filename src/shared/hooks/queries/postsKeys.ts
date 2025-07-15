import type { QueryClient } from '@tanstack/react-query';
import type { Post, FilterType, FeedData, Comment } from '@/features/feed/types/feed.types';

interface PostsFilters {
  spaceSlug: string;
  filterType?: FilterType;
  date?: string;
  authorId?: string;
}

export const postsKeys = {
  // 최상위 키
  all: ['posts'] as const,
  
  // 스페이스별 키
  bySpace: (spaceSlug: string) => [...postsKeys.all, 'space', spaceSlug] as const,
  
  // 목록 키
  lists: (spaceSlug: string) => [...postsKeys.bySpace(spaceSlug), 'list'] as const,
  list: (spaceSlug: string, filters?: Partial<PostsFilters>) => 
    [...postsKeys.lists(spaceSlug), filters] as const,
  
  // 개별 포스트 키
  details: (spaceSlug: string) => [...postsKeys.bySpace(spaceSlug), 'detail'] as const,
  detail: (spaceSlug: string, postId: string) => 
    [...postsKeys.details(spaceSlug), postId] as const,
  
  // 댓글 관련 키 (포스트와 분리)
  comments: (postId: string) => [...postsKeys.all, 'comments', postId] as const,
  
  // 실시간 업데이트용 키
  realtime: (spaceSlug: string) => [...postsKeys.bySpace(spaceSlug), 'realtime'] as const,
  
  // 기존 키들 유지
  existsCheckin: (spaceSlug: string, date: string) =>
    [...postsKeys.bySpace(spaceSlug), 'existsCheckin', date] as const,
  feedSummary: (spaceSlug: string, date: string) =>
    [...postsKeys.bySpace(spaceSlug), 'feedSummary', date] as const,
  postDate: (spaceSlug: string, postId: string) =>
    [...postsKeys.bySpace(spaceSlug), 'postDate', postId] as const,
};

// 선택적 무효화 헬퍼 함수들
export const invalidateHelpers = {
  // 특정 포스트의 댓글만 무효화
  invalidatePostComments: (queryClient: QueryClient, postId: string) => {
    queryClient.invalidateQueries({
      queryKey: postsKeys.comments(postId),
      exact: true,
    });
  },
  
  // 특정 포스트 데이터만 업데이트 (무효화 없이)
  updatePostInLists: (
    queryClient: QueryClient, 
    spaceSlug: string, 
    postId: string, 
    updater: (post: Post) => Post
  ) => {
    // 모든 목록 쿼리에서 해당 포스트만 업데이트
    queryClient.setQueriesData(
      { queryKey: postsKeys.lists(spaceSlug), exact: false },
      (oldData: FeedData | undefined) => {
        if (!oldData?.posts) return oldData;
        
        return {
          ...oldData,
          posts: oldData.posts.map((post: Post) =>
            post.id === postId ? updater(post) : post
          ),
        };
      }
    );
  },
  
  // 가시성 기반 선택적 무효화
  invalidateVisiblePosts: (
    queryClient: QueryClient, 
    spaceSlug: string, 
    visiblePostIds: string[]
  ) => {
    // 보이는 포스트의 상세 정보만 무효화
    visiblePostIds.forEach(postId => {
      queryClient.invalidateQueries({
        queryKey: postsKeys.detail(spaceSlug, postId),
      });
    });
  },
  
  // 댓글 추가 시 캐시 업데이트 (무효화 없이)
  addCommentToPost: (
    queryClient: QueryClient,
    spaceSlug: string,
    postId: string,
    newComment: Comment
  ) => {
    // 목록에서 댓글 수 증가
    invalidateHelpers.updatePostInLists(queryClient, spaceSlug, postId, (post) => ({
      ...post,
      commentCount: post.commentCount + 1,
      lastCommentTime: new Date(),
      comments: [...post.comments, newComment],
    }));
    
    // 댓글 캐시도 업데이트
    queryClient.setQueryData(postsKeys.comments(postId), (oldComments: Comment[] | undefined) => {
      if (!Array.isArray(oldComments)) return [newComment];
      return [...oldComments, newComment];
    });
  },
  
  // 댓글 삭제 시 캐시 업데이트 (무효화 없이)
  removeCommentFromPost: (
    queryClient: QueryClient,
    spaceSlug: string,
    postId: string,
    commentId: string
  ) => {
    // 목록에서 댓글 수 감소
    invalidateHelpers.updatePostInLists(queryClient, spaceSlug, postId, (post) => ({
      ...post,
      commentCount: Math.max(0, post.commentCount - 1),
      comments: post.comments.filter(comment => comment.id !== commentId),
    }));
    
    // 댓글 캐시에서도 제거
    queryClient.setQueryData(postsKeys.comments(postId), (oldComments: Comment[] | undefined) => {
      if (!Array.isArray(oldComments)) return [];
      return oldComments.filter((comment: Comment) => comment.id !== commentId);
    });
  },
  
  // 스페이스 전체 캐시 무효화 (필요한 경우만)
  invalidateSpaceData: (queryClient: QueryClient, spaceSlug: string) => {
    queryClient.invalidateQueries({
      queryKey: postsKeys.bySpace(spaceSlug),
    });
  },
};
