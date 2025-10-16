/**
 * 포스트 관련 API 함수들
 * 체크인/체크아웃 포스트 목록 조회, 생성, 수정, 삭제 등
 */

import type {
  CreateCheckInApiResponse,
  CreateCheckOutApiResponse,
  DeleteCheckInApiResponse,
  DeleteCheckOutApiResponse,
  ExistsCheckinApiResponse,
  GetFeedSummaryApiResponse,
  GetPostDateApiResponse,
  GetPostsApiResponse,
  UpdateCheckInApiResponse,
  UpdateCheckOutApiResponse,
} from '@/shared/types/api';
import type {
  CreateCheckInRequest,
  CreateCheckInResponse,
  CreateCheckOutRequest,
  CreateCheckOutResponse,
  DeleteCheckInRequest,
  DeleteCheckInResponse,
  DeleteCheckOutRequest,
  DeleteCheckOutResponse,
  ExistsCheckinParams,
  ExistsCheckinResponse,
  GetFeedSummaryParams,
  GetFeedSummaryResponse,
  GetPostDateParams,
  GetPostDateResponse,
  GetPostsParams,
  GetPostsResponse,
  Post,
  UpdateCheckInRequest,
  UpdateCheckInResponse,
  UpdateCheckOutRequest,
  UpdateCheckOutResponse,
} from '@/shared/types/post';
import { apiClient } from '../api';
import { convertApiCommentToComment } from './comments';
import { convertApiReactionsToReactions } from '@/shared/utils/reactions.utils';

/**
 * JSON 문자열을 파싱하는 헬퍼 함수
 * 이미 객체인 경우 그대로 반환, 문자열인 경우 파싱
 */
const parseJsonField = (field: any): any => {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  }
  return field;
};

/**
 * 백엔드 API 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환하고 필요한 필드 추가
 */
const convertApiPostToPost = (apiPost: GetPostsApiResponse['posts'][0]): Post => {
  return {
    id: apiPost.id,
    postType: apiPost.post_type,
    postedAt: apiPost.posted_at,
    createdAt: apiPost.created_at,
    updatedAt: apiPost.updated_at,
    spaceMemberId: apiPost.space_member_id,
    spaceSlug: apiPost.space_slug,
    author: {
      id: apiPost.author.id,
      name: apiPost.author.name,
      email: apiPost.author.email,
      avatarURL: apiPost.author.avatar_url || '',
    },
    conditionScore: apiPost.condition_score,
    conditionText: apiPost.condition_text,
    conditionTextJson: parseJsonField(apiPost.condition_text_json),
    reflectionText: apiPost.reflection_text,
    reflectionTextJson: parseJsonField(apiPost.reflection_text_json),
    images: apiPost.images || [],
    comments: apiPost.comments ? apiPost.comments.map((c, idx) => {
      console.log(`[transformApiPostToPost] Comment ${idx}:`, {
        id: c.id,
        has_content_json: !!c.content_json,
        content_json_type: typeof c.content_json,
        content_preview: c.content?.substring(0, 50),
      });
      return convertApiCommentToComment(c);
    }) : [],
    reactions: convertApiReactionsToReactions(apiPost.reactions),
    todoCount: apiPost.todo_count,
    completedTodoCount: apiPost.completed_todo_count,
    completionRate: apiPost.completion_rate,
  };
};

/**
 * 포스트 관련 API 함수들
 */
