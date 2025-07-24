'use client';

import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { loadTodoExtensions } from '../extensions';
import { useOptimizedEditor } from '../hooks/useOptimizedEditor';
import { useAccessibleEditor } from '../hooks/useAccessibleEditor';
import type { TodoEditorProps } from '../tiptap.types';
import type { Extension } from '@tiptap/core';
import '../styles/tiptap.css';

export const TodoEditor: React.FC<TodoEditorProps> = ({
  value,
  onChange,
  placeholder = '투두를 입력하세요...',
  className = '',
  onFocus,
  onBlur,
  disabled = false,
  autoFocus = false,
  onSubmit,
  enableMentions = false,
  mentionConfig,
}) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);

  // 동적으로 확장 로드
  useEffect(() => {
    loadTodoExtensions(
      placeholder,
      enableMentions ? mentionConfig?.suggestions : undefined,
      enableMentions ? mentionConfig?.onMentionSelect : undefined
    ).then(loadedExtensions => {
      setExtensions(loadedExtensions);
      setExtensionsLoaded(true);
    });
  }, [placeholder, enableMentions, mentionConfig?.suggestions, mentionConfig?.onMentionSelect]);

  const editor = useOptimizedEditor({
    extensions,
    content: value,
    editable: !disabled,
    autofocus: autoFocus,
    extensionsLoaded,
    editorProps: {
      attributes: {
        class: `tiptap-editor tiptap-editor--todo ${className}`,
      },
      handleKeyDown: (view, event) => {
        // Enter로 제출
        if (event.key === 'Enter' && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        
        // 줄바꿈 방지
        if (event.key === 'Enter') {
          event.preventDefault();
          return true;
        }
        
        return false;
      },
      handlePaste: (view, event) => {
        // 붙여넣기 시 줄바꿈 문자 제거
        const text = event.clipboardData?.getData('text/plain');
        if (text && text.includes('\n')) {
          event.preventDefault();
          const cleanText = text.replace(/[\r\n]+/g, ' ');
          view.dispatch(
            view.state.tr.insertText(cleanText)
          );
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // 줄바꿈 태그 제거
      const singleLineHtml = html.replace(/<\/p><p>/g, ' ').replace(/<br\s*\/?>/g, ' ');
      onChange(singleLineHtml);
    },
    onFocus: onFocus,
    onBlur: onBlur,
  });

  // 값이 외부에서 변경될 때 에디터 동기화
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // disabled 상태 동기화
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // 접근성 지원
  useAccessibleEditor({
    editor,
    ariaLabel: '할 일 입력 에디터',
    ariaDescribedBy: 'todo-editor-description',
  });

  // 확장이 로드되기 전에는 로딩 상태 표시
  if (!extensionsLoaded || !editor) {
    return (
      <div className={`tiptap-editor tiptap-editor--todo tiptap-editor--loading ${className}`}>
        <span className="text-gray-400 text-sm">로딩 중...</span>
      </div>
    );
  }

  return (
    <>
      <EditorContent editor={editor} />
      <span id="todo-editor-description" className="sr-only">
        할 일을 입력하는 에디터입니다. Enter로 추가할 수 있습니다.
      </span>
    </>
  );
};