/**
 * 스페이스 관련 API 함수들
 * 스페이스 생성, 수정, 조회, 삭제 등
 */

import type {
  ApiSpace,
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
  GetMySpacesResponse,
  GetSpaceParams,
  GetSpaceResponse,
  Space,
  UpdateSpaceRequest,
  UpdateSpaceResponse,
} from '@/shared/types/space';
import { apiClient } from '../api';

/**
 * 백엔드 API 멤버 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환
 */
// const convertApiMemberToMember = (apiMember: ApiSpaceMember): SpaceMember => {
//   // 백엔드 응답의 필드 표기(snake_case)와 일부 엔드포인트의 camelCase를 모두 허용
//   const anyMember = apiMember as unknown as {
//     id: string;
//     spaceId?: string;
//     space_id?: string;
//     name: string;
//     avatar_url?: string;
//     avatarURL?: string;
//     role: string;
//     joined_at?: string;
//     joinedAt?: string;
//   };

//   return {
//     id: anyMember.id,
//     spaceId: anyMember.space_id ?? anyMember.spaceId ?? '',
//     name: anyMember.name,
//     avatarURL: anyMember.avatar_url ?? anyMember.avatarURL,
//     role: anyMember.role as SpaceMember['role'],
//     joinedAt: anyMember.joined_at ?? anyMember.joinedAt ?? '',
//   };
// };

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
};
