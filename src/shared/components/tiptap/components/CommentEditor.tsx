'use client';

import { EditorContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { loadCommentExtensions } from '../extensions';
import { useOptimizedEditor } from '../hooks/useOptimizedEditor';
import { useAccessibleEditor } from '../hooks/useAccessibleEditor';
import type { CommentEditorProps } from '../tiptap.types';
import type { Extension } from '@tiptap/core';
import '../styles/tiptap.css';

export const CommentEditor: React.FC<CommentEditorProps> = ({
  value,
  onChange,
  placeholder = '댓글을 입력하세요...',
  className = '',
  onFocus,
  onBlur,
  disabled = false,
  autoFocus = false,
  mode,
  minLines = 1,
  maxLines = 5,
  onSubmit,
  onCancel,
  imageUploadHook,
  enableImageUpload = true,
  mentionConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);

  // 동적으로 확장 로드
  useEffect(() => {
    loadCommentExtensions(
      placeholder,
      mentionConfig?.suggestions,
      mentionConfig?.onMentionSelect
    ).then(loadedExtensions => {
      setExtensions(loadedExtensions);
      setExtensionsLoaded(true);
    });
  }, [placeholder, mentionConfig?.suggestions, mentionConfig?.onMentionSelect]);
  
  const editor = useOptimizedEditor({
    extensions,
    content: value,
    editable: !disabled,
    autofocus: autoFocus,
    extensionsLoaded,
    editorProps: {
      attributes: {
        class: `tiptap-editor tiptap-editor--comment ${className}`,
      },
      handleKeyDown: (view, event) => {
        // Enter로 제출 (Shift+Enter는 줄바꿈)
        if (event.key === 'Enter' && !event.shiftKey && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        
        // Escape로 취소 (수정 모드에서만)
        if (event.key === 'Escape' && mode === 'edit' && onCancel) {
          event.preventDefault();
          onCancel();
          return true;
        }
        
        return false;
      },
      handlePaste: (view, event) => {
        // 이미지 붙여넣기 처리
        if (enableImageUpload && imageUploadHook && event.clipboardData) {
          const items = Array.from(event.clipboardData.items || []);
          const imageItems = items.filter(item => item.type.startsWith('image/'));
          
          if (imageItems.length > 0) {
            event.preventDefault();
            const files = imageItems
              .map(item => item.getAsFile())
              .filter((file): file is File => file !== null);
            
            if (files.length > 0) {
              imageUploadHook.uploadImages(files);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        // 이미지 드래그앤드롭 처리
        if (enableImageUpload && imageUploadHook && event.dataTransfer) {
          const files = Array.from(event.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
          );
          
          if (files.length > 0) {
            event.preventDefault();
            imageUploadHook.uploadImages(files);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // 동적 높이 조절
      if (containerRef.current) {
        const editorElement = containerRef.current.querySelector('.ProseMirror');
        if (editorElement) {
          // 높이 자동 조절
          const scrollHeight = editorElement.scrollHeight;
          const lineHeight = parseInt(window.getComputedStyle(editorElement).lineHeight);
          const minHeight = lineHeight * minLines;
          const maxHeight = lineHeight * maxLines;
          
          const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
          (editorElement as HTMLElement).style.height = `${newHeight}px`;
        }
      }
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

  // 수정 모드에서 초기 포커스
  useEffect(() => {
    if (mode === 'edit' && editor && autoFocus) {
      editor.commands.focus('end');
    }
  }, [mode, editor, autoFocus]);

  // 접근성 지원
  useAccessibleEditor({
    editor,
    ariaLabel: mode === 'edit' ? '댓글 수정 에디터' : '댓글 작성 에디터',
    ariaDescribedBy: 'comment-editor-description',
  });

  // 확장이 로드되기 전에는 로딩 상태 표시
  if (!extensionsLoaded || !editor) {
    return (
      <div ref={containerRef} className={`tiptap-editor tiptap-editor--comment tiptap-editor--loading ${className}`}>
        <div className="text-gray-400 p-2 text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef}>
        <EditorContent editor={editor} />
      </div>
      <span id="comment-editor-description" className="sr-only">
        {mode === 'edit' 
          ? '댓글을 수정하는 에디터입니다. Enter로 저장, Shift+Enter로 줄바꿈, Escape로 취소할 수 있습니다.'
          : '댓글을 작성하는 에디터입니다. Enter로 제출, Shift+Enter로 줄바꿈할 수 있습니다.'
        }
      </span>
    </>
  );
};