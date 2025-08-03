/**
 * 스페이스 관련 React Query 훅
 * 스페이스 CRUD 작업을 위한 커스텀 훅 모음
 */

import { spacesApi } from '@/shared/lib/api/spaces';
import { ErrorCode } from '@/shared/types/api';
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceParams,
  DeleteSpaceResponse,
  GetSpaceParams,
  Space,
  UpdateSpaceRequest,
  UpdateSpaceResponse,
} from '@/shared/types/space';
import { SpaceErrorCode } from '@/shared/types/space';
import { getErrorCode, getErrorMessage, isErrorCode } from '@/shared/utils';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { spaceInvalidateHelpers, spacesKeys } from './spacesKeys';

/**
 * 내 스페이스 목록을 가져오는 React Query 훅
 * @param options 조회 옵션 (타임존)
 * @returns React Query 결과
 */
export const useMySpaces = () => {
  return useQuery({
    queryKey: spacesKeys.myList(),
    queryFn: () => spacesApi.getMySpaces(),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 15, // 15분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });
};

/**
 * 특정 스페이스 상세 정보를 가져오는 React Query 훅
 * @param params 조회 파라미터
 * @returns React Query 결과
 */
export const useSpace = (params: GetSpaceParams & { enabled?: boolean }) => {
  const { spaceSlug, enabled = true } = params;

  return useQuery({
    queryKey: spacesKeys.detail(spaceSlug),
    queryFn: () => spacesApi.getSpace({ spaceSlug }),
    enabled: !!spaceSlug && enabled,
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });
};

/**
 * 스페이스 생성 mutation 훅
 * @returns React Query mutation
 */
export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation<CreateSpaceResponse, Error, CreateSpaceRequest>({
    mutationFn: (request) => spacesApi.createSpace(request),
    onMutate: async variables => {
      // Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: spacesKeys.myList() });

      // 이전 데이터 백업 (롤백용)
      const previousSpacesData = queryClient.getQueryData(spacesKeys.myList());

      return { previousSpacesData };
    },
    onSuccess: (data, _variables, _context) => {
      // 스페이스 목록 무효화
      spaceInvalidateHelpers.invalidateMySpaces(queryClient);

      success({
        message: `'${data.space.name}' 스페이스가 생성되었습니다.`,
      });
    },
    onError: (err: unknown, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      const ctx = context as { previousSpacesData?: any } | undefined;
      if (ctx?.previousSpacesData) {
        queryClient.setQueryData(spacesKeys.myList(), ctx.previousSpacesData);
      }

      const errorCode = getErrorCode(err);
      if (errorCode === SpaceErrorCode.SPACE_NAME_REQUIRED as string) {
        error({
          message: '스페이스 생성 실패: 스페이스 이름을 입력해주세요.',
        });
      } else if (errorCode === SpaceErrorCode.SPACE_NAME_TOO_LONG as string) {
        error({
          message: '스페이스 생성 실패: 스페이스 이름은 100자 이하로 입력해주세요.',
        });
      } else {
        error({
          message: `스페이스 생성 실패: ${getErrorMessage(err)}`,
        });
      }
    },
  });
};

/**
 * 스페이스 수정 mutation 훅
 * @returns React Query mutation
 */
export const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation<UpdateSpaceResponse, Error, UpdateSpaceRequest>({
    mutationFn: (request) => spacesApi.updateSpace(request),
    onMutate: async variables => {
      // Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: spacesKeys.detail(variables.spaceSlug) });
      await queryClient.cancelQueries({ queryKey: spacesKeys.myList() });

      // 이전 데이터 백업 (롤백용)
      const previousSpaceData = queryClient.getQueryData(spacesKeys.detail(variables.spaceSlug));
      const previousSpacesData = queryClient.getQueryData(spacesKeys.myList());

      // Optimistic update
      if (variables.name || variables.iconUrl !== undefined) {
        spaceInvalidateHelpers.updateSpaceInCache(
          queryClient,
          variables.spaceSlug,
          (space: Space) => ({
            ...space,
            ...(variables.name && { name: variables.name }),
            ...(variables.iconUrl !== undefined && { iconURL: variables.iconUrl }),
            updatedAt: new Date().toISOString(),
          })
        );
      }

      return { previousSpaceData, previousSpacesData };
    },
    onSuccess: (data, variables, _context) => {
      // 캐시 업데이트 (서버 응답으로 덮어쓰기)
      spaceInvalidateHelpers.updateSpaceInCache(
        queryClient,
        variables.spaceSlug,
        () => data.space
      );

      success({
        message: '스페이스 정보가 수정되었습니다.',
      });
    },
    onError: (err: unknown, variables, context) => {
      // 에러 시 이전 상태로 롤백
      const ctx = context as { previousSpaceData?: any; previousSpacesData?: any } | undefined;
      if (ctx?.previousSpaceData) {
        queryClient.setQueryData(spacesKeys.detail(variables.spaceSlug), ctx.previousSpaceData);
      }
      if (ctx?.previousSpacesData) {
        queryClient.setQueryData(spacesKeys.myList(), ctx.previousSpacesData);
      }

      if (isErrorCode(err, ErrorCode.FORBIDDEN) || getErrorCode(err) === SpaceErrorCode.NOT_SPACE_OWNER as string) {
        error({
          message: '권한 없음: 스페이스를 수정할 권한이 없습니다.',
        });
      } else if (getErrorCode(err) === SpaceErrorCode.SPACE_NOT_FOUND as string) {
        error({
          message: '스페이스를 찾을 수 없음: 존재하지 않는 스페이스입니다.',
        });
      } else if (getErrorCode(err) === SpaceErrorCode.INVALID_ICON_URL as string) {
        error({
          message: '잘못된 아이콘 URL: 올바른 URL 형식을 입력해주세요.',
        });
      } else {
        error({
          message: `스페이스 수정 실패: ${getErrorMessage(err)}`,
        });
      }
    },
  });
};

