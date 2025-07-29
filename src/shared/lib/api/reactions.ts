/**
 * 리액션 관련 API 함수들
 * 포스트와 댓글에 리액션 추가, 제거, 조회
 */

import { apiClient } from '../api';

// 백엔드 API 응답 타입들
interface AddReactionApiResponse {
  message: string;
}

interface RemoveReactionApiResponse {
  message: string;
}

interface GetReactionsApiResponse {
  message: string;
  summary: {
    target_id: string;
    target_type: string;
    reactions: Array<{
      space_member_id: string;
      emoji: string;
      created_at: string;
      author: {
        id: string;
        email: string;
        name: string;
        avatar_url: string;
      };
    }>;
    total_count: number;
  };
}

// 프론트엔드 타입들
export interface Reaction {
  spaceMemberId: string;
  emoji: string;
  createdAt: string;
  author: {
    id: string;
    email: string;
    name: string;
    avatarURL: string;
  };
}

export interface ReactionSummary {
  targetId: string;
  targetType: 'posts' | 'comments';
  reactions: Reaction[];
  totalCount: number;
}

export interface AddReactionRequest {
  targetType: 'posts' | 'comments';
  targetId: string;
  emoji: string;
}

export interface RemoveReactionRequest {
  targetType: 'posts' | 'comments';
  targetId: string;
  emoji: string;
}

export interface GetReactionsRequest {
  targetType: 'posts' | 'comments';
  targetId: string;
}

export interface AddReactionResponse {
  message: string;
}

export interface RemoveReactionResponse {
  message: string;
}

export interface GetReactionsResponse {
  message: string;
  summary: ReactionSummary;
}

/**
 * 백엔드 API 응답을 프론트엔드 타입으로 변환
 */
const convertApiReactionToReaction = (
  apiReaction: GetReactionsApiResponse['summary']['reactions'][0]
): Reaction => {
  return {
    spaceMemberId: apiReaction.space_member_id,
    emoji: apiReaction.emoji,
    createdAt: apiReaction.created_at,
    author: {
      id: apiReaction.author.id,
      email: apiReaction.author.email,
      name: apiReaction.author.name,
      avatarURL: apiReaction.author.avatar_url || '',
    },
  };
};

const convertApiReactionSummaryToReactionSummary = (
  apiSummary: GetReactionsApiResponse['summary']
): ReactionSummary => {
  return {
    targetId: apiSummary.target_id,
    targetType: apiSummary.target_type as 'posts' | 'comments',
    reactions: apiSummary.reactions.map(convertApiReactionToReaction),
    totalCount: apiSummary.total_count,
  };
};

/**
 * 리액션 관련 API 함수들
 */
export const reactionsApi = {
  /**
   * 리액션 추가
   * @param params 리액션 추가 파라미터
   * @returns 추가 결과 메시지
   */
  addReaction: async (params: AddReactionRequest): Promise<AddReactionResponse> => {
    const { data } = await apiClient.post<AddReactionApiResponse>(
      `/api/v1/${params.targetType}/${params.targetId}/reactions`,
      {
        emoji: params.emoji,
      }
    );

    return {
      message: data.message,
    };
  },

  /**
   * 리액션 제거
   * @param params 리액션 제거 파라미터
   * @returns 제거 결과 메시지
   */
  removeReaction: async (params: RemoveReactionRequest): Promise<RemoveReactionResponse> => {
    const encodedEmoji = encodeURIComponent(params.emoji);
    const { data } = await apiClient.delete<RemoveReactionApiResponse>(
      `/api/v1/${params.targetType}/${params.targetId}/reactions?emoji=${encodedEmoji}`
    );

    return {
      message: data.message,
    };
  },

  /**
   * 리액션 목록 조회
   * @param params 리액션 조회 파라미터
   * @returns 변환된 리액션 목록과 요약 정보
   */
  getReactions: async (params: GetReactionsRequest): Promise<GetReactionsResponse> => {
    const { data } = await apiClient.get<GetReactionsApiResponse>(
      `/api/v1/${params.targetType}/${params.targetId}/reactions`
    );

    return {
      message: data.message,
      summary: convertApiReactionSummaryToReactionSummary(data.summary),
    };
  },
};
