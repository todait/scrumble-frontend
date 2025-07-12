import type { QueryClient } from '@tanstack/react-query';
import type { Todo } from '@/shared/types/todo';

interface TodosFilters {
  spaceSlug: string;
  date?: string;
}

export const todosKeys = {
  // 최상위 키
  all: ['todos'] as const,
  
  // 스페이스별 키
  bySpace: (spaceSlug: string) => [...todosKeys.all, 'space', spaceSlug] as const,
  
  // 목록 키
  lists: (spaceSlug: string) => [...todosKeys.bySpace(spaceSlug), 'list'] as const,
  list: (spaceSlug: string, filters?: Partial<TodosFilters>) => 
    [...todosKeys.lists(spaceSlug), filters] as const,
  
  // 개별 Todo 키
  details: (spaceSlug: string) => [...todosKeys.bySpace(spaceSlug), 'detail'] as const,
  detail: (spaceSlug: string, todoId: string) => 
    [...todosKeys.details(spaceSlug), todoId] as const,
  
  // 날짜별 Todo 키
  byDate: (spaceSlug: string, date: string) =>
    [...todosKeys.bySpace(spaceSlug), 'date', date] as const,
};

// 선택적 무효화 헬퍼 함수들
export const todoInvalidateHelpers = {
  // 특정 Todo의 하위 Todo들 무효화
  invalidateChildTodos: (queryClient: QueryClient, spaceSlug: string, parentTodoId: string) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.bySpace(spaceSlug),
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
    spaceSlug: string, 
    todoId: string, 
    updater: (todo: Todo) => Todo
  ) => {
    queryClient.setQueriesData(
      { queryKey: todosKeys.lists(spaceSlug), exact: false },
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
  invalidateDateTodos: (queryClient: QueryClient, spaceSlug: string, date: string) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.byDate(spaceSlug, date),
    });
  },
  
  // 스페이스 전체 Todo 캐시 무효화
  invalidateSpaceTodos: (queryClient: QueryClient, spaceSlug: string) => {
    queryClient.invalidateQueries({
      queryKey: todosKeys.bySpace(spaceSlug),
    });
  },
  
  // Todo 완료 상태 업데이트
  updateTodoCompletion: (
    queryClient: QueryClient,
    spaceSlug: string,
    todoId: string,
    completedAt: string | undefined
  ) => {
    todoInvalidateHelpers.updateTodoInLists(queryClient, spaceSlug, todoId, (todo) => ({
      ...todo,
      completedAt,
    }));
  },
  
  // Todo 삭제 시 캐시에서 제거
  removeTodoFromCache: (
    queryClient: QueryClient,
    spaceSlug: string,
    todoId: string
  ) => {
    queryClient.setQueriesData(
      { queryKey: todosKeys.lists(spaceSlug), exact: false },
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