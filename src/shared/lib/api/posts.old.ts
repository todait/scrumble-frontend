import { apiClient } from '../api';

interface GetPostsBackendResponse {
  posts: Array<{
    id: string;
    post_type: 'checkin' | 'checkout';
    posted_at: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    space_slug: string;
    author: {
      id: string;
      email: string;
      name: string;
      avatar_url: string;
    };
    condition_score?: number;
    condition_text?: string;
    reflection_text?: string;
  }>;
  nextCursor?: string;
  hasMore: boolean;
}

// 프론트엔드에서 사용할 타입 (camelCase)
export interface User {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Post {
  id: string;
  postType: 'checkin' | 'checkout';
  postedAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  spaceSlug: string;
  author: User;
  conditionScore?: number;
  conditionText?: string;
  reflectionText?: string;
}

export interface GetPostsResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface GetPostsParams {
  spaceSlug: string;
  date?: string; // YYYY-MM-DD
  types?: string; // "checkin,checkout"
  cursor?: string;
  limit?: number;
}

const convertPostToFrontend = (backendPost: GetPostsBackendResponse['posts'][0]): Post => {
  return {
    id: backendPost.id,
    postType: backendPost.post_type,
    postedAt: backendPost.posted_at,
    createdAt: backendPost.created_at,
    updatedAt: backendPost.updated_at,
    userId: backendPost.user_id,
    spaceSlug: backendPost.space_slug,
    author: {
      id: backendPost.author.id,
      name: backendPost.author.name,
      profileImage: backendPost.author.avatar_url || undefined,
    },
    conditionScore: backendPost.condition_score,
    conditionText: backendPost.condition_text,
    reflectionText: backendPost.reflection_text,
  };
};

export const postsApi = {
  getPosts: async (params: GetPostsParams): Promise<GetPostsResponse> => {
    const queryParams = new URLSearchParams();

    queryParams.append('spaceSlug', params.spaceSlug);

    if (params.date) {
      queryParams.append('date', params.date);
    }

    if (params.types) {
      queryParams.append('types', params.types);
    }

    if (params.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const { data } = await apiClient.get<GetPostsBackendResponse>(
      `/api/v1/posts?${queryParams.toString()}`
    );

    return {
      posts: data.posts.map(convertPostToFrontend),
      nextCursor: data.nextCursor,
      hasMore: data.hasMore,
    };
  },
};
