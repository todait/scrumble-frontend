'use client';

import { useEffect, useRef, useState } from 'react';
import { TodoEditor } from '@/shared/components/tiptap/components/TodoEditor';
import type { MentionUser } from '@/shared/components/tiptap/tiptap.types';

export interface TodoInputProps {
  /** 새 투두 추가 콜백 */
  onAddTodo: (text: string, continueInserting?: boolean) => void;
  /** 포커스 상태 */
  isFocused: boolean;
  /** 포커스 획득 콜백 */
  onFocus: () => void;
  /** 포커스 해제 콜백 */
  onBlur: () => void;
  /** 맨 아래 기본 TodoInput인지 여부 */
  isBottomInput?: boolean;
}

export function TodoInput({
  onAddTodo,
  isFocused,
  onFocus,
  onBlur,
  isBottomInput = false,
}: TodoInputProps) {
  const [inputText, setInputText] = useState('');
  const [isEscPressed, setIsEscPressed] = useState(false);
  
  // 멘션을 위한 사용자 목록 (실제 구현 시 props로 받거나 상태 관리에서 가져옴)
  const mentionUsers: MentionUser[] = [];

  // 포커스 상태 변경 시 처리
  useEffect(() => {
    if (!isFocused) {
      // 포커스가 해제되면 입력 텍스트 초기화
      setInputText('');
      setIsEscPressed(false);
    }
  }, [isFocused]);

  const handleSubmit = (continueInserting = false) => {
    const trimmedText = inputText.trim();
    if (trimmedText) {
      onAddTodo(trimmedText, continueInserting);
      setInputText(''); // 입력 필드 초기화 (Enter 시에는 즉시 초기화)
    }
  };

  const handleTodoSubmit = () => {
    if (isBottomInput) {
      // 맨 아래 TodoInput: 계속 입력 가능
      handleSubmit(true);
    } else {
      // 중간 TodoInput: 추가 후 포커스 해제
      handleSubmit(false);
      onBlur();
    }
  };

  const handleEscape = () => {
    // ESC: 입력 취소
    setIsEscPressed(true);
    onBlur();
  };

  const handleContainerClick = () => {
    if (!isFocused) {
      onFocus();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && !e.shiftKey) {
          if (!isFocused) {
            e.preventDefault();
            onFocus();
          }
        }
      }}
      className={`group relative flex h-9 cursor-text items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors ${
        isFocused ? 'border border-purple-400 bg-white' : ''
      }`}
    >
      {/* 보라색 원형 체크박스 */}
      <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-purple-400 opacity-50" />

      {/* 텍스트 입력 영역 */}
      <div className="min-w-0 flex-1">
        {isFocused ? (
          <TodoEditor
            value={inputText}
            onChange={setInputText}
            placeholder="투두를 입력하세요..."
            onSubmit={handleTodoSubmit}
            onBlur={() => {
              // ESC 키가 눌린 경우 자동 추가하지 않음
              if (!isEscPressed) {
                // 블러 시 입력된 텍스트가 있으면 자동으로 추가 (중간 삽입 해제)
                const trimmedText = inputText.trim();
                if (trimmedText) {
                  onAddTodo(trimmedText, false);
                }
              }
              onBlur();
            }}
            autoFocus={true}
            enableMentions={mentionUsers.length > 0}
            mentionConfig={
              mentionUsers.length > 0
                ? {
                    suggestions: mentionUsers,
                    onMentionSelect: (user) => {
                      console.log('Mentioned user:', user);
                    },
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex h-6 items-center px-2 py-1 text-sm leading-none text-gray-400">
            투두 추가
          </div>
        )}
      </div>
    </div>
  );
}
