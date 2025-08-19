/**
 * 멤버 관련 API 클라이언트
 */

import type { ApiSpaceMemberDTO } from '@/shared/types/api';
import type {
  GetSpaceMemberProfileResponse,
  SpaceMemberProfile,
  UpdateSpaceMemberProfileApiRequest,
  UpdateSpaceMemberProfileRequest,
  UpdateSpaceMemberProfileResponse,
} from '@/shared/types/member';
import { apiClient } from '../api';

/**
 * 백엔드 API 멤버 DTO를 프론트엔드 타입으로 변환하는 함수
 */
const convertApiMemberToProfile = (apiMember: ApiSpaceMemberDTO): SpaceMemberProfile => {
  return {
    id: apiMember.id,
    userId: apiMember.userId,
    name: apiMember.name,
    email: apiMember.email,
    avatarURL: apiMember.avatarURL || null,
    role: apiMember.role as SpaceMemberProfile['role'],
    joinedAt: apiMember.joinedAt,
  };
};

/**
 * 멤버 관련 API 함수들
 */
export const membersApi = {
  /**
   * 내 프로필 조회
   * @returns 현재 로그인한 스페이스 멤버의 프로필
   */
  getMyProfile: async (): Promise<{ spaceMember: SpaceMemberProfile }> => {
    const { data } = await apiClient.get<GetSpaceMemberProfileResponse>(
      '/api/v1/space-members/me/profile'
    );

    return {
      spaceMember: convertApiMemberToProfile(data.space_member),
    };
  },

  /**
   * 내 프로필 수정
   * @param request 프로필 수정 요청 데이터
   * @returns 수정된 프로필 정보
   */
  updateMyProfile: async (
    request: UpdateSpaceMemberProfileRequest
  ): Promise<{ message: string; spaceMember: SpaceMemberProfile }> => {
    const apiRequest: UpdateSpaceMemberProfileApiRequest = {};
    
    if (request.name !== undefined) {
      apiRequest.name = request.name;
    }
    if (request.avatarUrl !== undefined) {
      apiRequest.avatar_url = request.avatarUrl;
    }

    const { data } = await apiClient.patch<UpdateSpaceMemberProfileResponse>(
      '/api/v1/space-members/me/profile',
      apiRequest
    );

    return {
      message: data.message,
      spaceMember: convertApiMemberToProfile(data.space_member),
    };
  },
};