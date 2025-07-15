import type { FilterType } from '@/features/feed/types/feed.types';
import { postsApi } from '@/shared/lib/api/posts';
import { ErrorCode } from '@/shared/types/api';
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
import { formatDateToAPIString, getErrorMessage, isErrorCode } from '@/shared/utils';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { postsKeys } from './postsKeys';

interface UsePostsOptions {
  spaceSlug: string;
  filterType?: FilterType;
  selectedDate?: Date;
  limit?: number;
  enabled?: boolean;
}

interface UseFeedSummaryOptions {
  spaceSlug: string;
  date?: string; // 선택적, 기본값은 오늘 날짜
  timezone?: string; // 선택적, 사용자 타임존
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
    apiParams.date = formatDateToAPIString(selectedDate); // YYYY-MM-DD 형식
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
    retry: authRetry,
  });
};

export const useFeedSummary = (options: UseFeedSummaryOptions) => {
  const { spaceSlug, date, timezone } = options;

  return useQuery({
    queryKey: postsKeys.feedSummary(spaceSlug, date || formatDateToAPIString(new Date())),
    queryFn: () => postsApi.getFeedSummary({ spaceSlug, date, timezone }),
    enabled: !!spaceSlug,
    staleTime: 1000 * 30, // 30초
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: true,
    retry: authRetry,
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
    retry: authRetry,
  });
};

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  return useMutation<CreateCheckInResponse, Error, CreateCheckInRequest>({
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅
      console.warn('CheckIn API call - Images count:', params.images?.length || 0);
      console.warn('CheckIn API call - Images:', params.images);
      return postsApi.createCheckIn(params);
    },
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      const targetDate = variables.postedDate || formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
      const previousExistsData = queryClient.getQueryData(
        postsKeys.existsCheckin(variables.spaceSlug, targetDate)
      );
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(variables.spaceSlug, targetDate)
      );

      // existsCheckin 즉시 업데이트
      queryClient.setQueryData(postsKeys.existsCheckin(variables.spaceSlug, targetDate), {
        exists: true,
      });

      return { previousPostsData, previousExistsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // 대신 existsCheckin과 feedSummary만 업데이트 (즉시 필요한 상태)
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.setQueryData(postsKeys.existsCheckin(variables.spaceSlug, ctx.targetDate), {
          exists: true,
        });
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 상황을 위해 게시글 목록(cache) 무효화 추가
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(variables.spaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as
        | {
            previousPostsData?: any;
            previousExistsData?: any;
            previousSummaryData?: any;
            targetDate: string;
          }
        | undefined;
      if (ctx) {
        ctx.previousPostsData?.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
        if (ctx.previousExistsData !== undefined) {
          queryClient.setQueryData(
            postsKeys.existsCheckin(variables.spaceSlug, ctx.targetDate),
            ctx.previousExistsData
          );
        }
        if (ctx.previousSummaryData !== undefined) {
          queryClient.setQueryData(
            postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
            ctx.previousSummaryData
          );
        }
      }

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
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅
      console.warn('CheckOut API call - Images count:', params.images?.length || 0);
      console.warn('CheckOut API call - Images:', params.images);
      return postsApi.createCheckOut(params);
    },
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      const targetDate = variables.postedDate || formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(variables.spaceSlug, targetDate)
      );

      return { previousPostsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (팀 요약 통계 업데이트 필요)
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 상황을 위해 게시글 목록(cache) 무효화 추가
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(variables.spaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as
        | { previousPostsData?: any; previousSummaryData?: any; targetDate: string }
        | undefined;
      if (ctx) {
        ctx.previousPostsData?.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
        if (ctx.previousSummaryData !== undefined) {
          const targetDate = variables.postedDate || formatDateToAPIString(new Date());
          queryClient.setQueryData(
            postsKeys.feedSummary(variables.spaceSlug, targetDate),
            ctx.previousSummaryData
          );
        }
      }

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
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });

      return { previousPostsData };
    },
    onSuccess: (data, variables, _context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (통계 업데이트 필요)
      const targetDate = data.post.postedAt.split('T')[0];
      queryClient.invalidateQueries({
        queryKey: postsKeys.feedSummary(variables.spaceSlug, targetDate),
      });

      // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as { previousPostsData?: any } | undefined;
      if (ctx?.previousPostsData) {
        ctx.previousPostsData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }

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
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      const targetDate = formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
      const previousExistsData = queryClient.getQueryData(
        postsKeys.existsCheckin(variables.spaceSlug, targetDate)
      );
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(variables.spaceSlug, targetDate)
      );

      // existsCheckin 즉시 업데이트
      queryClient.setQueryData(postsKeys.existsCheckin(variables.spaceSlug, targetDate), {
        exists: false,
      });

      return { previousPostsData, previousExistsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.setQueryData(postsKeys.existsCheckin(variables.spaceSlug, ctx.targetDate), {
          exists: false,
        });
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(variables.spaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as
        | {
            previousPostsData?: any;
            previousExistsData?: any;
            previousSummaryData?: any;
            targetDate: string;
          }
        | undefined;
      if (ctx) {
        ctx.previousPostsData?.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
        if (ctx.previousExistsData !== undefined) {
          queryClient.setQueryData(
            postsKeys.existsCheckin(variables.spaceSlug, ctx.targetDate),
            ctx.previousExistsData
          );
        }
        if (ctx.previousSummaryData !== undefined) {
          queryClient.setQueryData(
            postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
            ctx.previousSummaryData
          );
        }
      }

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
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });

      return { previousPostsData };
    },
    onSuccess: (data, variables, _context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (통계 업데이트 필요)
      const targetDate = data.post.postedAt.split('T')[0];
      queryClient.invalidateQueries({
        queryKey: postsKeys.feedSummary(variables.spaceSlug, targetDate),
      });

      // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as { previousPostsData?: any } | undefined;
      if (ctx?.previousPostsData) {
        ctx.previousPostsData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }

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
    onMutate: async variables => {
      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(variables.spaceSlug) });

      const targetDate = formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(variables.spaceSlug),
        exact: false,
      });
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(variables.spaceSlug, targetDate)
      );

      return { previousPostsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(variables.spaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(variables.spaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      // ✅ 에러 시 이전 상태로 롤백
      const ctx = context as
        | { previousPostsData?: any; previousSummaryData?: any; targetDate: string }
        | undefined;
      if (ctx) {
        ctx.previousPostsData?.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
        if (ctx.previousSummaryData !== undefined) {
          const targetDate = formatDateToAPIString(new Date());
          queryClient.setQueryData(
            postsKeys.feedSummary(variables.spaceSlug, targetDate),
            ctx.previousSummaryData
          );
        }
      }

      error({
        title: '체크아웃 삭제 실패',
        message: getErrorMessage(err),
      });
    },
  });
};

interface UsePostDateOptions {
  spaceSlug: string;
  postId: string;
  enabled?: boolean;
}

export const usePostDate = (options: UsePostDateOptions) => {
  const { spaceSlug, postId, enabled = true } = options;

  return useQuery({
    queryKey: postsKeys.postDate(spaceSlug, postId),
    queryFn: () => postsApi.getPostDate({ spaceSlug, postId }),
    enabled: !!spaceSlug && !!postId && enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: authRetry,
  });
};
