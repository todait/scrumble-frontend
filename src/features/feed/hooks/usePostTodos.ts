import { useCallback } from 'react';
import { useTodos, useToggleTodo } from '@/shared/hooks/queries';
import { formatDateToAPIString } from '@/shared/utils';
import type { Todo } from '@/features/todo';
import { usePostTodoStore } from '../stores/usePostTodoStore';

interface UsePostTodosProps {
  spaceSlug: string;
  postDate: Date;
  userId?: string; // 포스트 작성자의 ID
  enabled: boolean;
}

export function usePostTodos({ spaceSlug, postDate, userId, enabled }: UsePostTodosProps) {
  const dateString = formatDateToAPIString(postDate);
  
  // Zustand store 사용 (편집 모드에서만)
  const { 
    todos: storeTodos, 
    isEditMode, 
    setTodos, 
    updateTodo 
  } = usePostTodoStore();

  // Lazy loading: Collapse가 열릴 때만 쿼리 실행
  const { data, isLoading } = useTodos({
    spaceSlug,
    date: dateString,
    userId, // 특정 사용자의 Todo 조회
    enabled,
  });

  // View 모드에서는 React Query 데이터 직접 사용
  // Edit 모드에서만 zustand store 데이터 사용
  const todos = isEditMode ? storeTodos : (data?.todos || []);

  // Todo 토글 함수
  const { mutate: toggleTodo } = useToggleTodo(spaceSlug);

  const handleToggleComplete = useCallback((todoId: string) => {
    // 편집 모드일 때는 로컬 상태만 업데이트
    if (isEditMode) {
      const todo = storeTodos.find(t => t.id === todoId);
      if (todo) {
        updateTodo(todoId, {
          completedAt: todo.completedAt ? undefined : new Date().toISOString()
        });
      }
    } else {
      // 일반 모드일 때는 API 호출 (optimistic update는 useToggleTodo에서 처리)
      toggleTodo({ todoId });
    }
  }, [isEditMode, storeTodos, updateTodo, toggleTodo]);

  const handleUpdateTodos = useCallback((updatedTodos: Todo[]) => {
    // 편집 모드에서 todos 업데이트
    setTodos(updatedTodos);
  }, [setTodos]);

  return {
    todos, // 편집 모드 여부에 따라 다른 소스
    isLoading,
    handleToggleComplete,
    handleUpdateTodos,
  };
}