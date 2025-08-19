/**
 * 멤버 관련 React Query 훅
 */

import { membersApi } from '@/shared/lib/api/members';
import { ErrorCode } from '@/shared/types/api';
import type {
  SpaceMemberProfile,
  UpdateSpaceMemberProfileRequest,
  MemberErrorCode,
} from '@/shared/types/member';
import { getErrorCode, getErrorMessage, isErrorCode } from '@/shared/utils';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { memberInvalidateHelpers, membersKeys } from './membersKeys';

/**
 * 내 프로필 조회 React Query 훅
 * @param options 조회 옵션 (enabled)
 * @returns React Query 결과
 */
export const useMyProfile = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: membersKeys.myProfile(),
    queryFn: () => membersApi.getMyProfile(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });
};

/**
 * 내 프로필 수정 mutation 훅
 * @returns React Query mutation
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation<
    { message: string; spaceMember: SpaceMemberProfile },
    Error,
    UpdateSpaceMemberProfileRequest
  >({
    mutationFn: (request) => membersApi.updateMyProfile(request),
    onMutate: async (variables) => {
      // Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: membersKeys.myProfile() });

      // 이전 데이터 백업 (롤백용)
      const previousProfileData = queryClient.getQueryData(membersKeys.myProfile());

      // Optimistic update
      if (variables.name || variables.avatarUrl !== undefined) {
        memberInvalidateHelpers.updateMyProfileInCache(
          queryClient,
          (profile: SpaceMemberProfile) => ({
            ...profile,
            ...(variables.name && { name: variables.name }),
            ...(variables.avatarUrl !== undefined && { avatarURL: variables.avatarUrl }),
          })
        );
      }

      return { previousProfileData };
    },
    onSuccess: (data, _variables, _context) => {
      // 캐시 업데이트 (서버 응답으로 덮어쓰기)
      queryClient.setQueryData(membersKeys.myProfile(), {
        spaceMember: data.spaceMember,
      });
      
      // 쿼리 무효화하여 즉시 새 데이터 반영
      queryClient.invalidateQueries({ 
        queryKey: membersKeys.myProfile(),
        refetchType: 'active' 
      });

      success({
        message: '프로필 정보가 수정되었습니다.',
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      const ctx = context as { previousProfileData?: any } | undefined;
      if (ctx?.previousProfileData) {
        queryClient.setQueryData(membersKeys.myProfile(), ctx.previousProfileData);
      }

      if (isErrorCode(err, ErrorCode.FORBIDDEN)) {
        error({
          message: '권한 없음: 프로필을 수정할 권한이 없습니다.',
        });
      } else if (getErrorCode(err) === MemberErrorCode.MEMBER_NOT_FOUND as string) {
        error({
          message: '멤버를 찾을 수 없음: 존재하지 않는 멤버입니다.',
        });
      } else if (getErrorCode(err) === MemberErrorCode.INVALID_AVATAR_URL as string) {
        error({
          message: '잘못된 아바타 URL: 올바른 URL 형식을 입력해주세요.',
        });
      } else if (getErrorCode(err) === MemberErrorCode.NAME_TOO_LONG as string) {
        error({
          message: '이름이 너무 깁니다: 100자 이하로 입력해주세요.',
        });
      } else if (getErrorCode(err) === MemberErrorCode.NAME_REQUIRED as string) {
        error({
          message: '이름 필수: 이름을 입력해주세요.',
        });
      } else {
        error({
          message: `프로필 수정 실패: ${getErrorMessage(err)}`,
        });
      }
    },
  });
};