import { useCallback, useState } from 'react';
import { formatDateToAPIString } from '@/shared/utils';
import { Todo } from '../types';
import { calculateNewOrder, generateTodoId, isValidTodoText, normalizeOrders } from '../utils';

interface UseTodoListLogicProps {
  todos: Todo[];
  isEditable: boolean;
  onUpdate: (todos: Todo[]) => void;
}

export function useTodoListLogic({ todos, isEditable, onUpdate }: UseTodoListLogicProps) {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);

  // todos를 order에 따라 정렬
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

  // TodoInput에서 텍스트를 받아서 Todo 생성
  const addTodoFromInput = useCallback(
    (text: string, continueInserting = false) => {
      if (!isEditable || !text.trim()) return;

      let newOrder: number;

      if (insertAfterId === null) {
        // 하단에 추가
        newOrder =
          todos.length === 0 ? 10 : calculateNewOrder(todos, todos[todos.length - 1]?.id);
      } else {
        // 중간에 추가 - 정렬되지 않은 todos 배열 전달
        newOrder = calculateNewOrder(todos, insertAfterId);
      }

      const newTodo: Todo = {
        id: generateTodoId(),
        name: text.trim(),
        description: undefined,
        scheduledDate: formatDateToAPIString(new Date()),
        order: newOrder,
        thirdpartyUrl: undefined,
        parentId: undefined,
        originTodoId: null,
        depth: 0,
        completedAt: undefined,
        children: [],
      };

      const updatedTodos = [...todos, newTodo];

      // 항상 order를 정규화하여 일관된 순서 유지
      onUpdate(normalizeOrders(updatedTodos));

      // 삽입 위치 상태 관리
      if (insertAfterId === null) {
        // 맨 아래 TodoInput: 항상 insertAfterId를 null로 유지 (하단 추가)
        setInsertAfterId(null);
      } else if (continueInserting) {
        // 중간 삽입 + Shift+Enter: 새로 추가된 Todo 아래에 계속 삽입
        setInsertAfterId(newTodo.id);
      } else {
        // 중간 삽입 + Enter/Blur: 중간 삽입 해제하고 새로 추가된 Todo에 포커스
        setInsertAfterId(null);
        setIsInputFocused(false);
        setFocusedTodoId(newTodo.id);
      }
    },
    [isEditable, todos, onUpdate, insertAfterId]
  );

  // 중간 삽입을 위한 핸들러
  const handleInsertTodo = useCallback((afterTodoId: string) => {
    setInsertAfterId(afterTodoId);
    setIsInputFocused(true);
    setFocusedTodoId(null); // 다른 Todo 포커스 해제
  }, []);

  const handleDeleteTodo = useCallback(
    (todoId: string, enterEditMode = false) => {
      // 삭제할 Todo의 인덱스 찾기
      const todoIndex = sortedTodos.findIndex(todo => todo.id === todoId);

      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      onUpdate(updatedTodos);

      // 삭제 후 포커스 이동 및 편집 모드 진입
      let targetTodoId: string | null = null;

      if (todoIndex > 0) {
        // 이전 Todo로 포커스 이동
        targetTodoId = sortedTodos[todoIndex - 1].id;
      } else if (sortedTodos.length > 1) {
        // 첫 번째 Todo를 삭제한 경우, 다음 Todo로 포커스 이동
        targetTodoId = sortedTodos[1].id;
      }

      if (targetTodoId) {
        setFocusedTodoId(targetTodoId);
        if (enterEditMode) {
          // 약간의 지연 후 편집 모드 진입
          setTimeout(() => {
            if (targetTodoId) {
              setEditingTodoId(targetTodoId);
            }
          }, 50);
        }
      } else {
        // 마지막 Todo를 삭제한 경우, 포커스 초기화
        setFocusedTodoId(null);
      }

      if (editingTodoId === todoId) {
        setEditingTodoId(null);
      }
    },
    [todos, onUpdate, sortedTodos, editingTodoId]
  );

  const moveFocus = useCallback(
    (direction: 'up' | 'down') => {
      if (!focusedTodoId && !isInputFocused) return;

      // TodoInput이 포커스된 경우 별도 처리
      const currentIndex = isInputFocused
        ? sortedTodos.length // TodoInput은 마지막 인덱스로 간주
        : sortedTodos.findIndex(todo => todo.id === focusedTodoId);
      if (currentIndex === -1) return;

      let nextIndex;
      const totalItems = sortedTodos.length + 1; // TodoInput 포함

      if (direction === 'up') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      } else {
        nextIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      }

      // nextIndex 가 마지막이면 TodoInput, 아니면 실제 todo ID
      if (nextIndex === sortedTodos.length) {
        setIsInputFocused(true);
        setFocusedTodoId(null);
        setInsertAfterId(null); // 하단 TodoInput으로 이동 시 중간 삽입 해제
      } else {
        setIsInputFocused(false);
        setFocusedTodoId(sortedTodos[nextIndex].id);
        setInsertAfterId(null); // TodoItem으로 이동 시 중간 삽입 해제
      }
    },
    [focusedTodoId, isInputFocused, sortedTodos]
  );

  const handleStartEdit = useCallback((todoId: string) => {
    setEditingTodoId(todoId);
    setFocusedTodoId(todoId);
    setIsInputFocused(false); // TodoInput 포커스 해제
    setInsertAfterId(null); // 중간 삽입 해제
  }, []);

  const handleFinishEdit = useCallback((_todoId: string) => {
    setEditingTodoId(null);
  }, []);

  const handleTextChange = useCallback(
    (todoId: string, newText: string) => {
      if (!isValidTodoText(newText)) return;

      const updatedTodos = todos.map(todo =>
        todo.id === todoId ? { ...todo, name: newText } : todo
      );
      onUpdate(updatedTodos);
    },
    [todos, onUpdate]
  );

  // TodoInput 관련 핸들러들
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
    setFocusedTodoId(null); // 다른 Todo 포커스 해제
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    // 중간 삽입이 취소되면 insertAfterId 초기화
    if (insertAfterId !== null) {
      setInsertAfterId(null);
    }
  }, [insertAfterId]);

  return {
    // State
    editingTodoId,
    focusedTodoId,
    isInputFocused,
    insertAfterId,
    sortedTodos,

    // Setters
    setEditingTodoId,
    setFocusedTodoId,
    setIsInputFocused,
    setInsertAfterId,

    // Handlers
    addTodoFromInput,
    handleInsertTodo,
    handleDeleteTodo,
    moveFocus,
    handleStartEdit,
    handleFinishEdit,
    handleTextChange,
    handleInputFocus,
    handleInputBlur,
  };
}