/**
 * 스페이스 삭제 mutation 훅
 * @returns React Query mutation
 */
export const useDeleteSpace = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation<DeleteSpaceResponse, Error, DeleteSpaceParams>({
    mutationFn: params => spacesApi.deleteSpace(params),
    onMutate: async variables => {
      // Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: spacesKeys.myList() });
      await queryClient.cancelQueries({ queryKey: spacesKeys.detail(variables.spaceSlug) });

      // 이전 데이터 백업 (롤백용)
      const previousSpacesData = queryClient.getQueryData(spacesKeys.myList());
      const previousSpaceData = queryClient.getQueryData(spacesKeys.detail(variables.spaceSlug));

      // Optimistic update: 목록에서 제거
      spaceInvalidateHelpers.removeSpaceFromCache(queryClient, variables.spaceSlug);

      return { previousSpacesData, previousSpaceData };
    },
    onSuccess: (_data, _variables, _context) => {
      success({
        message: '스페이스가 삭제되었습니다.',
      });
    },
    onError: (err: unknown, variables, context) => {
      // 에러 시 이전 상태로 롤백
      const ctx = context as { previousSpacesData?: any; previousSpaceData?: any } | undefined;
      if (ctx?.previousSpacesData) {
        queryClient.setQueryData(spacesKeys.myList(), ctx.previousSpacesData);
      }
      if (ctx?.previousSpaceData) {
        queryClient.setQueryData(spacesKeys.detail(variables.spaceSlug), ctx.previousSpaceData);
      }

      if (isErrorCode(err, ErrorCode.FORBIDDEN) || getErrorCode(err) === SpaceErrorCode.NOT_SPACE_OWNER as string) {
        error({
          message: '권한 없음: 스페이스를 삭제할 권한이 없습니다. 소유자만 삭제할 수 있습니다.',
        });
      } else if (getErrorCode(err) === SpaceErrorCode.SPACE_NOT_FOUND as string) {
        error({
          message: '스페이스를 찾을 수 없음: 이미 삭제되었거나 존재하지 않는 스페이스입니다.',
        });
      } else {
        error({
          message: `스페이스 삭제 실패: ${getErrorMessage(err)}`,
        });
      }
    },
  });
};