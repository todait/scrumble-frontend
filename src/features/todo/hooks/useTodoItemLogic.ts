import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTodoItemLogicProps {
  todoId: string;
  todoName: string;
  isEditing: boolean;
  onTextChange: (todoId: string, text: string) => void;
  onFinishEdit?: (todoId: string) => void;
  onDeleteTodo?: (todoId: string, enterEditMode?: boolean) => void;
  onAddTodo?: (afterTodoId: string) => void;
}

export function useTodoItemLogic({
  todoId,
  todoName,
  isEditing,
  onTextChange,
  onFinishEdit,
  onDeleteTodo,
  onAddTodo,
}: UseTodoItemLogicProps) {
  const [editText, setEditText] = useState(todoName);
  const [isComposing, setIsComposing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }
  }, [isEditing]);

  // 편집 텍스트 동기화
  useEffect(() => {
    if (isEditing) {
      setEditText(todoName);
    }
  }, [isEditing, todoId, todoName]);

  const handleTextSubmit = useCallback(() => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      onDeleteTodo?.(todoId, true);
    } else if (trimmedText !== todoName) {
      setEditText(trimmedText);
      onTextChange(todoId, trimmedText);
    }
    setTimeout(() => {
      onFinishEdit?.(todoId);
    }, 0);
  }, [editText, todoId, todoName, onTextChange, onFinishEdit, onDeleteTodo]);

  const handleEscapeSubmit = useCallback(() => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      onDeleteTodo?.(todoId, true);
    } else if (trimmedText !== todoName) {
      onTextChange(todoId, trimmedText);
    }
    setTimeout(() => {
      onFinishEdit?.(todoId);
    }, 0);
  }, [editText, todoId, todoName, onTextChange, onFinishEdit, onDeleteTodo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
            onAddTodo?.(todoId);
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
        onDeleteTodo?.(todoId, true);
        onFinishEdit?.(todoId);
      }
    },
    [isComposing, editText, todoId, handleTextSubmit, handleEscapeSubmit, onAddTodo, onDeleteTodo, onFinishEdit]
  );

  const handleTextAreaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 줄바꿈 문자를 공백으로 치환하여 단일 라인 유지
    const newValue = e.target.value.replace(/[\r\n]+/g, ' ');
    setEditText(newValue);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').replace(/[\r\n]+/g, ' ');
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = editText.slice(0, start) + text + editText.slice(end);
      setEditText(newValue);
    },
    [editText]
  );

  return {
    editText,
    textAreaRef,
    setIsComposing,
    handleTextSubmit,
    handleKeyDown,
    handleTextAreaChange,
    handlePaste,
  };
}