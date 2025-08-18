/**
 * 스페이스 관련 API 함수들
 * 스페이스 생성, 수정, 조회, 삭제 등
 */

import type {
  ApiSpace,
  ApiSpaceMemberDTO,
  CreateSpaceApiRequest,
  CreateSpaceApiResponse,
  DeleteSpaceApiResponse,
  GetMySpacesApiResponse,
  GetSpaceApiResponse,
  GetSpaceMemberListApiResponse,
  UpdateSpaceApiRequest,
  UpdateSpaceApiResponse,
} from '@/shared/types/api';
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceParams,
  DeleteSpaceResponse,
  GetMySpacesResponse,
  GetSpaceParams,
  GetSpaceResponse,
  GetSpaceMembersParams,
  GetSpaceMembersResponse,
  Space,
  SpaceMember,
  UpdateSpaceRequest,
  UpdateSpaceResponse,
} from '@/shared/types/space';
import { apiClient } from '../api';

/**
 * 백엔드 API 멤버 DTO를 프론트엔드 타입으로 변환하는 함수
 */
const convertApiMemberDTOToMember = (apiMember: ApiSpaceMemberDTO): SpaceMember => {
  return {
    id: apiMember.id,
    spaceId: '', // spaceId는 선택적으로 비워둠
    userId: apiMember.userId,
    name: apiMember.name,
    email: apiMember.email,
    avatarURL: apiMember.avatarURL,
    role: apiMember.role as SpaceMember['role'],
    joinedAt: apiMember.joinedAt,
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
    memberCount: apiSpace.memberCount,
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
   * @returns 생성된 스페이스 정보
   */
  createSpace: async (request: CreateSpaceRequest): Promise<CreateSpaceResponse> => {
    const { data } = await apiClient.post<CreateSpaceApiResponse>('/api/v1/spaces', {
      name: request.name,
    } as CreateSpaceApiRequest);

    return {
      message: data.message,
      space: convertApiSpaceToSpace(data.space),
    };
  },

  /**
   * 스페이스 수정
   * @param request 스페이스 수정 요청 데이터
   * @returns 수정된 스페이스 정보
   */
  updateSpace: async (request: UpdateSpaceRequest): Promise<UpdateSpaceResponse> => {
    const apiRequest: UpdateSpaceApiRequest = {};
    if (request.name !== undefined) {
      apiRequest.name = request.name;
    }
    if (request.iconUrl !== undefined) {
      apiRequest.icon_url = request.iconUrl;
    }

    const { data } = await apiClient.patch<UpdateSpaceApiResponse>(
      `/api/v1/spaces/${request.spaceSlug}`,
      apiRequest
    );

    return {
      message: data.message,
      space: convertApiSpaceToSpace(data.space),
    };
  },

  /**
   * 내 스페이스 목록 조회
   * @returns 내가 속한 스페이스 목록
   */
  getMySpaces: async (): Promise<GetMySpacesResponse> => {
    const { data } = await apiClient.get<GetMySpacesApiResponse>('/api/v1/spaces/my-list');

    return {
      spaces: data.spaces.map(convertApiSpaceToSpace),
    };
  },

  /**
   * 스페이스 상세 조회
   * @param params 조회 파라미터 (스페이스 슬러그)
   * @returns 스페이스 상세 정보
   */
  getSpace: async (params: GetSpaceParams): Promise<GetSpaceResponse> => {
    const { data } = await apiClient.get<GetSpaceApiResponse>(`/api/v1/spaces/${params.spaceSlug}`);

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

  /**
   * 스페이스 멤버 목록 조회
   * @param params 조회 파라미터 (스페이스 슬러그, 페이지네이션)
   * @returns 스페이스 멤버 목록
   */
  getSpaceMembers: async (params: GetSpaceMembersParams): Promise<GetSpaceMembersResponse> => {
    const queryParams = new URLSearchParams();
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const { data } = await apiClient.get<GetSpaceMemberListApiResponse>(
      `/api/v1/spaces/${params.spaceSlug}/members${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );

    return {
      members: data.members.map(member => convertApiMemberDTOToMember(member)),
      message: data.message,
      nextCursor: data.nextCursor,
    };
  },
};
