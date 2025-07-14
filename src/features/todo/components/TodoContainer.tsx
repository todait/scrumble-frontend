'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Todo, TodoContainerProps, TodoMode } from '../types';
import { useYesterdayTodoImport } from '../hooks/useYesterdayTodoImport';
import { CollapseSection } from './CollapseSection';
import { TodoList, TodoListRef } from './TodoList';

export interface TodoContainerRef {
  getTodayTodoListRef: () => TodoListRef | null;
  clearFocus: () => void;
}

export const TodoContainer = forwardRef<TodoContainerRef, TodoContainerProps>(
  (
    {
      mode = 'checkIn',
      yesterdayTodos,
      todayTodos,
      isEditable,
      onUpdateYesterdayTodos,
      onUpdateTodayTodos,
      onToggleComplete,
      forceEditMode = false,
      onSaveTodos,
      isProcessing = false,
      customButtonText,
      customButtonIcon,
      hideNoTodosButton = false,
      initialTodoIdMapping,
      showEditButton = false,
      onToggleEditMode,
    },
    ref
  ) => {
    const viewMode: TodoMode = forceEditMode ? 'edit' : 'view';
    const [isYesterdayCollapsed, setIsYesterdayCollapsed] = useState(false); // 처음에는 열려있음
    const todayTodoListRef = useRef<TodoListRef>(null);

    // 어제 투두 가져오기 관련 로직 hook 사용
    const {
      todoIdMapping,
      broughtTodoIds,
      selectedYesterdayIds,
      setSelectedYesterdayIds,
      handleBringToToday: hookHandleBringToToday,
      updateTodoMappingOnChange,
    } = useYesterdayTodoImport({
      todayTodos,
      onUpdateTodayTodos,
      initialTodoIdMapping,
    });

    // ref를 통해 외부에서 TodoList에 접근 가능하게 함
    useImperativeHandle(
      ref,
      () => ({
        getTodayTodoListRef: () => todayTodoListRef.current,
        clearFocus: () => {
          todayTodoListRef.current?.clearFocus();
        },
      }),
      []
    );

    const handleYesterdayToggleComplete = useCallback(
      (todoId: string) => {
        // Optimistic UI Update
        const updatedTodos = yesterdayTodos.map(todo =>
          todo.id === todoId
            ? { ...todo, completedAt: todo.completedAt ? undefined : new Date().toISOString() }
            : todo
        );
        onUpdateYesterdayTodos?.(updatedTodos);

        // 서버 요청 (비동기)
        onToggleComplete(todoId, true);
      },
      [yesterdayTodos, onUpdateYesterdayTodos, onToggleComplete]
    );

    const handleTodayToggleComplete = useCallback(
      (todoId: string) => {
        // Optimistic UI Update
        const updatedTodos = todayTodos.map(todo =>
          todo.id === todoId
            ? { ...todo, completedAt: todo.completedAt ? undefined : new Date().toISOString() }
            : todo
        );
        onUpdateTodayTodos(updatedTodos);

        // 서버 요청 (비동기)
        onToggleComplete(todoId, false);
      },
      [todayTodos, onUpdateTodayTodos, onToggleComplete]
    );

    const handleSaveTodos = useCallback(() => {
      if (onSaveTodos) {
        onSaveTodos();
      }
    }, [onSaveTodos]);

    const handleNoTodosToday = useCallback(() => {
      if (onSaveTodos) {
        onSaveTodos();
      }
    }, [onSaveTodos]);

    const handleUpdateTodayTodos = useCallback(
      (newTodos: Todo[]) => {
        updateTodoMappingOnChange(newTodos);
      },
      [updateTodoMappingOnChange]
    );

    const handleBringToToday = useCallback(
      (selectedTodos: Todo[]) => {
        hookHandleBringToToday(selectedTodos);

        // 가져오기 후 어제 투두 섹션 닫기
        setIsYesterdayCollapsed(true);

        // 가져오기 후 TodoInput에 포커스
        setTimeout(() => {
          todayTodoListRef.current?.focusInput();
        }, 300); // 트랜지션 후 포커스
      },
      [hookHandleBringToToday]
    );

    return (
      <div className="mx-auto max-w-4xl space-y-3">
        {/* 어제 투두 섹션 (checkIn 모드에서만 표시) */}
        {mode === 'checkIn' && yesterdayTodos.length > 0 && (
          <CollapseSection
            title=""
            isCollapsed={isYesterdayCollapsed}
            onToggleCollapse={() => setIsYesterdayCollapsed(!isYesterdayCollapsed)}
            headerContent={
              <div className="text-xs font-bold">
                <span className="text-[#222222] text-opacity-60">어제의 투두에서</span>
                <span className="text-[#222222]"> • 투두 {selectedYesterdayIds.length}개 선택</span>
              </div>
            }
          >
            <TodoList
              todos={yesterdayTodos}
              isEditable={false} // 어제 투두는 수정 불가
              mode="view"
              onUpdate={onUpdateYesterdayTodos || (() => {})}
              onToggleComplete={handleYesterdayToggleComplete}
              selectedIds={selectedYesterdayIds}
              onSelectionChange={setSelectedYesterdayIds}
              disabledIds={broughtTodoIds}
              showBringButton={true}
              onBringToToday={handleBringToToday}
              displayMode="checkbox"
            />
          </CollapseSection>
        )}

        {/* 오늘 투두 섹션 */}
        {mode === 'postContent' ? (
          // postContent 모드: CollapseSection 없이 TodoList만 렌더링
          <TodoList
            ref={todayTodoListRef}
            todos={todayTodos}
            isEditable={isEditable}
            mode={viewMode}
            onUpdate={handleUpdateTodayTodos}
            onToggleComplete={handleTodayToggleComplete}
            broughtFromYesterdayIds={new Set(todoIdMapping.keys())}
            displayMode={!isEditable ? 'bullet' : 'checkbox'}
            showEditButton={showEditButton || false}
            onToggleEditMode={onToggleEditMode}
          />
        ) : (
          // checkIn, checkOut 모드: 일반 TodoList (동일한 props 전달)
          <div className="">
            <TodoList
              ref={todayTodoListRef}
              todos={todayTodos}
              isEditable={isEditable}
              mode={viewMode}
              onUpdate={handleUpdateTodayTodos}
              onToggleComplete={handleTodayToggleComplete}
              broughtFromYesterdayIds={new Set(todoIdMapping.keys())}
              displayMode={!isEditable ? 'bullet' : 'checkbox'}
              showEditButton={showEditButton || false}
              onToggleEditMode={onToggleEditMode}
            />
          </div>
        )}

        {/* 버튼 섹션 - postContent 모드에서는 숨김 */}
        {mode !== 'postContent' && (
          <div className="mt-4">
            {/* 총 투두 개수 및 저장 버튼 */}
            <button
              onClick={handleSaveTodos}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {customButtonIcon || (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
              {isProcessing
                ? '완료 중...'
                : customButtonText
                  ? customButtonText(
                      todayTodos.filter(todo => todo.completedAt).length,
                      todayTodos.length
                    )
                  : `총 ${todayTodos.length}개의 투두`}
            </button>

            {/* 오늘의 투두 없음 텍스트 링크 */}
            {!hideNoTodosButton && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleNoTodosToday}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                  style={{ fontSize: '13px' }}
                >
                  오늘의 투두 없음
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TodoContainer.displayName = 'TodoContainer';
