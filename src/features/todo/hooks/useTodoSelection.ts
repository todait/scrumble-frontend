import { useState, useCallback } from 'react';
import type { Todo } from '../types';
import { calculateSelectionStats, getSelectionHeaderText } from '../utils';

interface UseTodoSelectionProps {
  todos: Todo[];
  selectedIds: string[];
  disabledIds: Set<string>;
  onSelectionChange?: (ids: string[]) => void;
  onBringToToday?: (todos: Todo[]) => void;
}

export function useTodoSelection({
  todos,
  selectedIds,
  disabledIds,
  onSelectionChange,
  onBringToToday,
}: UseTodoSelectionProps) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // 선택 토글
  const handleToggleSelect = useCallback(
    (todoId: string) => {
      if (!onSelectionChange) return;

      // 이미 가져온 항목은 선택 불가
      if (disabledIds.has(todoId)) return;

      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      const newSelectedIds = selectedIds.includes(todoId)
        ? selectedIds.filter(id => id !== todoId)
        : [...selectedIds, todoId];

      onSelectionChange(newSelectedIds);
      setLastSelectedIndex(todoIndex);
    },
    [selectedIds, onSelectionChange, disabledIds, todos]
  );

  // Shift + 클릭 범위 선택
  const handleShiftSelectRange = useCallback(
    (todoId: string) => {
      if (!onSelectionChange || disabledIds.has(todoId)) return;

      const currentIndex = todos.findIndex(todo => todo.id === todoId);
      if (currentIndex === -1) return;

      if (lastSelectedIndex === null) {
        // 이전 선택이 없으면 현재 클릭한 아이템만 선택
        const newSelectedIds = [...selectedIds, todoId];
        onSelectionChange(newSelectedIds);
        setLastSelectedIndex(currentIndex);
        return;
      }

      // 범위 계산
      const startIndex = Math.min(lastSelectedIndex, currentIndex);
      const endIndex = Math.max(lastSelectedIndex, currentIndex);

      // 범위 내 선택 가능한 모든 항목 ID 수집
      const rangeIds = todos
        .slice(startIndex, endIndex + 1)
        .filter(todo => !disabledIds.has(todo.id))
        .map(todo => todo.id);

      // 클릭한 아이템이 범위에 포함되어 있는지 확인하고 강제로 추가
      if (!rangeIds.includes(todoId) && !disabledIds.has(todoId)) {
        rangeIds.push(todoId);
      }

      // 기존 선택에 범위 항목 추가 (중복 제거)
      const newSelectedIds = [...new Set([...selectedIds, ...rangeIds])];

      onSelectionChange(newSelectedIds);
      setLastSelectedIndex(currentIndex);
    },
    [onSelectionChange, disabledIds, todos, lastSelectedIndex, selectedIds]
  );

  // 가져오기 처리
  const handleBringToToday = useCallback(() => {
    if (!onBringToToday) return;

    const selectedTodos = todos.filter(
      todo => selectedIds.includes(todo.id) && !disabledIds.has(todo.id)
    );

    if (selectedTodos.length === 0) {
      alert('선택한 항목들은 이미 가져왔습니다.');
      return;
    }

    onBringToToday(selectedTodos);
  }, [todos, selectedIds, disabledIds, onBringToToday]);

  // 선택 통계
  const selectionStats = calculateSelectionStats(todos, selectedIds, disabledIds);

  // 가져오기 버튼 활성화 여부
  const canBringToToday = selectionStats.totalCount > 0 && !!onBringToToday;

  return {
    // 핸들러
    handleToggleSelect,
    handleShiftSelectRange,
    handleBringToToday,

    // 상태 및 계산된 값
    selectionStats,
    canBringToToday,
    
    // 내부 상태 (필요시)
    lastSelectedIndex,
    setLastSelectedIndex,
  };
}