'use client';

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { useTodoListLogic } from '../hooks/useTodoListLogic';
import { useTodoSelection } from '../hooks/useTodoSelection';
import { TodoListProps } from '../types';
import { TodoInput } from './TodoInput';
import { TodoItem } from './TodoItem';

export interface TodoListRef {
  focusInput: () => void;
  hasFocus: () => boolean;
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
      showBringButton = false,
      onBringToToday,
      displayMode = 'checkbox',
      showEditButton = false,
      onToggleEditMode,
    },
    ref
  ) => {
    const {
      editingTodoId,
      focusedTodoId,
      isInputFocused,
      insertAfterId,
      sortedTodos,
      setFocusedTodoId,
      setIsInputFocused,
      setInsertAfterId,
      addTodoFromInput,
      handleInsertTodo,
      handleDeleteTodo,
      moveFocus,
      handleStartEdit,
      handleFinishEdit,
      handleTextChange,
      handleInputFocus,
      handleInputBlur,
    } = useTodoListLogic({ todos, isEditable, onUpdate });

    // 선택 관련 로직
    const {
      handleToggleSelect,
      handleShiftSelectRange,
      handleBringToToday,
      selectionStats,
      canBringToToday,
    } = useTodoSelection({
      todos: sortedTodos,
      selectedIds,
      disabledIds,
      onSelectionChange,
      onBringToToday,
    });

    // ref를 통해 외부에서 호출 가능한 메서드 노출
    useImperativeHandle(
      ref,
      () => ({
        focusInput: () => {
          setIsInputFocused(true);
          setFocusedTodoId(null);
          setInsertAfterId(null);
        },
        hasFocus: () => {
          return focusedTodoId !== null || isInputFocused;
        },
      }),
      [focusedTodoId, isInputFocused, setIsInputFocused, setFocusedTodoId, setInsertAfterId]
    );

    // 키보드 핸들러 사용
    useKeyboardHandler({
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
    });

    const handleAddTodo = useCallback(
      (afterTodoId: string) => {
        // 기존 빈 Todo 생성 방식 대신 중간 삽입 사용
        handleInsertTodo(afterTodoId);
      },
      [handleInsertTodo]
    );

    // TodoInput에서 사용할 addTodo 핸들러
    const handleInputAddTodo = useCallback(
      (text: string) => {
        addTodoFromInput(text);
      },
      [addTodoFromInput]
    );

    // 마지막 TodoItem의 id 계산
    const lastTodoId = sortedTodos.length > 0 ? sortedTodos[sortedTodos.length - 1].id : null;

    return (
      <div className="space-y-1">
        {sortedTodos.map(todo => (
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
              displayMode={displayMode}
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
            {mode === 'edit' && insertAfterId === todo.id && isInputFocused && (
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

        {/* 투두 수정 버튼 (PostContent에서 사용될 때만 표시, view 모드에서만) */}
        {showEditButton && isEditable && sortedTodos.length > 0 && mode === 'view' && (
          <>
            {/* Divider */}
            <div className="-mx-3 mt-3 border-t border-gray-200" />

            {/* 투두 수정 버튼 */}
            <div className="flex h-[22px] items-center justify-end pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEditMode?.();
                }}
                className="text-xs text-[#222222] text-opacity-50 transition-opacity hover:text-opacity-70"
              >
                투두 수정
              </button>
            </div>
          </>
        )}

        {/* 하단 고정 TodoInput (마지막 TodoItem 바로 다음에 삽입하는 경우가 아닐 때만 표시) */}
        {mode === 'edit' && (insertAfterId === null || insertAfterId !== lastTodoId) && (
          <TodoInput
            onAddTodo={handleInputAddTodo}
            isFocused={insertAfterId === null && isInputFocused}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            isBottomInput={true}
          />
        )}

        {/* 빈 리스트 메시지 (편집 모드가 아닐 때만) */}
        {todos.length === 0 && mode !== 'edit' && (
          <div className="py-8 text-center text-sm text-gray-500">투두가 없습니다</div>
        )}

        {/* 가져오기 버튼 */}
        {showBringButton && (
          <div className="mt-2">
            <button
              onClick={handleBringToToday}
              disabled={!canBringToToday}
              className={`w-full rounded-lg border px-4 py-4 text-sm font-medium transition-colors ${
                canBringToToday
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
              }`}
            >
              {selectionStats.totalCount === 0
                ? '투두 0개 선택'
                : selectionStats.allIncomplete
                  ? `미완료 ${selectionStats.incompleteCount}개 • 가져오기`
                  : selectionStats.allCompleted
                    ? `완료 ${selectionStats.completedCount}개 • 가져오기`
                    : `투두 ${selectionStats.totalCount}개 • 가져오기`}
            </button>
          </div>
        )}
      </div>
    );
  }
);

TodoList.displayName = 'TodoList';
