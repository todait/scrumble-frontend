'use client';

import { RiArrowDownSLine } from '@remixicon/react';
import { CollapseTodoListSectionProps } from '../types';
import { calculateSelectionStats, getSelectionHeaderText } from '../utils';
import { TodoList } from './TodoList';

export function CollapseTodoListSection({
  title,
  todos,
  isCollapsed,
  onToggleCollapse,
  isEditable,
  mode,
  selectedIds = [],
  onSelectionChange,
  onToggleComplete,
  onUpdate,
  showBringButton = false,
  onBringToToday,
  broughtTodoIds = new Set(),
}: CollapseTodoListSectionProps) {
  const stats = calculateSelectionStats(todos, selectedIds);
  const headerText = showBringButton ? getSelectionHeaderText(todos, selectedIds) : title;
  const canBring = showBringButton && stats.totalCount > 0 && onBringToToday;

  const handleBringToToday = () => {
    if (!canBring) return;

    const selectedTodos = todos.filter(
      todo => selectedIds.includes(todo.id) && !broughtTodoIds.has(todo.id)
    );

    if (selectedTodos.length === 0) {
      alert('선택한 항목들은 이미 가져왔습니다.');
      return;
    }

    onBringToToday(selectedTodos);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* 헤더 */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'border-b-0' : 'border-b border-gray-200'
        } bg-gray-50`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-gray-600 opacity-75">{headerText}</div>
        </div>

        <button
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 opacity-50 transition-all duration-300 ease-in-out hover:opacity-100 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        >
          <RiArrowDownSLine className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
        }`}
      >
        <div className="p-3">
          {/* 항상 TodoList를 렌더링 (빈 배열이라도) */}
          <TodoList
            todos={todos}
            isEditable={isEditable}
            mode={mode}
            onUpdate={onUpdate || (() => {})}
            onToggleComplete={onToggleComplete}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            disabledIds={broughtTodoIds}
          />
          
          {/* 빈 리스트 메시지 (편집 모드가 아닐 때만) */}
          {todos.length === 0 && mode !== 'edit' && (
            <div className="py-8 text-center text-sm text-gray-500">투두가 없습니다</div>
          )}

          {/* 가져오기 버튼 */}
          {showBringButton && (
            <div className="mt-2">
              <button
                onClick={handleBringToToday}
                disabled={!canBring}
                className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  canBring
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                {stats.totalCount === 0 && '투두 0개 선택'}
                {stats.allIncomplete && `미완료 ${stats.incompleteCount}개 • 가져오기`}
                {stats.allCompleted && `완료 ${stats.completedCount}개 • 가져오기`}
                {stats.hasCompleted &&
                  stats.hasIncomplete &&
                  `투두 ${stats.totalCount}개 • 가져오기`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
