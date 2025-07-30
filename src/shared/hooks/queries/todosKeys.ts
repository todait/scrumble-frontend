import type { QueryClient } from '@tanstack/react-query';
import type { Todo } from '@/shared/types/todo';

interface TodosFilters {
  date?: string;
  spaceMemberID?: string;
}

export const todosKeys = {
  // 최상위 키 (JWT에서 space 정보 추출)
  all: ['todos'] as const,
  
  // 목록 키
  lists: () => [...todosKeys.all, 'list'] as const,
  list: (filters?: Partial<TodosFilters>) => 
    [...todosKeys.lists(), filters] as const,
  
  // 개별 Todo 키
  details: () => [...todosKeys.all, 'detail'] as const,
  detail: (todoId: string) => 
    [...todosKeys.details(), todoId] as const,
  
  // 날짜별 Todo 키 (spaceMemberID 옵션 추가)
  byDate: (date: string, spaceMemberID?: string) =>
    spaceMemberID 
      ? [...todosKeys.all, 'date', date, 'member', spaceMemberID] as const
      : [...todosKeys.all, 'date', date] as const,
};

// 선택적 무효화 헬퍼 함수들
export const todoInvalidateHelpers = {
  // 특정 Todo의 하위 Todo들 무효화
  invalidateChildTodos: (queryClient: QueryClient, parentTodoId: string) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.all,
      predicate: (query) => {
        const data = query.state.data as { todos: Todo[] } | undefined;
        if (!data?.todos) return false;
        
        const hasChildTodos = data.todos.some(todo => {
          const foundTodo = findTodoById(todo, parentTodoId);
          return foundTodo && foundTodo.children.length > 0;
        });
        
        return hasChildTodos;
      },
    });
  },
  
  // 특정 Todo 데이터만 업데이트 (무효화 없이)
  updateTodoInLists: (
    queryClient: QueryClient, 
    todoId: string, 
    updater: (todo: Todo) => Todo
  ) => {
    queryClient.setQueriesData(
      { queryKey: todosKeys.lists(), exact: false },
      (oldData: { todos: Todo[] } | undefined) => {
        if (!oldData?.todos) return oldData;
        
        return {
          ...oldData,
          todos: oldData.todos.map((todo: Todo) =>
            updateTodoRecursively(todo, todoId, updater)
          ),
        };
      }
    );
  },
  
  // 날짜별 Todo 캐시 무효화
  invalidateDateTodos: (queryClient: QueryClient, date: string, spaceMemberID?: string) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.byDate(date, spaceMemberID),
    });
  },
  
  // 전체 Todo 캐시 무효화
  invalidateAllTodos: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.all,
    });
  },
  
  // Todo 완료 상태 업데이트
  updateTodoCompletion: (
    queryClient: QueryClient,
    todoId: string,
    completedAt: string | undefined
  ) => {
    todoInvalidateHelpers.updateTodoInLists(queryClient, todoId, (todo) => ({
      ...todo,
      completedAt,
    }));
  },
  
  // Todo 삭제 시 캐시에서 제거
  removeTodoFromCache: (
    queryClient: QueryClient,
    todoId: string
  ) => {
    queryClient.setQueriesData(
      { queryKey: todosKeys.lists(), exact: false },
      (oldData: { todos: Todo[] } | undefined) => {
        if (!oldData?.todos) return oldData;
        
        return {
          ...oldData,
          todos: oldData.todos.filter(todo => !containsTodoId(todo, todoId)),
        };
      }
    );
  },
};

// 헬퍼 함수들
function findTodoById(todo: Todo, todoId: string): Todo | null {
  if (todo.id === todoId) return todo;
  
  for (const child of todo.children) {
    const found = findTodoById(child, todoId);
    if (found) return found;
  }
  
  return null;
}

function updateTodoRecursively(todo: Todo, todoId: string, updater: (todo: Todo) => Todo): Todo {
  if (todo.id === todoId) {
    return updater(todo);
  }
  
  return {
    ...todo,
    children: todo.children.map(child => updateTodoRecursively(child, todoId, updater)),
  };
}

function containsTodoId(todo: Todo, todoId: string): boolean {
  if (todo.id === todoId) return true;
  
  return todo.children.some(child => containsTodoId(child, todoId));
}