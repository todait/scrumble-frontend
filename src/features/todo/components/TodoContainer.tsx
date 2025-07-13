'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useMemo } from 'react';
import { Todo, TodoContainerProps, TodoMode } from '../types';
import { copyTodosForToday, normalizeOrders } from '../utils';
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
      initialBroughtTodoIds,
      initialTodoIdMapping,
      showEditButton = false,
      onToggleEditMode,
    },
    ref
  ) => {
    const viewMode: TodoMode = forceEditMode ? 'edit' : 'view';
    const [isYesterdayCollapsed, setIsYesterdayCollapsed] = useState(false); // 처음에는 열려있음
    const [todoIdMapping, setTodoIdMapping] = useState<Map<string, string>>(initialTodoIdMapping || new Map()); // 새 ID -> 원본 ID 매핑
    const todayTodoListRef = useRef<TodoListRef>(null);

    // broughtTodoIds를 동적으로 계산
    const broughtTodoIds = useMemo(() => {
      const ids = new Set<string>();
      
      // 초기값이 있으면 추가
      if (initialBroughtTodoIds) {
        initialBroughtTodoIds.forEach(id => ids.add(id));
      }
      
      // todoIdMapping의 값들(어제 투두 ID들)도 추가
      Array.from(todoIdMapping.values()).forEach(id => ids.add(id));
      
      return ids;
    }, [initialBroughtTodoIds, todoIdMapping]);

    // selectedYesterdayIds를 broughtTodoIds로 초기화
    const [selectedYesterdayIds, setSelectedYesterdayIds] = useState<string[]>(() => 
      Array.from(broughtTodoIds)
    );

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

    // 현재 사용되지 않음 (토글 버튼이 주석 처리됨)
    // const handleToggleMode = useCallback(() => {
    //   if (forceEditMode) return; // 편집 모드 강제일 때는 토글 불가
    //   setViewMode(prev => (prev === 'view' ? 'edit' : 'view'));
    // }, [forceEditMode]);

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
        // 삭제된 Todo 찾기
        const currentTodoIds = new Set(todayTodos.map(t => t.id));
        const newTodoIds = new Set(newTodos.map(t => t.id));
        const deletedTodoIds = Array.from(currentTodoIds).filter(id => !newTodoIds.has(id));

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

        onUpdateTodayTodos(newTodos);
      },
      [todayTodos, todoIdMapping, onUpdateTodayTodos]
    );

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

        // 가져오기 후 어제 투두 섹션 닫기
        setIsYesterdayCollapsed(true);

        // 선택된 항목은 계속 체크 상태 유지 (ID 유지)

        // 가져오기 후 TodoInput에 포커스
        setTimeout(() => {
          todayTodoListRef.current?.focusInput();
        }, 300); // 트랜지션 후 포커스
      },
      [todayTodos, onUpdateTodayTodos, broughtTodoIds]
    );

    return (
      <div className="mx-auto max-w-4xl space-y-3">
        {/* 상단 컨트롤 */}
        {/* {!forceEditMode && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">투두 리스트</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMode}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {viewMode === 'edit' ? '보기' : '수정'}
              </button>
            </div>
          </div>
        )} */}

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
            broughtFromYesterdayIds={new Set([...todoIdMapping.keys(), ...(initialTodoIdMapping ? initialTodoIdMapping.keys() : [])])}
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
              broughtFromYesterdayIds={new Set([...todoIdMapping.keys(), ...(initialTodoIdMapping ? initialTodoIdMapping.keys() : [])])}
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
