import type { Todo } from '@/features/todo/types';
import { useSaveTodos, useTodos } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import { formatDateToAPIString } from '@/shared/utils';
import { useCallback, useEffect } from 'react';
import { useCheckInTodoStore } from '../stores/useCheckInTodoStore';

export const useCheckInTodos = (mode: 'new' | 'edit' = 'new') => {
  const { selectedDate } = useDateStore();
  const { setYesterdayTodos, setTodayTodos } = useCheckInTodoStore();

  // 어제 날짜 계산
  const yesterdayDate = new Date(selectedDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDateString = formatDateToAPIString(yesterdayDate);
  const todayDateString = formatDateToAPIString(selectedDate);

  // 어제 Todo 조회
  const { data: yesterdayData, isLoading: isLoadingYesterday } = useTodos({
    date: yesterdayDateString,
    enabled: true,
  });

  // 오늘 Todo 조회
  const { data: todayData, isLoading: isLoadingToday } = useTodos({
    date: todayDateString,
    enabled: true,
  });

  // 어제 Todo 데이터를 store에 동기화
  useEffect(() => {
    if (yesterdayData?.todos) {
      setYesterdayTodos(yesterdayData.todos);
    }
  }, [yesterdayData, setYesterdayTodos]);

  // 오늘 Todo 데이터를 store에 동기화
  useEffect(() => {
    if (todayData?.todos) {
      setTodayTodos(todayData.todos);
    }
  }, [todayData, setTodayTodos]);

  // 공통 Todo 저장 훅 사용
  const { saveTodos: saveTodosApi, isSaving } = useSaveTodos();

  const saveTodos = useCallback(
    async (todosWithOrigin: Map<string, Todo>) => {
      // new 모드에서만 처리
      if (mode !== 'new') {
        console.warn('Edit mode is not supported yet');
        return Promise.resolve();
      }

      // todosWithOrigin Map에서 Todo 목록 추출
      const todos = Array.from(todosWithOrigin.values());

      // 공통 저장 함수 사용
      return saveTodosApi(todayDateString, todos);
    },
    [mode, saveTodosApi, todayDateString]
  );

  // 어제 Todo를 오늘로 가져오는 헬퍼 함수
  const getYesterdayTodoData = useCallback(
    (todoId: string): Todo | undefined => {
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
    },
    [yesterdayData]
  );

  return {
    isLoadingYesterday,
    isLoadingToday,
    saveTodos,
    isSaving,
    getYesterdayTodoData,
    todayDateString,
  };
};
