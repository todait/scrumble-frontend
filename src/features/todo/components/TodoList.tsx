'use client';

import { useCallback, useEffect, useState } from 'react';
import { Todo, TodoListProps } from '../types';
import { calculateNewOrder, generateTodoId, isValidTodoText } from '../utils';
import { TodoItem } from './TodoItem';

export function TodoList({
  todos,
  isEditable,
  mode,
  onUpdate,
  onToggleComplete,
  selectedIds = [],
  onSelectionChange,
  disabledIds = new Set(),
  broughtFromYesterdayIds = new Set(),
}: TodoListProps) {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null);

  // todos를 order에 따라 정렬
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

  const PLACEHOLDER_ID = '__placeholder__';

  // 새 투두 추가 로직을 별도 함수로 분리
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

  // placeholder 클릭/키보드 처리를 위한 함수
  const handlePlaceholderAction = useCallback(() => {
    setFocusedTodoId(PLACEHOLDER_ID);
    createNewTodo();
  }, [createNewTodo]);

  const moveFocus = useCallback(
    (direction: 'up' | 'down') => {
      if (!focusedTodoId) return;

      // placeholder 가 포커스된 경우 별도 처리
      const isPlaceholderFocused = focusedTodoId === PLACEHOLDER_ID;

      const currentIndex = isPlaceholderFocused
        ? sortedTodos.length // placeholder 는 마지막 인덱스로 간주
        : sortedTodos.findIndex(todo => todo.id === focusedTodoId);
      if (currentIndex === -1) return;

      let nextIndex;
      const totalItems = sortedTodos.length + 1; // placeholder 포함

      if (direction === 'up') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      } else {
        nextIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      }

      // nextIndex 가 마지막이면 placeholder, 아니면 실제 todo ID
      if (nextIndex === sortedTodos.length) {
        setFocusedTodoId(PLACEHOLDER_ID);
      } else {
        setFocusedTodoId(sortedTodos[nextIndex].id);
      }
    },
    [focusedTodoId, sortedTodos]
  );

  const handleStartEdit = useCallback((todoId: string) => {
    setEditingTodoId(todoId);
    setFocusedTodoId(todoId);
  }, []);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (mode !== 'edit' || !isEditable) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 입력 중일 때는 처리하지 않음
      if (editingTodoId) return;

      // 포커스된 투두가 없는 경우 방향키 입력 시 처리
      if (!focusedTodoId) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          // 첫 번째 Todo에 포커스
          if (sortedTodos.length > 0) {
            setFocusedTodoId(sortedTodos[0].id);
          }
        }
        return;
      }

      // placeholder 포커스일 때 Enter/E 로 새 투두 추가
      if (focusedTodoId === PLACEHOLDER_ID) {
        if (e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          createNewTodo();
          return;
        }
      }

      switch (e.key) {
        case 'Enter':
          if (e.shiftKey) {
            // Shift+Enter: 현재 포커스된 투두 아래에 새 투두 추가
            e.preventDefault();
            createNewTodo(focusedTodoId);
          } else {
            // Enter: 편집 모드 진입
            e.preventDefault();
            handleStartEdit(focusedTodoId);
          }
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          handleStartEdit(focusedTodoId);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocus('down');
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, isEditable, editingTodoId, focusedTodoId, createNewTodo, handleStartEdit, moveFocus, sortedTodos]);

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
      createNewTodo(afterTodoId);
    },
    [createNewTodo]
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
            setEditingTodoId(targetTodoId);
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

  const handleFinishEdit = useCallback((_todoId: string) => {
    setEditingTodoId(null);
  }, []);

  const handleToggleSelect = useCallback(
    (todoId: string) => {
      if (!onSelectionChange) return;
      
      // 이미 가져온 항목은 선택 불가
      if (disabledIds.has(todoId)) return;

      const newSelectedIds = selectedIds.includes(todoId)
        ? selectedIds.filter(id => id !== todoId)
        : [...selectedIds, todoId];

      onSelectionChange(newSelectedIds);
    },
    [selectedIds, onSelectionChange, disabledIds]
  );

  return (
    <div className="space-y-1">
      {sortedTodos.map(todo => (
        <TodoItem
          key={todo.id}
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
          onStartEdit={handleStartEdit}
          onFinishEdit={handleFinishEdit}
          onAddTodo={handleAddTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      ))}

      {/* 항상 표시되는 투두 추가 placeholder */}
      {mode === 'edit' && (
        <div
          role="button"
          tabIndex={0}
          onClick={handlePlaceholderAction}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && !e.shiftKey) {
              e.preventDefault();
              handlePlaceholderAction();
            }
          }}
          className={`group relative flex h-9 cursor-text items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-purple-50 ${
            focusedTodoId === PLACEHOLDER_ID ? 'bg-purple-50' : ''
          }`}
        >
          {/* 빈 체크박스 */}
          <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-purple-400 opacity-50" />

          {/* Placeholder 텍스트 */}
          <div className="min-w-0 flex-1">
            <div className="flex h-6 items-center px-2 py-1.5 text-sm leading-tight text-gray-400">
              투두 추가
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
