import { useCallback } from 'react';
import type { Todo } from '@/features/todo/types';
import { useToggleTodo, useTodos } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import { formatDateToAPIString } from '@/shared/utils';

export const useCheckOutTodos = (spaceSlug: string) => {
  const { selectedDate } = useDateStore();
  const todayDateString = formatDateToAPIString(selectedDate);
  
  // 오늘 Todo 조회
  const { data: todayData, isLoading } = useTodos({
    spaceSlug,
    date: todayDateString,
    enabled: !!spaceSlug,
  });
  
  // Todo 토글 함수
  const { mutate: toggleTodo } = useToggleTodo(spaceSlug);
  
  const handleToggleTodo = useCallback((todoId: string) => {
    // API 호출 (optimistic update는 useToggleTodo에서 처리)
    toggleTodo({ todoId });
  }, [toggleTodo]);
  
  // 실제 Todo 데이터를 가져오는 헬퍼 함수
  const getTodoData = useCallback((todoId: string): Todo | undefined => {
    if (!todayData?.todos) return undefined;
    
    const findTodoById = (todos: Todo[], id: string): Todo | undefined => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        const found = findTodoById(todo.children, id);
        if (found) return found;
      }
      return undefined;
    };
    
    return findTodoById(todayData.todos, todoId);
  }, [todayData]);
  
  return {
    isLoading,
    handleToggleTodo,
    todayData: todayData?.todos || [],
    getTodoData,
  };
};