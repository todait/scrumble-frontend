/**
 * 스페이스 관련 API 함수들
 * 스페이스 생성, 수정, 조회, 삭제 등
 */

import type {
  ApiSpace,
  ApiSpaceMember,
  CreateSpaceApiRequest,
  CreateSpaceApiResponse,
  DeleteSpaceApiResponse,
  GetMySpacesApiResponse,
  GetSpaceApiResponse,
  UpdateSpaceApiRequest,
  UpdateSpaceApiResponse,
} from '@/shared/types/api';
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceParams,
  DeleteSpaceResponse,
  GetMySpacesOptions,
  GetMySpacesResponse,
  GetSpaceParams,
  GetSpaceResponse,
  Space,
  SpaceMember,
  UpdateSpaceRequest,
  UpdateSpaceResponse,
} from '@/shared/types/space';
import { apiClient } from '../api';

/**
 * 백엔드 API 멤버 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환
 */
const convertApiMemberToMember = (apiMember: ApiSpaceMember): SpaceMember => {
  return {
    id: apiMember.id,
    userId: apiMember.user_id,
    name: apiMember.name,
    avatarURL: apiMember.avatar_url,
    role: apiMember.role as SpaceMember['role'],
    joinedAt: apiMember.joined_at,
  };
};

/**
 * 백엔드 API 스페이스 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환
 */
const convertApiSpaceToSpace = (apiSpace: ApiSpace): Space => {
  return {
    id: apiSpace.id,
    slug: apiSpace.slug,
    name: apiSpace.name,
    iconURL: apiSpace.icon_url,
    members: apiSpace.members.map(convertApiMemberToMember),
    createdAt: apiSpace.created_at,
    updatedAt: apiSpace.updated_at,
  };
};

/**
 * 스페이스 관련 API 함수들
 */
export const spacesApi = {
  /**
   * 스페이스 생성
   * @param request 스페이스 생성 요청 데이터
   * @param timezone 사용자 타임존 (선택사항)
   * @returns 생성된 스페이스 정보
   */
  createSpace: async (
    request: CreateSpaceRequest,
    timezone?: string
  ): Promise<CreateSpaceResponse> => {
    const headers = timezone ? { 'X-Timezone': timezone } : undefined;

    const { data } = await apiClient.post<CreateSpaceApiResponse>(
      '/api/v1/spaces',
      {
        name: request.name,
      } as CreateSpaceApiRequest,
      { headers }
    );

    return {
      message: data.message,
      space: convertApiSpaceToSpace(data.space),
    };
  },

  /**
   * 스페이스 수정
   * @param request 스페이스 수정 요청 데이터
   * @param timezone 사용자 타임존 (선택사항)
   * @returns 수정된 스페이스 정보
   */
  updateSpace: async (
    request: UpdateSpaceRequest,
    timezone?: string
  ): Promise<UpdateSpaceResponse> => {
    const headers = timezone ? { 'X-Timezone': timezone } : undefined;

    const apiRequest: UpdateSpaceApiRequest = {};
    if (request.name !== undefined) {
      apiRequest.name = request.name;
    }
    if (request.iconUrl !== undefined) {
      apiRequest.icon_url = request.iconUrl;
    }

    const { data } = await apiClient.patch<UpdateSpaceApiResponse>(
      `/api/v1/spaces/${request.spaceSlug}`,
      apiRequest,
      { headers }
    );

    return {
      message: data.message,
      space: convertApiSpaceToSpace(data.space),
    };
  },

  /**
   * 내 스페이스 목록 조회
   * @param options 조회 옵션 (타임존 포함)
   * @returns 내가 속한 스페이스 목록
   */
  getMySpaces: async (options?: GetMySpacesOptions): Promise<GetMySpacesResponse> => {
    const headers = options?.timezone ? { 'X-Timezone': options.timezone } : undefined;

    const { data } = await apiClient.get<GetMySpacesApiResponse>('/api/v1/spaces/my-list', {
      headers,
    });

    return {
      spaces: data.spaces.map(convertApiSpaceToSpace),
    };
  },

  /**
   * 스페이스 상세 조회
   * @param params 조회 파라미터 (스페이스 슬러그, 타임존)
   * @returns 스페이스 상세 정보
   */
  getSpace: async (params: GetSpaceParams): Promise<GetSpaceResponse> => {
    const headers = params.timezone ? { 'X-Timezone': params.timezone } : undefined;

    const { data } = await apiClient.get<GetSpaceApiResponse>(
      `/api/v1/spaces/${params.spaceSlug}`,
      { headers }
    );

    return {
      space: convertApiSpaceToSpace(data.space),
    };
  },

  /**
   * 스페이스 삭제
   * @param params 삭제 파라미터 (스페이스 슬러그)
   * @returns 삭제 성공 메시지
   */
  deleteSpace: async (params: DeleteSpaceParams): Promise<DeleteSpaceResponse> => {
    const { data } = await apiClient.delete<DeleteSpaceApiResponse>(
      `/api/v1/spaces/${params.spaceSlug}`
    );

    return {
      message: data.message,
    };
  },
};