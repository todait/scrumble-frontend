import { useCallback } from 'react';

interface UseTodoItemHandlersProps {
  todoId: string;
  mode: 'view' | 'edit';
  isEditing: boolean;
  isEditable: boolean;
  isSelectDisabled: boolean;
  onToggleComplete: (todoId: string) => void;
  onToggleSelect?: (todoId: string) => void;
  onShiftSelectRange?: (todoId: string) => void;
  onStartEdit?: (todoId: string) => void;
  onDeleteTodo?: (todoId: string) => void;
}

export function useTodoItemHandlers({
  todoId,
  mode,
  isEditing,
  isEditable,
  isSelectDisabled,
  onToggleComplete,
  onToggleSelect,
  onShiftSelectRange,
  onStartEdit,
  onDeleteTodo,
}: UseTodoItemHandlersProps) {
  const handleItemClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // 체크박스나 삭제 버튼 클릭은 제외
      if (target.closest('[data-checkbox]') || target.closest('[data-delete-button]')) {
        return;
      }

      // Shift 클릭 시 텍스트 선택 방지
      if (e.shiftKey) {
        e.preventDefault();
      }

      // 편집 모드이고 편집 중이 아니며 수정 가능한 경우 - 편집 모드 진입
      if (mode === 'edit' && !isEditing && isEditable) {
        onStartEdit?.(todoId);
      }
      // 선택 기능이 있고 비활성화되지 않은 경우 - 선택/해제 토글
      else if (onToggleSelect && !isSelectDisabled) {
        if (e.shiftKey) {
          // Shift + 클릭: 범위 선택
          onShiftSelectRange?.(todoId);
        } else {
          // 일반 클릭: 단일 선택/해제
          onToggleSelect(todoId);
        }
      }
    },
    [mode, isEditing, isEditable, isSelectDisabled, todoId, onStartEdit, onToggleSelect, onShiftSelectRange]
  );

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isEditable) {
        onToggleComplete(todoId);
      }
    },
    [isEditable, todoId, onToggleComplete]
  );

  const handleSelectClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.shiftKey && onShiftSelectRange) {
        // Shift + 체크박스 클릭: 범위 선택
        onShiftSelectRange(todoId);
      } else {
        // 일반 체크박스 클릭: 단일 선택/해제
        onToggleSelect?.(todoId);
      }
    },
    [todoId, onToggleSelect, onShiftSelectRange]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteTodo?.(todoId);
    },
    [todoId, onDeleteTodo]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && !e.shiftKey) {
        if (mode === 'edit' && !isEditing && isEditable) {
          e.preventDefault();
          onStartEdit?.(todoId);
        }
      }
    },
    [mode, isEditing, isEditable, todoId, onStartEdit]
  );

  return {
    handleItemClick,
    handleCheckboxClick,
    handleSelectClick,
    handleDeleteClick,
    handleKeyDown,
  };
}