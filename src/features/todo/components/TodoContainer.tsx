'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Todo, TodoContainerProps, TodoMode } from '../types';
import { copyTodosForToday, normalizeOrders } from '../utils';
import { CollapseTodoListSection } from './CollapseTodoListSection';
import { TodoList, TodoListRef } from './TodoList';

export interface TodoContainerRef {
  getTodayTodoListRef: () => TodoListRef | null;
}

export const TodoContainer = forwardRef<TodoContainerRef, TodoContainerProps>(
  (
    {
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
    },
    ref
  ) => {
    const [mode, setMode] = useState<TodoMode>(forceEditMode ? 'edit' : 'view');
    const [selectedYesterdayIds, setSelectedYesterdayIds] = useState<string[]>([]);
    const [isYesterdayCollapsed, setIsYesterdayCollapsed] = useState(false); // 처음에는 열려있음
    const [broughtTodoIds, setBroughtTodoIds] = useState<Set<string>>(new Set()); // 이미 가져온 Todo ID 추적
    const [todoIdMapping, setTodoIdMapping] = useState<Map<string, string>>(new Map()); // 새 ID -> 원본 ID 매핑
    const todayTodoListRef = useRef<TodoListRef>(null);

    // ref를 통해 외부에서 TodoList에 접근 가능하게 함
    useImperativeHandle(
      ref,
      () => ({
        getTodayTodoListRef: () => todayTodoListRef.current,
      }),
      []
    );

    const handleToggleMode = useCallback(() => {
      if (forceEditMode) return; // 편집 모드 강제일 때는 토글 불가
      setMode(prev => (prev === 'view' ? 'edit' : 'view'));
    }, [forceEditMode]);

    const handleYesterdayToggleComplete = useCallback(
      (todoId: string) => {
        onToggleComplete(todoId, true);
      },
      [onToggleComplete]
    );

    const handleTodayToggleComplete = useCallback(
      (todoId: string) => {
        onToggleComplete(todoId, false);
      },
      [onToggleComplete]
    );

    const handleSaveTodos = useCallback(() => {
      if (onSaveTodos) {
        onSaveTodos();
      } else {
        // TODO: 기본 투두 저장 로직 구현
        // console.log('투두 저장:', todayTodos);
      }
    }, [onSaveTodos]);

    const handleNoTodosToday = useCallback(() => {
      // TODO: 오늘의 투두 없음 처리 로직 구현
      // console.log('오늘의 투두 없음');
    }, []);

    const handleUpdateTodayTodos = useCallback(
      (newTodos: Todo[]) => {
        // 삭제된 Todo 찾기
        const currentTodoIds = new Set(todayTodos.map(t => t.id));
        const newTodoIds = new Set(newTodos.map(t => t.id));
        const deletedTodoIds = Array.from(currentTodoIds).filter(id => !newTodoIds.has(id));

        // 삭제된 Todo의 원본 ID 찾아서 broughtTodoIds에서 제거
        deletedTodoIds.forEach(deletedId => {
          const originalId = todoIdMapping.get(deletedId);
          if (originalId) {
            setBroughtTodoIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(originalId);
              return newSet;
            });
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

        // 가져온 Todo ID들을 추적
        setBroughtTodoIds(prev => new Set([...prev, ...todosToImport.map(t => t.id)]));

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
        {!forceEditMode && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">투두 리스트</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMode}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'edit'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {mode === 'edit' ? '보기' : '수정'}
              </button>
            </div>
          </div>
        )}

        {/* 어제 투두 섹션 */}
        {yesterdayTodos.length > 0 && (
          <CollapseTodoListSection
            title="어제의 투두"
            todos={yesterdayTodos}
            isCollapsed={isYesterdayCollapsed}
            onToggleCollapse={() => setIsYesterdayCollapsed(!isYesterdayCollapsed)}
            isEditable={false} // 어제 투두는 수정 불가
            mode="view"
            selectedIds={selectedYesterdayIds}
            onSelectionChange={setSelectedYesterdayIds}
            onToggleComplete={handleYesterdayToggleComplete}
            onUpdate={onUpdateYesterdayTodos}
            showBringButton={true}
            onBringToToday={handleBringToToday}
            broughtTodoIds={broughtTodoIds}
          />
        )}

        {/* 오늘 투두 섹션 */}
        <div className="">
          {/* 항상 TodoList를 렌더링 (빈 배열이라도) */}
          <TodoList
            ref={todayTodoListRef}
            todos={todayTodos}
            isEditable={isEditable}
            mode={mode}
            onUpdate={handleUpdateTodayTodos}
            onToggleComplete={handleTodayToggleComplete}
            broughtFromYesterdayIds={new Set(todoIdMapping.keys())}
          />

          {/* 빈 리스트 메시지 (편집 모드가 아닐 때만) */}
          {todayTodos.length === 0 && mode !== 'edit' && (
            <div className="py-8 text-center">
              <div className="mb-3 text-sm text-gray-500">오늘의 투두가 없습니다</div>
            </div>
          )}

          {/* 버튼 섹션 */}
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
              {isProcessing ? '완료 중...' : (
                customButtonText 
                  ? customButtonText(
                      todayTodos.filter(todo => todo.completedAt).length,
                      todayTodos.length
                    )
                  : `총 ${todayTodos.length}개의 투두`
              )}
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
        </div>
      </div>
    );
  }
);

TodoContainer.displayName = 'TodoContainer';
