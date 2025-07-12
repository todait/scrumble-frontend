import { useCallback, useEffect } from 'react';

interface UseKeyboardHandlerProps {
  mode: 'view' | 'edit';
  isEditable: boolean;
  editingTodoId: string | null;
  focusedTodoId: string | null;
  isInputFocused: boolean;
  sortedTodos: any[];
  setFocusedTodoId: (id: string | null) => void;
  setIsInputFocused: (focused: boolean) => void;
  setInsertAfterId: (id: string | null) => void;
  handleStartEdit: (todoId: string) => void;
  handleInsertTodo: (afterTodoId: string) => void;
  handleDeleteTodo: (todoId: string) => void;
  moveFocus: (direction: 'up' | 'down') => void;
}

export function useKeyboardHandler({
  mode,
  isEditable,
  editingTodoId,
  focusedTodoId,
  isInputFocused,
  sortedTodos,
  setFocusedTodoId,
  setIsInputFocused,
  setInsertAfterId,
  handleStartEdit,
  handleInsertTodo,
  handleDeleteTodo,
  moveFocus,
}: UseKeyboardHandlerProps) {
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Todo 편집 중일 때는 처리하지 않음
      if (editingTodoId) return;

      // 포커스된 투두가 없고 TodoInput도 포커스되지 않은 경우 키 입력 시 처리
      if (!focusedTodoId && !isInputFocused) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (sortedTodos.length > 0) {
            if (e.key === 'ArrowUp') {
              // ArrowUp: 마지막 Todo에 포커스
              setFocusedTodoId(sortedTodos[sortedTodos.length - 1].id);
            } else {
              // ArrowDown: 첫 번째 Todo에 포커스
              setFocusedTodoId(sortedTodos[0].id);
            }
          } else {
            // Todo가 없으면 TodoInput에 포커스
            setIsInputFocused(true);
          }
        } else if (e.key === 'Enter') {
          // Enter: TodoInput 활성화
          e.preventDefault();
          setIsInputFocused(true);
          setInsertAfterId(null); // 하단 TodoInput으로 포커스
        }
        return;
      }

      // TodoInput 포커스일 때는 방향키만 허용
      if (isInputFocused) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          moveFocus(e.key === 'ArrowUp' ? 'up' : 'down');
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
          if (e.shiftKey) {
            // Shift+Enter: 현재 포커스된 투두 아래에 TodoInput 활성화
            e.preventDefault();
            if (focusedTodoId) {
              handleInsertTodo(focusedTodoId);
            }
          } else {
            // Enter: 편집 모드 진입
            e.preventDefault();
            if (focusedTodoId) {
              handleStartEdit(focusedTodoId);
            }
          }
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          if (focusedTodoId) {
            handleStartEdit(focusedTodoId);
          }
          break;
        case 'Escape':
          if (focusedTodoId && !editingTodoId) {
            // 포커스된 Todo가 있고 편집 중이 아닐 때 포커스 해제
            e.preventDefault();
            e.stopPropagation();
            setFocusedTodoId(null);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus('down');
          break;
        case 'Delete':
          e.preventDefault();
          if (focusedTodoId) {
            handleDeleteTodo(focusedTodoId);
          }
          break;
      }
    },
    [
      editingTodoId,
      focusedTodoId,
      isInputFocused,
      sortedTodos,
      setFocusedTodoId,
      setIsInputFocused,
      setInsertAfterId,
      handleStartEdit,
      handleInsertTodo,
      handleDeleteTodo,
      moveFocus,
    ]
  );

  useEffect(() => {
    if (mode !== 'edit' || !isEditable) return;

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, isEditable, handleGlobalKeyDown]);
}