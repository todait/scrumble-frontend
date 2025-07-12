'use client';

import { RiCheckboxCircleFill, RiCheckFill, RiCircleFill, RiCloseLine } from '@remixicon/react';
import { useTodoItemHandlers } from '../hooks/useTodoItemHandlers';
import { useTodoItemLogic } from '../hooks/useTodoItemLogic';
import { TodoItemProps } from '../types';
import {
  getCheckboxClasses,
  getSelectButtonClasses,
  getTextClasses,
  getTodoItemClasses,
} from '../utils/todoItemStyles';

export function TodoItem({
  todo,
  isEditable,
  mode,
  isSelected = false,
  isEditing = false,
  isFocused = false,
  isSelectDisabled = false,
  isBroughtFromYesterday = false,
  displayMode = 'checkbox',
  onTextChange,
  onToggleComplete,
  onToggleSelect,
  onShiftSelectRange,
  onStartEdit,
  onFinishEdit,
  onAddTodo,
  onDeleteTodo,
}: TodoItemProps) {
  const isCompleted = !!todo.completedAt;

  // 로직 hook 사용
  const {
    editText,
    textAreaRef,
    setIsComposing,
    handleTextSubmit,
    handleKeyDown: handleEditKeyDown,
    handleTextAreaChange,
    handlePaste,
  } = useTodoItemLogic({
    todoId: todo.id,
    todoName: todo.name,
    isEditing,
    onTextChange,
    onFinishEdit,
    onDeleteTodo,
    onAddTodo,
  });

  // 이벤트 핸들러 hook 사용
  const {
    handleItemClick,
    handleCheckboxClick,
    handleSelectClick,
    handleDeleteClick,
    handleKeyDown: handleItemKeyDown,
  } = useTodoItemHandlers({
    todoId: todo.id,
    mode,
    isEditing,
    isEditable,
    isSelectDisabled,
    onToggleComplete,
    onToggleSelect,
    onShiftSelectRange,
    onStartEdit,
    onDeleteTodo,
  });

  // 스타일 계산
  const itemClasses = getTodoItemClasses({
    mode,
    isEditable,
    isEditing,
    isSelected,
    isFocused,
    isSelectDisabled,
    onToggleSelect,
    displayMode,
  });

  return (
    <div
      data-todo-id={todo.id}
      className={`${itemClasses} ${isBroughtFromYesterday ? 'relative' : ''}`}
      onClick={handleItemClick}
      onKeyDown={isFocused ? handleItemKeyDown : undefined}
      tabIndex={mode === 'edit' ? 0 : -1}
      style={{
        userSelect: onToggleSelect && !isSelectDisabled ? 'none' : 'auto',
        WebkitUserSelect: onToggleSelect && !isSelectDisabled ? 'none' : 'auto',
      }}
    >
      {/* 가져온 투두 하이픈 표시 */}
      {isBroughtFromYesterday && (
        <span
          className="absolute left-0 top-1/2 z-10 -ml-2 -translate-y-1/2 transform text-base font-bold"
          style={{ color: '#FFC919' }}
        >
          -
        </span>
      )}
      {/* 완료 체크박스 또는 bullet point */}
      {displayMode === 'bullet' ? (
        <div className="flex h-2 w-2 flex-shrink-0 items-center justify-center">
          <RiCircleFill className="h-3 w-3 text-[#222222] opacity-40" />
        </div>
      ) : (
        <button
          data-checkbox
          onClick={handleCheckboxClick}
          disabled={!isEditable}
          className={getCheckboxClasses(isEditable)}
        >
          {isCompleted ? (
            <RiCheckboxCircleFill className="h-5 w-5 text-purple-600" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 opacity-50" />
          )}
        </button>
      )}

      {/* 텍스트 영역 */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <textarea
            ref={textAreaRef}
            value={editText}
            onChange={handleTextAreaChange}
            onBlur={handleTextSubmit}
            onKeyDown={handleEditKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onPaste={handlePaste}
            className="h-6 w-full resize-none border-none bg-white px-2 py-1.5 text-sm leading-tight text-[#222222] outline-none"
            placeholder="투두를 입력하세요..."
            rows={1}
          />
        ) : (
          <div className={getTextClasses(isCompleted)}>
            <span className="truncate">{todo.name}</span>
          </div>
        )}
      </div>

      {/* 선택 체크박스 (어제 투두에서만) */}
      {onToggleSelect && (
        <button
          data-checkbox
          onClick={handleSelectClick}
          disabled={isSelectDisabled}
          className={getSelectButtonClasses(isSelectDisabled, isSelected)}
          style={{
            backgroundColor: isSelected ? '#9747FF' : isSelectDisabled ? undefined : 'transparent',
            borderColor: isSelected ? '#9747FF' : isSelectDisabled ? undefined : undefined,
          }}
        >
          {isSelected && !isSelectDisabled && <RiCheckFill className="h-4 w-4 text-white" />}
          {isSelectDisabled && isSelected && <span className="text-xs text-white">✓</span>}
          {isSelectDisabled && !isSelected && <span className="text-xs text-gray-400">✓</span>}
        </button>
      )}

      {/* 삭제 버튼 (수정 모드에서만) */}
      {mode === 'edit' && isEditable && !isEditing && (
        <button
          data-delete-button
          onClick={handleDeleteClick}
          className="flex h-8 w-6 flex-shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
        >
          <RiCloseLine className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
