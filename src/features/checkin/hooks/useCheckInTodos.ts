import { useCallback, useEffect } from 'react';
import type { Todo } from '@/features/todo/types';
import { isTemporaryId } from '@/features/todo/utils/todoConverters';
import { useTodos, useBulkUpdateTodos } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import { formatDateToAPIString } from '@/shared/utils';
import { useCheckInTodoStore } from '../stores/useCheckInTodoStore';

export const useCheckInTodos = (spaceSlug: string, mode: 'new' | 'edit' = 'new') => {
  const { selectedDate } = useDateStore();
  const { setYesterdayTodos, setTodayTodos } = useCheckInTodoStore();
  
  // 어제 날짜 계산
  const yesterdayDate = new Date(selectedDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDateString = formatDateToAPIString(yesterdayDate);
  const todayDateString = formatDateToAPIString(selectedDate);
  
  // 어제 Todo 조회
  const { data: yesterdayData, isLoading: isLoadingYesterday } = useTodos({
    spaceSlug,
    date: yesterdayDateString,
    enabled: !!spaceSlug,
  });
  
  // 오늘 Todo 조회
  const { data: todayData, isLoading: isLoadingToday } = useTodos({
    spaceSlug,
    date: todayDateString,
    enabled: !!spaceSlug,
  });
  
  // 어제 Todo 데이터를 store에 동기화 (draft 형태로 간소화)
  useEffect(() => {
    if (yesterdayData?.todos) {
      const drafts = yesterdayData.todos.map(todo => ({
        id: todo.id,
        text: todo.name,
        completed: !!todo.completedAt,
        originTodoId: todo.originTodoId,
      }));
      setYesterdayTodos(drafts);
    }
  }, [yesterdayData, setYesterdayTodos]);
  
  // 오늘 Todo 데이터를 store에 동기화 (draft 형태로 간소화)
  useEffect(() => {
    if (todayData?.todos) {
      const drafts = todayData.todos.map(todo => ({
        id: todo.id, // 실제 서버 ID 유지
        text: todo.name,
        completed: !!todo.completedAt,
        originTodoId: todo.originTodoId,
      }));
      setTodayTodos(drafts);
    }
  }, [todayData, setTodayTodos]);
  
  // Todo 저장 함수
  const { mutate: bulkUpdateTodos, isPending: isSaving } = useBulkUpdateTodos(spaceSlug);
  
  const saveTodos = useCallback(async (todosWithOrigin: Map<string, Todo>) => {
    // new 모드에서만 처리
    if (mode !== 'new') {
      console.warn('Edit mode is not supported yet');
      return Promise.resolve();
    }
    
    // todosWithOrigin Map에서 Todo 목록 추출
    const todos = Array.from(todosWithOrigin.values());
    
    // 새로 생성된 Todo와 기존 Todo 분리
    const newTodos = todos.filter(todo => isTemporaryId(todo.id));
    const existingTodos = todos.filter(todo => !isTemporaryId(todo.id));
    
    // 기존 Todo가 있으면 일괄 업데이트 API 사용
    if (existingTodos.length > 0 || newTodos.length > 0) {
      return new Promise((resolve, reject) => {
        bulkUpdateTodos(
          {
            scheduledDate: todayDateString,
            todos: todos.map(todo => ({
              id: !isTemporaryId(todo.id) ? todo.id : undefined, // 기존 Todo는 ID 포함, 새 Todo는 ID 없음
              name: todo.name,
              description: todo.description,
              scheduledDate: todo.scheduledDate,
              order: todo.order,
              thirdpartyUrl: todo.thirdpartyUrl,
              parentId: todo.parentId,
              originTodoIdIsNil: !todo.originTodoId,
            })),
          },
          {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error),
          }
        );
      });
    }
    
    // Todo가 없으면 처리하지 않음
    return Promise.resolve();
  }, [mode, bulkUpdateTodos, todayDateString]);
  
  // 어제 Todo를 오늘로 가져오는 헬퍼 함수
  const getYesterdayTodoData = useCallback((todoId: string): Todo | undefined => {
    if (!yesterdayData?.todos) return undefined;
    
    // yesterdayData.todos에서 해당 ID의 Todo 찾기
    const findTodoById = (todos: Todo[], id: string): Todo | undefined => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        const found = findTodoById(todo.children, id);
        if (found) return found;
      }
      return undefined;
    };
    
    return findTodoById(yesterdayData.todos, todoId);
  }, [yesterdayData]);
  
  return {
    isLoadingYesterday,
    isLoadingToday,
    saveTodos,
    isSaving,
    getYesterdayTodoData,
    todayDateString,
  };
};