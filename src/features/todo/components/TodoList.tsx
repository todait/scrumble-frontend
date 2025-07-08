'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Todo, TodoListProps } from '../types';
import { calculateNewOrder, generateTodoId, isValidTodoText } from '../utils';
import { TodoInput } from './TodoInput';
import { TodoItem } from './TodoItem';

export interface TodoListRef {
  focusInput: () => void;
}

export const TodoList = forwardRef<TodoListRef, TodoListProps>(
  (
    {
      todos,
      isEditable,
      mode,
      onUpdate,
      onToggleComplete,
      selectedIds = [],
      onSelectionChange,
      disabledIds = new Set(),
      broughtFromYesterdayIds = new Set(),
    },
    ref
  ) => {
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null); // 마지막 선택된 항목 인덱스
    const [isInputFocused, setIsInputFocused] = useState(false); // TodoInput 포커스 상태
    const [insertPosition, setInsertPosition] = useState<number | null>(null); // 중간 삽입 위치 (null: 하단, 숫자: 해당 인덱스 뒤)

    // todos를 order에 따라 정렬
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

    // ref를 통해 외부에서 호출 가능한 메서드 노출
    useImperativeHandle(
      ref,
      () => ({
        focusInput: () => {
          setIsInputFocused(true);
          setFocusedTodoId(null);
          setInsertPosition(null);
        },
      }),
      []
    );

    // TodoInput에서 텍스트를 받아서 Todo 생성
    const addTodoFromInput = useCallback(
      (text: string, continueInserting = false) => {
        if (!isEditable || !text.trim()) return;

        let newOrder: number;

        if (insertPosition === null) {
          // 하단에 추가
          newOrder =
            sortedTodos.length === 0
              ? 10
              : calculateNewOrder(sortedTodos, sortedTodos[sortedTodos.length - 1].id);
        } else {
          // 중간에 추가
          const afterTodoId = sortedTodos[insertPosition].id;
          newOrder = calculateNewOrder(sortedTodos, afterTodoId);
        }

        const newTodo: Todo = {
          id: generateTodoId(),
          text: text.trim(),
          completedAt: null,
          date: new Date(),
          order: newOrder,
        };

        const updatedTodos = [...todos, newTodo];
        onUpdate(updatedTodos);

        // 삽입 위치 상태 관리
        if (insertPosition === null) {
          // 맨 아래 TodoInput: 항상 insertPosition을 null로 유지 (하단 추가)
          setInsertPosition(null);
        } else if (continueInserting) {
          // 중간 삽입 + Shift+Enter: 새로 추가된 Todo 아래에 계속 삽입
          setInsertPosition(insertPosition + 1);
        } else {
          // 중간 삽입 + Enter/Blur: 중간 삽입 해제
          setInsertPosition(null);
        }
      },
      [isEditable, sortedTodos, todos, onUpdate, insertPosition]
    );

    // 새 투두 추가 로직 (편집 모드 진입용)
    const createNewTodo = useCallback(
      (afterTodoId?: string) => {
        if (!isEditable) return;

        let newOrder: number;

        if (sortedTodos.length === 0) {
          // 빈 리스트인 경우
          newOrder = 10;
        } else if (!afterTodoId) {
          // 맨 마지막에 추가
          const lastTodo = sortedTodos[sortedTodos.length - 1];
          newOrder = calculateNewOrder(sortedTodos, lastTodo.id);
        } else {
          // 특정 투두 뒤에 추가
          newOrder = calculateNewOrder(sortedTodos, afterTodoId);
        }

        const newTodo: Todo = {
          id: generateTodoId(),
          text: '',
          completedAt: null,
          date: new Date(),
          order: newOrder,
        };

        const updatedTodos = [...todos, newTodo];
        onUpdate(updatedTodos);

        setEditingTodoId(newTodo.id);
        setFocusedTodoId(newTodo.id);
      },
      [isEditable, sortedTodos, todos, onUpdate]
    );

    // TodoInput 관련 핸들러들
    const handleInputFocus = useCallback(() => {
      setIsInputFocused(true);
      setFocusedTodoId(null); // 다른 Todo 포커스 해제
    }, []);

    const handleInputBlur = useCallback(() => {
      setIsInputFocused(false);
      // 중간 삽입이 취소되면 insertPosition 초기화
      if (insertPosition !== null) {
        setInsertPosition(null);
      }
    }, [insertPosition]);

    const handleInputAddTodo = useCallback(
      (text: string, continueInserting = false) => {
        addTodoFromInput(text, continueInserting);
      },
      [addTodoFromInput]
    );

    // 중간 삽입을 위한 핸들러
    const handleInsertTodo = useCallback(
      (afterTodoId: string) => {
        const todoIndex = sortedTodos.findIndex(todo => todo.id === afterTodoId);
        if (todoIndex !== -1) {
          setInsertPosition(todoIndex);
          setIsInputFocused(true);
          setFocusedTodoId(null); // 다른 Todo 포커스 해제
        }
      },
      [sortedTodos]
    );

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
          setInsertPosition(null); // 하단 TodoInput으로 이동 시 중간 삽입 해제
        } else {
          setIsInputFocused(false);
          setFocusedTodoId(sortedTodos[nextIndex].id);
          setInsertPosition(null); // TodoItem으로 이동 시 중간 삽입 해제
        }
      },
      [focusedTodoId, isInputFocused, sortedTodos]
    );

    const handleStartEdit = useCallback((todoId: string) => {
      setEditingTodoId(todoId);
      setFocusedTodoId(todoId);
      setIsInputFocused(false); // TodoInput 포커스 해제
      setInsertPosition(null); // 중간 삽입 해제
    }, []);

    // 키보드 이벤트 처리
    useEffect(() => {
      if (mode !== 'edit' || !isEditable) return;

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        // Todo 편집 중일 때는 처리하지 않음
        if (editingTodoId) return;

        // 포커스된 투두가 없고 TodoInput도 포커스되지 않은 경우 방향키 입력 시 처리
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
      };

      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [
      mode,
      isEditable,
      editingTodoId,
      focusedTodoId,
      isInputFocused,
      createNewTodo,
      handleStartEdit,
      handleInsertTodo,
      handleDeleteTodo,
      moveFocus,
      sortedTodos,
    ]);

    const handleTextChange = useCallback(
      (todoId: string, newText: string) => {
        if (!isValidTodoText(newText)) return;

        const updatedTodos = todos.map(todo =>
          todo.id === todoId ? { ...todo, text: newText } : todo
        );
        onUpdate(updatedTodos);
      },
      [todos, onUpdate]
    );

    const handleAddTodo = useCallback(
      (afterTodoId: string) => {
        // 기존 빈 Todo 생성 방식 대신 중간 삽입 사용
        handleInsertTodo(afterTodoId);
      },
      [handleInsertTodo]
    );

    const handleFinishEdit = useCallback((_todoId: string) => {
      setEditingTodoId(null);
    }, []);

    const handleToggleSelect = useCallback(
      (todoId: string) => {
        if (!onSelectionChange) return;

        // 이미 가져온 항목은 선택 불가
        if (disabledIds.has(todoId)) return;

        const todoIndex = sortedTodos.findIndex(todo => todo.id === todoId);
        const newSelectedIds = selectedIds.includes(todoId)
          ? selectedIds.filter(id => id !== todoId)
          : [...selectedIds, todoId];

        onSelectionChange(newSelectedIds);

        // 마지막 선택된 인덱스 업데이트 (선택/해제 모두에서)
        setLastSelectedIndex(todoIndex);
      },
      [selectedIds, onSelectionChange, disabledIds, sortedTodos, setLastSelectedIndex]
    );

    const handleShiftSelectRange = useCallback(
      (todoId: string) => {
        if (!onSelectionChange || disabledIds.has(todoId)) return;

        const currentIndex = sortedTodos.findIndex(todo => todo.id === todoId);
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
        const rangeIds = sortedTodos
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
      [
        onSelectionChange,
        disabledIds,
        sortedTodos,
        lastSelectedIndex,
        selectedIds,
        setLastSelectedIndex,
      ]
    );

    return (
      <div className="space-y-1">
        {sortedTodos.map((todo, index) => (
          <div key={`${todo.id}`}>
            <TodoItem
              todo={todo}
              isEditable={isEditable}
              mode={mode}
              isSelected={selectedIds.includes(todo.id)}
              isEditing={editingTodoId === todo.id}
              isFocused={focusedTodoId === todo.id}
              isSelectDisabled={disabledIds.has(todo.id)}
              isBroughtFromYesterday={broughtFromYesterdayIds.has(todo.id)}
              onTextChange={handleTextChange}
              onToggleComplete={onToggleComplete}
              onToggleSelect={onSelectionChange ? handleToggleSelect : undefined}
              onShiftSelectRange={onSelectionChange ? handleShiftSelectRange : undefined}
              onStartEdit={handleStartEdit}
              onFinishEdit={handleFinishEdit}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
            />

            {/* 중간 삽입 TodoInput (해당 위치에 삽입하는 경우) */}
            {mode === 'edit' && insertPosition === index && isInputFocused && (
              <div className="mt-1">
                <TodoInput
                  onAddTodo={handleInputAddTodo}
                  isFocused={isInputFocused}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  isBottomInput={false}
                />
              </div>
            )}
          </div>
        ))}

        {/* 하단 고정 TodoInput (항상 표시) */}
        {mode === 'edit' && (
          <TodoInput
            onAddTodo={handleInputAddTodo}
            isFocused={insertPosition === null && isInputFocused}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            isBottomInput={true}
          />
        )}
      </div>
    );
  }
);

TodoList.displayName = 'TodoList';
