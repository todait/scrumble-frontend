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
  onShiftSelectRange,
  onStartEdit,
  onFinishEdit,
  onAddTodo,
  onDeleteTodo,
}: TodoItemProps) {
  const [editText, setEditText] = useState(todo.text);
  const [isComposing, setIsComposing] = useState(false); // IME 조합 상태

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

  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, todo.id]);

  const handleTextSubmit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      onDeleteTodo?.(todo.id, true);
    } else if (trimmedText !== todo.text) {
      // 상태를 먼저 업데이트하고
      setEditText(trimmedText); // 이 줄 추가!
      onTextChange(todo.id, trimmedText);
    }
    setTimeout(() => {
      onFinishEdit?.(todo.id);
    }, 0);
  };

  const handleEscapeSubmit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      // 빈 텍스트면 Todo 삭제하고 이전 Todo로 편집 모드 진입
      onDeleteTodo?.(todo.id, true);
    } else if (trimmedText !== todo.text) {
      onTextChange(todo.id, trimmedText);
    }
    // ESC의 경우 바로 편집 모드 해제하지 않고 setTimeout으로 지연
    setTimeout(() => {
      onFinishEdit?.(todo.id);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME 조합 중일 때는 Enter 키 처리하지 않음
    if (isComposing && e.key === 'Enter') {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enter: 현재 Todo 저장 후 TodoInput 중간 삽입
        handleTextSubmit();
        
        setTimeout(() => {
          // TodoInput 중간 삽입
          onAddTodo?.(todo.id);
        }, 100);
      } else {
        // Enter: 저장만
        handleTextSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleEscapeSubmit();
    } else if (e.key === 'Backspace' && editText.trim() === '') {
      e.preventDefault();
      onDeleteTodo?.(todo.id, true);
      onFinishEdit?.(todo.id);
    }
  };

  // IME 조합 이벤트 핸들러
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleItemClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 체크박스나 삭제 버튼 클릭은 제외
    if (target.closest('[data-checkbox]') || target.closest('[data-delete-button]')) {
      return;
    }

    // Shift 클릭 시 텍스트 선택 방지
    if (e.shiftKey) {
      e.preventDefault();
    }

    // 편집 모드이고 편집 중이 아니며 수정 가능한 경우 - 편집 모드 진입
    if (mode === 'edit' && !isEditing && isEditable) {
      onStartEdit?.(todo.id);
    }
    // 선택 기능이 있고 비활성화되지 않은 경우 - 선택/해제 토글
    else if (onToggleSelect && !isSelectDisabled) {
      if (e.shiftKey) {
        // Shift + 클릭: 범위 선택
        onShiftSelectRange?.(todo.id);
      } else {
        // 일반 클릭: 단일 선택/해제
        onToggleSelect(todo.id);
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
    if (e.shiftKey && onShiftSelectRange) {
      // Shift + 체크박스 클릭: 범위 선택
      onShiftSelectRange(todo.id);
    } else {
      // 일반 체크박스 클릭: 단일 선택/해제
      onToggleSelect?.(todo.id);
    }
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

    /* ✅ 선택 가능한 항목은 pointer 커서 */
    onToggleSelect && !isSelectDisabled && 'cursor-pointer',

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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
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
          data-delete-button
          onClick={e => {
            e.stopPropagation();
            onDeleteTodo?.(todo.id);
          }}
          className="flex h-8 w-6 flex-shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
        >
          <RiCloseLine className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