export const postsApi = {
  /**
   * 포스트 목록 조회 (Legacy)
   * @param params 조회 파라미터 (스페이스, 날짜, 타입 등)
   * @returns 변환된 포스트 목록과 페이지네이션 정보
   * @deprecated 새로운 구현에서는 getPostsQuery 사용을 권장합니다
   */
  getPosts: async (params: GetPostsParams): Promise<GetPostsResponse> => {
    const queryParams = new URLSearchParams();

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

    const { data } = await apiClient.get<GetPostsApiResponse>(
      `/api/v1/posts?${queryParams.toString()}`
    );

    return {
      posts: data.posts?.map(convertApiPostToPost) || [],
      nextCursor: data.nextCursor,
      hasMore: data.hasMore || false,
    };
  },

  /**
   * 포스트 목록 조회 - CQRS Query Service
   * @param params 조회 파라미터 (스페이스, 날짜, 타입 등)
   * @returns 변환된 포스트 목록과 페이지네이션 정보
   */
  getPostsQuery: async (params: GetPostsParams): Promise<GetPostsResponse> => {
    const queryParams = new URLSearchParams();

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

    const { data } = await apiClient.get<GetPostsApiResponse>(
      `/api/v1/posts/query?${queryParams.toString()}`
    );

    return {
      posts: data.posts?.map(convertApiPostToPost) || [],
      nextCursor: data.nextCursor,
      hasMore: data.hasMore || false,
    };
  },

  getFeedSummary: async (params: GetFeedSummaryParams): Promise<GetFeedSummaryResponse> => {
    const queryParams = new URLSearchParams();

    // date가 있을 때만 쿼리 파라미터에 추가
    if (params.date) {
      queryParams.append('date', params.date);
    }

    const { data } = await apiClient.get<GetFeedSummaryApiResponse>(
      `/api/v1/posts/summary?${queryParams.toString()}`
    );

    return {
      message: data.message,
      summary: {
        date: data.summary.date,
        spaceSlug: data.summary.space_slug,
        checkinCount: data.summary.check_in_count,
        checkOutCount: data.summary.check_out_count,
        totalWorkdayMemberCount: data.summary.total_workday_member_count,
        averageConditionScore: data.summary.average_condition_score,
        nextCheckinOrder: data.summary.next_checkin_order,
      },
    };
  },

  existsCheckin: async (params: ExistsCheckinParams): Promise<ExistsCheckinResponse> => {
    const queryParams = new URLSearchParams();

    queryParams.append('date', params.date);

    const { data } = await apiClient.get<ExistsCheckinApiResponse>(
      `/api/v1/posts/checkin/exists?${queryParams.toString()}`
    );

    return {
      exists: data.exists,
    };
  },

  createCheckIn: async (params: CreateCheckInRequest): Promise<CreateCheckInResponse> => {
    const { data } = await apiClient.post<CreateCheckInApiResponse>(`/api/v1/posts/checkin`, {
      condition_score: params.conditionScore,
      condition_text: params.conditionText,
      condition_text_json: params.conditionTextJson,
      ...(params.postedDate ? { posted_date: params.postedDate } : {}),
      images: params.images,
    });

    return {
      message: data.message,
      post: {
        id: data.post.id,
        conditionScore: data.post.condition_score,
        conditionText: data.post.condition_text,
        conditionTextJson: parseJsonField(data.post.condition_text_json),
        postedAt: data.post.posted_at,
        createdAt: data.post.created_at,
        updatedAt: data.post.updated_at,
      },
    };
  },

  createCheckOut: async (params: CreateCheckOutRequest): Promise<CreateCheckOutResponse> => {
    const { data } = await apiClient.post<CreateCheckOutApiResponse>(`/api/v1/posts/checkout`, {
      reflection_text: params.reflectionText,
      reflection_text_json: params.reflectionTextJson,
      ...(params.postedDate ? { posted_date: params.postedDate } : {}),
      images: params.images,
    });

    return {
      message: data.message,
      post: {
        id: data.post.id,
        reflectionText: data.post.reflection_text,
        reflectionTextJson: parseJsonField(data.post.reflection_text_json),
        postedAt: data.post.posted_at,
        createdAt: data.post.created_at,
        updatedAt: data.post.updated_at,
      },
    };
  },

  updateCheckIn: async (params: UpdateCheckInRequest): Promise<UpdateCheckInResponse> => {
    const { data } = await apiClient.patch<UpdateCheckInApiResponse>(
      `/api/v1/posts/checkin/${params.postId}`,
      {
        condition_score: params.conditionScore,
        condition_text: params.conditionText,
        condition_text_json: params.conditionTextJson,
        images: params.images,
      }
    );

    return {
      message: data.message,
      post: {
        id: data.post.id,
        conditionScore: data.post.condition_score,
        conditionText: data.post.condition_text,
        conditionTextJson: parseJsonField(data.post.condition_text_json),
        postedAt: data.post.posted_at,
        createdAt: data.post.created_at,
        updatedAt: data.post.updated_at,
      },
    };
  },

  updateCheckOut: async (params: UpdateCheckOutRequest): Promise<UpdateCheckOutResponse> => {
    const { data } = await apiClient.patch<UpdateCheckOutApiResponse>(
      `/api/v1/posts/checkout/${params.postId}`,
      {
        reflection_text: params.reflectionText,
        reflection_text_json: params.reflectionTextJson,
        images: params.images,
      }
    );

    return {
      message: data.message,
      post: {
        id: data.post.id,
        reflectionText: data.post.reflection_text,
        reflectionTextJson: parseJsonField(data.post.reflection_text_json),
        postedAt: data.post.posted_at,
        createdAt: data.post.created_at,
        updatedAt: data.post.updated_at,
      },
    };
  },

  deleteCheckIn: async (params: DeleteCheckInRequest): Promise<DeleteCheckInResponse> => {
    const { data } = await apiClient.delete<DeleteCheckInApiResponse>(
      `/api/v1/posts/checkin/${params.postId}`
    );

    return {
      message: data.message,
    };
  },

  deleteCheckOut: async (params: DeleteCheckOutRequest): Promise<DeleteCheckOutResponse> => {
    const { data } = await apiClient.delete<DeleteCheckOutApiResponse>(
      `/api/v1/posts/checkout/${params.postId}`
    );

    return {
      message: data.message,
    };
  },

  getPostDate: async (params: GetPostDateParams): Promise<GetPostDateResponse> => {
    const { data } = await apiClient.get<GetPostDateApiResponse>(
      `/api/v1/posts/${params.postId}/date`
    );

    return {
      date: data.date,
    };
  },
};
