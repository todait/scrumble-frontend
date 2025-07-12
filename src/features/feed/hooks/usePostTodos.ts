import { useCallback } from 'react';
import { useTodos, useToggleTodo } from '@/shared/hooks/queries';
import { formatDateToAPIString } from '@/shared/utils';
import type { Todo } from '@/features/todo';

interface UsePostTodosProps {
  spaceSlug: string;
  postDate: Date;
  enabled: boolean;
}

export function usePostTodos({ spaceSlug, postDate, enabled }: UsePostTodosProps) {
  const dateString = formatDateToAPIString(postDate);

  // Lazy loading: Collapse가 열릴 때만 쿼리 실행
  const { data, isLoading } = useTodos({
    spaceSlug,
    date: dateString,
    enabled,
  });

  // Todo 토글 함수
  const { mutate: toggleTodo } = useToggleTodo(spaceSlug);

  const handleToggleComplete = useCallback((todoId: string) => {
    // API 호출 (optimistic update는 useToggleTodo에서 처리)
    toggleTodo({ todoId });
  }, [toggleTodo]);

  const handleUpdateTodos = useCallback((_updatedTodos: Todo[]) => {
    // React Query가 캐시를 관리하므로 여기서는 아무것도 하지 않음
  }, []);

  return {
    todos: data?.todos || [],
    isLoading,
    handleToggleComplete,
    handleUpdateTodos,
  };
}