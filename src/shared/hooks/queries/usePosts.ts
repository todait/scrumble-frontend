import type { FilterType } from '@/features/feed/types/feed.types';
import { postsApi } from '@/shared/lib/api/posts';
import type {
  CreateCheckInRequest,
  CreateCheckInResponse,
  CreateCheckOutRequest,
  CreateCheckOutResponse,
  DeleteCheckInRequest,
  DeleteCheckInResponse,
  DeleteCheckOutRequest,
  DeleteCheckOutResponse,
  GetPostsParams,
  UpdateCheckInRequest,
  UpdateCheckInResponse,
  UpdateCheckOutRequest,
  UpdateCheckOutResponse,
} from '@/shared/types/post';
import { defaultRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsKeys } from './postsKeys';
import { useToast } from '../useToast';
import { ErrorCode } from '@/shared/types/api';
import { getErrorMessage, isErrorCode } from '@/shared/utils';

interface UsePostsOptions {
  spaceSlug: string;
  filterType?: FilterType;
  selectedDate?: Date;
  limit?: number;
  enabled?: boolean;
}

/**
 * 포스트 목록을 가져오는 React Query 훅
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const usePosts = (options: UsePostsOptions) => {
  const { spaceSlug, filterType = 'all', selectedDate, limit = 20, enabled = true } = options;

  // API 파라미터 구성
  const apiParams: GetPostsParams = {
    spaceSlug,
    limit,
  };

  // 날짜 필터 적용
  if (selectedDate) {
    apiParams.date = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  }

  // 타입 필터 적용
  if (filterType !== 'all') {
    apiParams.types = filterType;
  }

  return useQuery({
    queryKey: postsKeys.list(spaceSlug, { filterType, date: apiParams.date }),
    queryFn: () => postsApi.getPosts(apiParams),
    enabled: !!spaceSlug && enabled,
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
    retry: defaultRetry,
  });
};

interface UseExistsCheckinOptions {
  spaceSlug: string;
  date: string;
}

export const useExistsCheckin = (options: UseExistsCheckinOptions) => {
  const { spaceSlug, date } = options;

  return useQuery({
    queryKey: postsKeys.existsCheckin(spaceSlug, date),
    queryFn: () => postsApi.existsCheckin({ spaceSlug, date }),
    enabled: !!spaceSlug && !!date,
    staleTime: 0,
    gcTime: 1000 * 60,
    retry: defaultRetry,
  });
};

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<CreateCheckInResponse, Error, CreateCheckInRequest>({
    mutationFn: params => postsApi.createCheckIn(params),
    onSuccess: (data, variables) => {
      // 포스트 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      // existsCheckin 쿼리 무효화 - 요청한 날짜 또는 오늘 날짜로
      const targetDate = variables.postedDate || new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({
        queryKey: postsKeys.existsCheckin(variables.spaceSlug, targetDate),
      });
    },
    onError: (err: unknown) => {
      if (isErrorCode(err, ErrorCode.CHECKIN_ALREADY_EXISTS)) {
        error({
          title: '이미 작성한 체크인이 있습니다',
          message: '오늘은 이미 체크인을 작성하셨습니다.',
        });
      } else {
        error({
          title: '체크인 작성 실패',
          message: getErrorMessage(err),
        });
      }
    },
  });
};

export const useCreateCheckOut = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<CreateCheckOutResponse, Error, CreateCheckOutRequest>({
    mutationFn: params => postsApi.createCheckOut(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (err: unknown) => {
      error({
        title: '체크아웃 작성 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

export const useUpdateCheckIn = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<UpdateCheckInResponse, Error, UpdateCheckInRequest>({
    mutationFn: params => postsApi.updateCheckIn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (err: unknown) => {
      error({
        title: '체크인 수정 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<DeleteCheckInResponse, Error, DeleteCheckInRequest>({
    mutationFn: params => postsApi.deleteCheckIn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (err: unknown) => {
      error({
        title: '체크인 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

export const useUpdateCheckOut = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<UpdateCheckOutResponse, Error, UpdateCheckOutRequest>({
    mutationFn: params => postsApi.updateCheckOut(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (err: unknown) => {
      error({
        title: '체크아웃 수정 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

export const useDeleteCheckOut = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<DeleteCheckOutResponse, Error, DeleteCheckOutRequest>({
    mutationFn: params => postsApi.deleteCheckOut(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
    onError: (err: unknown) => {
      error({
        title: '체크아웃 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};
