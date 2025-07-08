'use client';

import { RiCheckboxCircleFill, RiCheckFill, RiCloseLine } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { TodoItemProps } from '../types';

export function TodoItem({
  todo,
  isEditable,
  mode,
  isSelected = false,
  isEditing = false,
  isFocused = false,
  isSelectDisabled = false,
  isBroughtFromYesterday = false,
  onTextChange,
  onToggleComplete,
  onToggleSelect,
  onStartEdit,
  onFinishEdit,
  onDeleteTodo,
}: TodoItemProps) {
  const [editText, setEditText] = useState(todo.text);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isCompleted = todo.completedAt !== null;

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  }, [isEditing]);

  // 텍스트 변경 시 editText 동기화
  useEffect(() => {
    setEditText(todo.text);
  }, [todo.text]);

  const handleTextSubmit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      // 빈 텍스트면 Todo 삭제하고 이전 Todo로 편집 모드 진입
      onDeleteTodo?.(todo.id, true);
    } else if (trimmedText !== todo.text) {
      onTextChange(todo.id, trimmedText);
    }
    onFinishEdit?.(todo.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
      // Enter, Shift+Enter 모두 동일하게 수정 완료 처리
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setEditText(todo.text);
      onFinishEdit?.(todo.id);
    } else if (e.key === 'Backspace' && editText.trim() === '') {
      e.preventDefault();
      onDeleteTodo?.(todo.id, true);
      onFinishEdit?.(todo.id);
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
    if (mode === 'edit' && !isEditing && isEditable) {
      // 체크박스 클릭이 아닌 경우에만
      const target = e.target as HTMLElement;
      if (!target.closest('[data-checkbox]')) {
        onStartEdit?.(todo.id);
      }
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditable) {
      onToggleComplete(todo.id);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(todo.id);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 줄바꿈 문자를 공백으로 치환하여 단일 라인 유지
    const newValue = e.target.value.replace(/[\r\n]+/g, ' ');
    setEditText(newValue);
  };

  // 스타일 계산
  const itemClasses = [
    'flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors relative h-9 group',

    /* ✅ 선택/포커스 하이라이트 */
    (isSelected || isFocused) && 'bg-purple-50',

    /* ✅ 뷰 모드에서도 hover 하이라이트 유지 */
    mode === 'view' && 'hover:bg-purple-50',

    /* ✅ 편집 모드: 편집 “중”인 행만 보라색 테두리 */
    mode === 'edit' && isEditable && isEditing && 'border border-purple-400',

    /* ✅ 편집 모드의 나머지 행은 cursor 표시 + 기존 hover 효과만 */
    mode === 'edit' && isEditable && !isEditing && 'cursor-text hover:bg-purple-50',

    /* ✅ 편집 중에는 강제로 흰 배경으로 덮어쓰기 */
    isEditing && 'bg-white',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-todo-id={todo.id}
      className={`${itemClasses} ${isBroughtFromYesterday ? 'relative' : ''}`}
      onClick={handleItemClick}
      onKeyDown={e => {
        if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && !e.shiftKey) {
          if (mode === 'edit' && !isEditing && isEditable && isFocused) {
            e.preventDefault();
            onStartEdit?.(todo.id);
          }
        }
      }}
      tabIndex={mode === 'edit' ? 0 : -1}
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
      {/* 완료 체크박스 */}
      <button
        data-checkbox
        onClick={handleCheckboxClick}
        disabled={!isEditable}
        className={`h-5 w-5 flex-shrink-0 transition-colors ${
          isEditable ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {isCompleted ? (
          <RiCheckboxCircleFill className="h-5 w-5 text-purple-600" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-400 opacity-50" />
        )}
      </button>

      {/* 텍스트 영역 */}
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <textarea
            ref={textAreaRef}
            value={editText}
            onChange={handleTextAreaChange}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            onPaste={e => {
              // 붙여넣기 시에도 줄바꿈 방지
              e.preventDefault();
              const text = e.clipboardData.getData('text').replace(/[\r\n]+/g, ' ');
              const target = e.target as HTMLTextAreaElement;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const newValue = editText.slice(0, start) + text + editText.slice(end);
              setEditText(newValue);
            }}
            className="h-6 w-full resize-none border-none bg-white px-2 py-1.5 text-sm leading-tight text-[#222222] outline-none"
            placeholder="투두를 입력하세요..."
            rows={1}
          />
        ) : (
          <div
            className={`flex h-6 items-center px-2 py-1.5 text-sm leading-tight ${
              isCompleted ? 'text-gray-500 line-through opacity-60' : 'text-gray-900'
            }`}
          >
            {todo.text}
          </div>
        )}
      </div>

      {/* 선택 체크박스 (어제 투두에서만) */}
      {onToggleSelect && (
        <button
          data-checkbox
          onClick={handleSelectClick}
          disabled={isSelectDisabled}
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
            isSelectDisabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-100'
              : 'border-gray-300 hover:border-purple-400'
          }`}
          style={{
            backgroundColor: isSelectDisabled ? undefined : isSelected ? '#9747FF' : 'transparent',
            borderColor: isSelectDisabled ? undefined : isSelected ? '#9747FF' : undefined,
          }}
        >
          {isSelected && !isSelectDisabled && <RiCheckFill className="h-4 w-4 text-white" />}
          {isSelectDisabled && <span className="text-xs text-gray-400">✓</span>}
        </button>
      )}

      {/* 삭제 버튼 (수정 모드에서만) */}
      {mode === 'edit' && isEditable && !isEditing && (
        <button
          onClick={e => {
            e.stopPropagation();
            onDeleteTodo?.(todo.id);
          }}
          className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
        >
          <RiCloseLine className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
