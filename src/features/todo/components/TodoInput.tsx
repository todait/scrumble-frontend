'use client';

import { useEffect, useRef, useState } from 'react';

export interface TodoInputProps {
  /** 새 투두 추가 콜백 */
  onAddTodo: (text: string, continueInserting?: boolean) => void;
  /** 포커스 상태 */
  isFocused: boolean;
  /** 포커스 획득 콜백 */
  onFocus: () => void;
  /** 포커스 해제 콜백 */
  onBlur: () => void;
}

export function TodoInput({ onAddTodo, isFocused, onFocus, onBlur }: TodoInputProps) {
  const [inputText, setInputText] = useState('');
  const [isEscPressed, setIsEscPressed] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // IME 조합 상태
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 포커스 상태 변경 시 textarea 포커스 처리
  useEffect(() => {
    if (isFocused && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    } else if (!isFocused) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME 조합 중일 때는 Enter 키 처리하지 않음
    if (isComposing && e.key === 'Enter') {
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enter: 추가 후 계속 입력 가능 (중간 삽입 유지)
        handleSubmit(true);
      } else {
        // Enter: 추가 후 포커스 해제
        handleSubmit(false);
        onBlur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      // ESC: 입력 취소
      setIsEscPressed(true);
      onBlur();
    }
  };

  // IME 조합 이벤트 핸들러
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 줄바꿈 문자를 공백으로 치환하여 단일 라인 유지
    const newValue = e.target.value.replace(/[\r\n]+/g, ' ');
    setInputText(newValue);
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
      className={`group relative flex h-9 cursor-text items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-purple-50 ${
        isFocused ? 'bg-purple-50 border border-purple-400' : ''
      }`}
    >
      {/* 보라색 원형 체크박스 */}
      <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-purple-400 opacity-50" />

      {/* 텍스트 입력 영역 */}
      <div className="min-w-0 flex-1">
        {isFocused ? (
          <textarea
            ref={textAreaRef}
            value={inputText}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
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
            onPaste={e => {
              // 붙여넣기 시에도 줄바꿈 방지
              e.preventDefault();
              const text = e.clipboardData.getData('text').replace(/[\r\n]+/g, ' ');
              const target = e.target as HTMLTextAreaElement;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const newValue = inputText.slice(0, start) + text + inputText.slice(end);
              setInputText(newValue);
            }}
            className="h-6 w-full resize-none border-none bg-transparent px-2 py-1.5 text-sm leading-tight text-[#222222] outline-none"
            placeholder="투두를 입력하세요..."
            rows={1}
          />
        ) : (
          <div className="flex h-6 items-center px-2 py-1.5 text-sm leading-tight text-gray-400">
            투두 추가
          </div>
        )}
      </div>
    </div>
  );
}