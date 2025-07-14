import { isTemporaryId } from '@/features/todo/utils/todoConverters';
import { todosApi } from '@/shared/lib/api/todos';
import { ErrorCode } from '@/shared/types/api';
import type {
  BulkUpdateTodosRequest,
  BulkUpdateTodosResponse,
  CreateTodosRequest,
  CreateTodosResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetTodosRequest,
  GetTodosResponse,
  Todo,
  ToggleTodoRequest,
  ToggleTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
} from '@/shared/types/todo';
import { formatDateToAPIString, getErrorMessage, isErrorCode } from '@/shared/utils';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useToast } from '../useToast';
import { todoInvalidateHelpers, todosKeys } from './todosKeys';

interface UseTodosOptions {
  spaceSlug: string;
  date: string; // YYYY-MM-DD 형식
  userId?: string; // 특정 사용자의 Todo 조회
  enabled?: boolean;
}

/**
 * Todo 목록을 가져오는 React Query 훅
 * @param options 쿼리 옵션
 * @returns React Query 결과
 */
export const useTodos = (options: UseTodosOptions) => {
  const { spaceSlug, date, userId, enabled = true } = options;

  const queryParams: GetTodosRequest = {
    spaceSlug,
    date,
    userId,
  };

  return useQuery<GetTodosResponse, Error>({
    queryKey: todosKeys.byDate(spaceSlug, date, userId),
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
    mutationFn: request => todosApi.createTodos({ ...request, spaceSlug }),
    onSuccess: data => {
      // 스페이스의 모든 Todo 캐시 무효화
      todoInvalidateHelpers.invalidateSpaceTodos(queryClient, spaceSlug);

      success({
        title: '성공',
        message: data.message || '할 일이 생성되었습니다.',
      });
    },
    onError: error => {
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
    mutationFn: request => todosApi.updateTodo({ ...request, spaceSlug }),
    onSuccess: (data, variables) => {
      // 해당 Todo만 캐시에서 업데이트
      todoInvalidateHelpers.updateTodoInLists(queryClient, spaceSlug, variables.todoId, todo => ({
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
    onError: error => {
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
  const { error: toastError } = useToast();

  return useMutation<
    ToggleTodoResponse,
    Error,
    Omit<ToggleTodoRequest, 'spaceSlug'>,
    { previousData: any }
  >({
    mutationFn: request => todosApi.toggleTodo({ ...request, spaceSlug }),

    // Optimistic Update: 서버 요청 전에 UI를 먼저 업데이트
    onMutate: async ({ todoId }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: todosKeys.bySpace(spaceSlug) });

      // 현재 캐시된 모든 데이터 백업 (롤백용)
      const previousData = queryClient.getQueriesData({
        queryKey: todosKeys.bySpace(spaceSlug),
        exact: false,
      });

      // 캐시 데이터 낙관적 업데이트 (날짜별 쿼리 포함)
      queryClient.setQueriesData(
        { queryKey: todosKeys.bySpace(spaceSlug), exact: false },
        (oldData: any) => {
          if (!oldData) return oldData;

          // GetTodosResponse 형태: { todos: Todo[] }
          if (oldData.todos) {
            return {
              ...oldData,
              todos: updateTodosRecursively(oldData.todos, todoId),
            };
          }

          return oldData;
        }
      );

      return { previousData };
    },

    // 에러 발생 시: 백업 데이터로 롤백
    onError: (error, _variables, context) => {
      const errorMessage = getErrorMessage(error);

      // 백업 데이터가 있으면 롤백
      if (context?.previousData) {
        (context.previousData as any[]).forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }

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

    // 성공/실패와 관계없이 관련 쿼리 리페치
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.bySpace(spaceSlug) });
    },
  });
};

// 헬퍼 함수: Todo 배열을 재귀적으로 업데이트
function updateTodosRecursively(todos: Todo[], targetId: string): Todo[] {
  return todos.map(todo => {
    if (todo.id === targetId) {
      return {
        ...todo,
        completedAt: todo.completedAt ? undefined : new Date().toISOString(),
      };
    }

    if (todo.children && todo.children.length > 0) {
      return {
        ...todo,
        children: updateTodosRecursively(todo.children, targetId),
      };
    }

    return todo;
  });
}

/**
 * Todo 삭제 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useDeleteTodo = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<DeleteTodoResponse, Error, Omit<DeleteTodoRequest, 'spaceSlug'>>({
    mutationFn: request => todosApi.deleteTodo({ ...request, spaceSlug }),
    onSuccess: (_, variables) => {
      // 삭제된 Todo를 캐시에서 제거
      todoInvalidateHelpers.removeTodoFromCache(queryClient, spaceSlug, variables.todoId);

      success({
        title: '성공',
        message: '할 일이 삭제되었습니다.',
      });
    },
    onError: error => {
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

/**
 * Todo 일괄 업데이트 mutation 훅
 * @param spaceSlug 스페이스 슬러그
 * @returns React Query mutation 결과
 */
export const useBulkUpdateTodos = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation<BulkUpdateTodosResponse, Error, Omit<BulkUpdateTodosRequest, 'spaceSlug'>>({
    mutationFn: request => todosApi.bulkUpdateTodos({ ...request, spaceSlug }),
    onSuccess: data => {
      // 스페이스의 모든 Todo 캐시 무효화
      todoInvalidateHelpers.invalidateSpaceTodos(queryClient, spaceSlug);

      const { created, updated, deleted } = data.result;
      let message = '할 일이 일괄 업데이트되었습니다.';

      if (created > 0 || updated > 0 || deleted > 0) {
        const parts = [];
        if (created > 0) parts.push(`생성 ${created}개`);
        if (updated > 0) parts.push(`수정 ${updated}개`);
        if (deleted > 0) parts.push(`삭제 ${deleted}개`);
        message = `할 일 ${parts.join(', ')} 완료`;
      }

      success({
        title: '성공',
        message,
      });
    },
    onError: error => {
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
          message: errorMessage || '할 일 일괄 업데이트 중 오류가 발생했습니다.',
        });
      }
    },
  });
};

/**
 * 투두 저장을 위한 공통 훅
 * CheckInWriteModal과 PostContent에서 공통으로 사용
 */
export const useSaveTodos = (spaceSlug: string) => {
  const { mutate: bulkUpdateTodos, isPending: isSaving } = useBulkUpdateTodos(spaceSlug);

  const saveTodos = useCallback(
    async (scheduledDate: string, todos: Todo[]): Promise<void> => {
      // 빈 투두 배열도 API에 전송하여 삭제 처리가 가능하도록 함
      return new Promise<void>((resolve, reject) => {
        bulkUpdateTodos(
          {
            scheduledDate,
            todos: todos.map(todo => ({
              id: !isTemporaryId(todo.id) ? todo.id : undefined, // 임시 ID는 undefined로 처리
              name: todo.name,
              description: todo.description,
              scheduledDate: todo.scheduledDate
                ? formatDateToAPIString(new Date(todo.scheduledDate))
                : undefined,
              order: todo.order,
              thirdpartyUrl: todo.thirdpartyUrl,
              parentId: todo.parentId,
              originTodoId: todo.originTodoId,
              completedAt: todo.completedAt,
            })),
          },
          {
            onSuccess: () => resolve(),
            onError: error => reject(error),
          }
        );
      });
    },
    [bulkUpdateTodos]
  );

  return {
    saveTodos,
    isSaving,
  };
};
