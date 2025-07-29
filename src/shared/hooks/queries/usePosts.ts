import type { FilterType } from '@/features/feed/types/feed.types';
import { useAuth } from '@/shared/contexts/AuthContext';
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
  filterType?: FilterType;
  selectedDate?: Date;
  limit?: number;
  enabled?: boolean;
}

interface UseFeedSummaryOptions {
  date?: string; // 선택적, 기본값은 오늘 날짜
  timezone?: string; // 선택적, 사용자 타임존
}

/**
 * 포스트 목록을 가져오는 React Query 훅
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const usePosts = (options: UsePostsOptions) => {
  const { filterType = 'all', selectedDate, limit = 20, enabled = true } = options;
  const { currentSpaceSlug } = useAuth();

  // API 파라미터 구성
  const apiParams: GetPostsParams = {
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
    queryKey: postsKeys.list(currentSpaceSlug || '', { filterType, date: apiParams.date }),
    queryFn: () => postsApi.getPosts(apiParams),
    enabled: enabled && !!currentSpaceSlug,
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
    retry: authRetry,
  });
};

export const useFeedSummary = (options: UseFeedSummaryOptions) => {
  const { date, timezone } = options;
  const { currentSpaceSlug } = useAuth();

  return useQuery({
    queryKey: postsKeys.feedSummary(
      currentSpaceSlug || '',
      date || formatDateToAPIString(new Date())
    ),
    queryFn: () => postsApi.getFeedSummary({ date, timezone }),
    enabled: !!currentSpaceSlug,
    staleTime: 1000 * 30, // 30초
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: true,
    retry: authRetry,
  });
};

interface UseExistsCheckinOptions {
  date: string;
}

export const useExistsCheckin = (options: UseExistsCheckinOptions) => {
  const { date } = options;
  const { currentSpaceSlug } = useAuth();

  return useQuery({
    queryKey: postsKeys.existsCheckin(currentSpaceSlug || '', date),
    queryFn: () => postsApi.existsCheckin({ date }),
    enabled: !!date && !!currentSpaceSlug,
    staleTime: 0,
    gcTime: 1000 * 60,
    retry: authRetry,
  });
};

export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();
  const { currentSpaceSlug } = useAuth();

  return useMutation<CreateCheckInResponse, Error, CreateCheckInRequest>({
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅
      console.warn('CheckIn API call - Images count:', params.images?.length || 0);
      console.warn('CheckIn API call - Images:', params.images);
      return postsApi.createCheckIn(params);
    },
    onMutate: async variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      const targetDate = variables.postedDate || formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
      const previousExistsData = queryClient.getQueryData(
        postsKeys.existsCheckin(currentSpaceSlug, targetDate)
      );
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(currentSpaceSlug, targetDate)
      );

      // existsCheckin 즉시 업데이트
      queryClient.setQueryData(postsKeys.existsCheckin(currentSpaceSlug, targetDate), {
        exists: true,
      });

      return { previousPostsData, previousExistsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // 대신 existsCheckin과 feedSummary만 업데이트 (즉시 필요한 상태)
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.setQueryData(postsKeys.existsCheckin(currentSpaceSlug, ctx.targetDate), {
          exists: true,
        });
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 상황을 위해 게시글 목록(cache) 무효화 추가
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(currentSpaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
            postsKeys.existsCheckin(currentSpaceSlug, ctx.targetDate),
            ctx.previousExistsData
          );
        }
        if (ctx.previousSummaryData !== undefined) {
          queryClient.setQueryData(
            postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
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
  const { currentSpaceSlug } = useAuth();

  return useMutation<CreateCheckOutResponse, Error, CreateCheckOutRequest>({
    mutationFn: params => {
      // 디버깅: 이미지 데이터 로깅
      console.warn('CheckOut API call - Images count:', params.images?.length || 0);
      console.warn('CheckOut API call - Images:', params.images);
      return postsApi.createCheckOut(params);
    },
    onMutate: async variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      const targetDate = variables.postedDate || formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(currentSpaceSlug, targetDate)
      );

      return { previousPostsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (팀 요약 통계 업데이트 필요)
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 상황을 위해 게시글 목록(cache) 무효화 추가
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(currentSpaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
            postsKeys.feedSummary(currentSpaceSlug, targetDate),
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
  const { currentSpaceSlug } = useAuth();

  return useMutation<UpdateCheckInResponse, Error, UpdateCheckInRequest>({
    mutationFn: params => postsApi.updateCheckIn(params),
    onMutate: async _variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });

      return { previousPostsData };
    },
    onSuccess: (data, variables, _context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (통계 업데이트 필요)
      const targetDate = data.post.postedAt.split('T')[0];
      queryClient.invalidateQueries({
        queryKey: postsKeys.feedSummary(currentSpaceSlug, targetDate),
      });

      // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
  const { currentSpaceSlug } = useAuth();

  return useMutation<DeleteCheckInResponse, Error, DeleteCheckInRequest>({
    mutationFn: params => postsApi.deleteCheckIn(params),
    onMutate: async variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      const targetDate = formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
      const previousExistsData = queryClient.getQueryData(
        postsKeys.existsCheckin(currentSpaceSlug, targetDate)
      );
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(currentSpaceSlug, targetDate)
      );

      // existsCheckin 즉시 업데이트
      queryClient.setQueryData(postsKeys.existsCheckin(currentSpaceSlug, targetDate), {
        exists: false,
      });

      return { previousPostsData, previousExistsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.setQueryData(postsKeys.existsCheckin(currentSpaceSlug, ctx.targetDate), {
          exists: false,
        });
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(currentSpaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
            postsKeys.existsCheckin(currentSpaceSlug, ctx.targetDate),
            ctx.previousExistsData
          );
        }
        if (ctx.previousSummaryData !== undefined) {
          queryClient.setQueryData(
            postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
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
  const { currentSpaceSlug } = useAuth();

  return useMutation<UpdateCheckOutResponse, Error, UpdateCheckOutRequest>({
    mutationFn: params => postsApi.updateCheckOut(params),
    onMutate: async variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });

      return { previousPostsData };
    },
    onSuccess: (data, variables, _context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      // feedSummary만 무효화 (통계 업데이트 필요)
      const targetDate = data.post.postedAt.split('T')[0];
      queryClient.invalidateQueries({
        queryKey: postsKeys.feedSummary(currentSpaceSlug, targetDate),
      });

      // ❗️ WebSocket 미도착 시 대비 - 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
  const { currentSpaceSlug } = useAuth();

  return useMutation<DeleteCheckOutResponse, Error, DeleteCheckOutRequest>({
    mutationFn: params => postsApi.deleteCheckOut(params),
    onMutate: async variables => {
      if (!currentSpaceSlug) return;

      // ✅ Optimistic Update: 진행 중인 쿼리들 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists(currentSpaceSlug) });

      const targetDate = formatDateToAPIString(new Date());

      // 이전 데이터 백업 (롤백용)
      const previousPostsData = queryClient.getQueriesData({
        queryKey: postsKeys.lists(currentSpaceSlug),
        exact: false,
      });
      const previousSummaryData = queryClient.getQueryData(
        postsKeys.feedSummary(currentSpaceSlug, targetDate)
      );

      return { previousPostsData, previousSummaryData, targetDate };
    },
    onSuccess: (data, variables, context) => {
      if (!currentSpaceSlug) return;

      // ✅ invalidateQueries 제거 - WebSocket 이벤트가 실제 동기화 담당
      const ctx = context as { targetDate: string } | undefined;
      if (ctx) {
        queryClient.invalidateQueries({
          queryKey: postsKeys.feedSummary(currentSpaceSlug, ctx.targetDate),
        });

        // ❗️ WebSocket 미도착 시 대빔 - 게시글 목록 무효화
        queryClient.invalidateQueries({
          queryKey: postsKeys.lists(currentSpaceSlug),
          exact: false,
        });
      }
    },
    onError: (err: unknown, variables, context) => {
      if (!currentSpaceSlug) return;

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
            postsKeys.feedSummary(currentSpaceSlug, targetDate),
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
  postId: string;
  enabled?: boolean;
}

export const usePostDate = (options: UsePostDateOptions) => {
  const { postId, enabled = true } = options;
  const { currentSpaceSlug } = useAuth();

  return useQuery({
    queryKey: postsKeys.postDate(currentSpaceSlug || '', postId),
    queryFn: () => postsApi.getPostDate({ postId }),
    enabled: !!postId && enabled && !!currentSpaceSlug,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: authRetry,
  });
};
