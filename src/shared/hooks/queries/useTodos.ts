import type {
  CreateTodosRequest,
  CreateTodosResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetTodosRequest,
  GetTodosResponse,
  ToggleTodoRequest,
  ToggleTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
} from '@/shared/types/todo';
import { ErrorCode } from '@/shared/types/api';
import { todosApi } from '@/shared/lib/api/todos';
import { getErrorMessage, isErrorCode } from '@/shared/utils';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../useToast';
import { todosKeys, todoInvalidateHelpers } from './todosKeys';

interface UseTodosOptions {
  spaceSlug: string;
  date: string; // YYYY-MM-DD 형식
  enabled?: boolean;
}

/**
 * Todo 목록을 가져오는 React Query 훅
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const useTodos = (options: UseTodosOptions) => {
  const { spaceSlug, date, enabled = true } = options;
  
  const queryParams: GetTodosRequest = {
    spaceSlug,
    date,
  };

  return useQuery<GetTodosResponse, Error>({
    queryKey: todosKeys.byDate(spaceSlug, date),
    queryFn: () => todosApi.getTodos(queryParams),
    enabled: enabled && !!spaceSlug && !!date,
    retry: authRetry,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * Todo 생성 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useCreateTodos = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<CreateTodosResponse, Error, Omit<CreateTodosRequest, 'spaceSlug'>>({
    mutationFn: (request) => todosApi.createTodos({ ...request, spaceSlug }),
    onSuccess: (data) => {
      // 스페이스의 모든 Todo 캐시 무효화
      todoInvalidateHelpers.invalidateSpaceTodos(queryClient, spaceSlug);
      
      success({
        title: '성공',
        message: data.message || '할 일이 생성되었습니다.',
      });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      
      if (isErrorCode(error, ErrorCode.SPACE_NOT_FOUND)) {
        toastError({
          title: '오류',
          message: '스페이스를 찾을 수 없습니다.',
        });
      } else if (isErrorCode(error, ErrorCode.VALIDATION_ERROR)) {
        toastError({
          title: '오류',
          message: '입력한 데이터에 오류가 있습니다.',
        });
      } else {
        toastError({
          title: '오류',
          message: errorMessage || '할 일 생성 중 오류가 발생했습니다.',
        });
      }
    },
  });
};

/**
 * Todo 수정 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useUpdateTodo = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<UpdateTodoResponse, Error, Omit<UpdateTodoRequest, 'spaceSlug'>>({
    mutationFn: (request) => todosApi.updateTodo({ ...request, spaceSlug }),
    onSuccess: (data, variables) => {
      // 해당 Todo만 캐시에서 업데이트
      todoInvalidateHelpers.updateTodoInLists(queryClient, spaceSlug, variables.todoId, (todo) => ({
        ...todo,
        ...(variables.name && { name: variables.name }),
        ...(variables.description !== undefined && { description: variables.description }),
        ...(variables.scheduledDate && { scheduledDate: variables.scheduledDate }),
        ...(variables.order !== undefined && { order: variables.order }),
        ...(variables.thirdpartyUrl !== undefined && { thirdpartyUrl: variables.thirdpartyUrl }),
        ...(variables.parentId !== undefined && { parentId: variables.parentId }),
      }));
      
      success({
        title: '성공',
        message: data.message || '할 일이 수정되었습니다.',
      });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      
      if (isErrorCode(error, ErrorCode.NOT_FOUND)) {
        toastError({
          title: '오류',
          message: '할 일을 찾을 수 없습니다.',
        });
      } else if (isErrorCode(error, ErrorCode.VALIDATION_ERROR)) {
        toastError({
          title: '오류',
          message: '입력한 데이터에 오류가 있습니다.',
        });
      } else {
        toastError({
          title: '오류',
          message: errorMessage || '할 일 수정 중 오류가 발생했습니다.',
        });
      }
    },
  });
};

/**
 * Todo 완료 상태 토글 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useToggleTodo = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<ToggleTodoResponse, Error, Omit<ToggleTodoRequest, 'spaceSlug'>>({
    mutationFn: (request) => todosApi.toggleTodo({ ...request, spaceSlug }),
    onSuccess: (data, variables) => {
      // 완료 상태 토글 - 현재 상태를 반전시킴
      todoInvalidateHelpers.updateTodoInLists(queryClient, spaceSlug, variables.todoId, (todo) => ({
        ...todo,
        completedAt: todo.completedAt ? undefined : new Date().toISOString(),
      }));
      
      success({
        title: '성공',
        message: data.message || '할 일 상태가 변경되었습니다.',
      });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      
      if (isErrorCode(error, ErrorCode.NOT_FOUND)) {
        toastError({
          title: '오류',
          message: '할 일을 찾을 수 없습니다.',
        });
      } else {
        toastError({
          title: '오류',
          message: errorMessage || '할 일 상태 변경 중 오류가 발생했습니다.',
        });
      }
    },
  });
};

/**
 * Todo 삭제 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useDeleteTodo = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<DeleteTodoResponse, Error, Omit<DeleteTodoRequest, 'spaceSlug'>>({
    mutationFn: (request) => todosApi.deleteTodo({ ...request, spaceSlug }),
    onSuccess: (data, variables) => {
      // 삭제된 Todo를 캐시에서 제거
      todoInvalidateHelpers.removeTodoFromCache(queryClient, spaceSlug, variables.todoId);
      
      success({
        title: '성공',
        message: '할 일이 삭제되었습니다.',
      });
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      
      if (isErrorCode(error, ErrorCode.NOT_FOUND)) {
        toastError({
          title: '오류',
          message: '할 일을 찾을 수 없습니다.',
        });
      } else {
        toastError({
          title: '오류',
          message: errorMessage || '할 일 삭제 중 오류가 발생했습니다.',
        });
      }
    },
  });
};