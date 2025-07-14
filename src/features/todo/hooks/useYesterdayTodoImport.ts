import { useCallback, useEffect, useMemo, useState } from 'react';
import { Todo } from '../types';
import { copyTodosForToday, normalizeOrders } from '../utils';

interface UseYesterdayTodoImportParams {
  todayTodos: Todo[];
  onUpdateTodayTodos: (
    newTodos: Todo[],
    nameChangedTodoIds?: string[]
  ) => void;
  initialTodoIdMapping?: Map<string, string>;
}

interface UseYesterdayTodoImportReturn {
  todoIdMapping: Map<string, string>;
  broughtTodoIds: Set<string>;
  selectedYesterdayIds: string[];
  setSelectedYesterdayIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleBringToToday: (selectedTodos: Todo[]) => void;
  updateTodoMappingOnChange: (newTodos: Todo[]) => void;
}

export function useYesterdayTodoImport({
  todayTodos,
  onUpdateTodayTodos,
  initialTodoIdMapping,
}: UseYesterdayTodoImportParams): UseYesterdayTodoImportReturn {
  // 새 ID -> 원본 ID 매핑
  const [todoIdMapping, setTodoIdMapping] = useState<Map<string, string>>(() => {
    const initialMapping = initialTodoIdMapping || new Map();
    return initialMapping;
  });

  // broughtTodoIds를 동적으로 계산 (todoIdMapping만 사용)
  const broughtTodoIds = useMemo(() => {
    // todoIdMapping의 값들(어제 투두 ID들)만 사용
    return new Set(Array.from(todoIdMapping.values()));
  }, [todoIdMapping]);

  // selectedYesterdayIds를 broughtTodoIds로 초기화
  const [selectedYesterdayIds, setSelectedYesterdayIds] = useState<string[]>(() =>
    Array.from(broughtTodoIds)
  );

  // broughtTodoIds 변경 시 제거된 항목만 selectedYesterdayIds에서 제거
  useEffect(() => {
    setSelectedYesterdayIds(prev => {
      // 현재 선택된 항목 중 broughtTodoIds에 있는 항목 유지
      const stillBrought = prev.filter(id => broughtTodoIds.has(id));
      // 새로 추가된 brought 항목들 추가
      const newBrought = Array.from(broughtTodoIds).filter(id => !prev.includes(id));
      const newSelected = [...stillBrought, ...newBrought];
      
      return newSelected;
    });
  }, [broughtTodoIds]);

  // 오늘 투두 업데이트 시 매핑 관리
  const updateTodoMappingOnChange = useCallback(
    (newTodos: Todo[]) => {
      // 삭제된 Todo 찾기
      const currentTodoIds = new Set(todayTodos.map(t => t.id));
      const newTodoIds = new Set(newTodos.map(t => t.id));
      const deletedTodoIds = Array.from(currentTodoIds).filter(id => !newTodoIds.has(id));

      // 이름이 변경된 Todo 찾기 (매핑 끊기 위해)
      const nameChangedTodos = newTodos.filter(newTodo => {
        const originalTodo = todayTodos.find(t => t.id === newTodo.id);
        return originalTodo && originalTodo.name !== newTodo.name && todoIdMapping.has(newTodo.id);
      });

      // 삭제된 Todo의 원본 ID 찾아서 todoIdMapping에서 제거
      deletedTodoIds.forEach(deletedId => {
        const originalId = todoIdMapping.get(deletedId);
        if (originalId) {
          setTodoIdMapping(prev => {
            const newMapping = new Map(prev);
            newMapping.delete(deletedId);
            return newMapping;
          });
        }
      });

      // 이름이 변경된 Todo의 매핑 제거
      nameChangedTodos.forEach(todo => {
        setTodoIdMapping(prev => {
          const newMapping = new Map(prev);
          newMapping.delete(todo.id);
          return newMapping;
        });
      });

      onUpdateTodayTodos(newTodos, nameChangedTodos.map(todo => todo.id));
    },
    [todayTodos, todoIdMapping, onUpdateTodayTodos]
  );

  // 어제의 투두를 오늘로 가져오기
  const handleBringToToday = useCallback(
    (selectedTodos: Todo[]) => {
      // 이미 가져온 Todo 필터링
      const todosToImport = selectedTodos.filter(todo => !broughtTodoIds.has(todo.id));

      if (todosToImport.length === 0) {
        // 모든 선택된 항목이 이미 가져와진 경우
        alert('선택한 항목들은 이미 가져왔습니다.');
        return;
      }

      const copiedTodos = copyTodosForToday(
        todosToImport,
        todosToImport.map(t => t.id)
      );

      // 기존 오늘 투두와 합치기
      const maxOrder = todayTodos.length > 0 ? Math.max(...todayTodos.map(t => t.order)) : 0;

      const todosWithNewOrder = copiedTodos.map((todo, index) => ({
        ...todo,
        order: maxOrder + (index + 1) * 10,
      }));

      const updatedTodayTodos = [...todayTodos, ...todosWithNewOrder];
      onUpdateTodayTodos(normalizeOrders(updatedTodayTodos));

      // 새 ID -> 원본 ID 매핑 저장
      setTodoIdMapping(prev => {
        const newMapping = new Map(prev);
        todosWithNewOrder.forEach((newTodo, index) => {
          newMapping.set(newTodo.id, todosToImport[index].id);
        });
        return newMapping;
      });

      // 선택된 항목은 계속 체크 상태 유지 (ID 유지)
    },
    [todayTodos, onUpdateTodayTodos, broughtTodoIds]
  );

  return {
    todoIdMapping,
    broughtTodoIds,
    selectedYesterdayIds,
    setSelectedYesterdayIds,
    handleBringToToday,
    updateTodoMappingOnChange,
  };
}