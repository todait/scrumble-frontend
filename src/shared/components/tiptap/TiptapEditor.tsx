'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { getDefaultExtensions } from './extensions';
import { TiptapFloatingToolbar } from './TiptapFloatingToolbar';
import type { TiptapEditorProps } from './types';
import './styles/tiptap.css';

export const TiptapEditor = ({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  disabled = false,
  editable = true,
  minHeight = 240,
  maxHeight,
  extensions: customExtensions = [],
  className = '',
  onEditorClick,
  onFocus,
  onBlur,
  onKeyDown,
}: TiptapEditorProps) => {
  const editor: Editor | null = useEditor({
    immediatelyRender: typeof window !== 'undefined',
    extensions: [...getDefaultExtensions(placeholder), ...customExtensions],
    content,
    editable: editable && !disabled,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        'data-placeholder': placeholder,
      },
      handleDOMEvents: {
        mousedown: () => {
          if (!disabled) {
            editor?.commands.focus();
          }
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        if (onKeyDown) {
          return onKeyDown(event, editor!);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        const text = editor.getText();
        onChange(json, text, editor);
      }
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable && !disabled);
    }
  }, [editable, disabled, editor]);

  if (!editor) {
    return (
      <div
        className={`tiptap-editor-wrapper ${className}`}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="p-[10px] text-gray-400">{placeholder}</div>
      </div>
    );
  }

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <div
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflow: maxHeight ? 'auto' : undefined,
        }}
        className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        onClick={(e) => {
          if (!disabled) {
            const target = e.target as HTMLElement;
            if (target.classList.contains('ProseMirror') || target.closest('.ProseMirror')) {
              onEditorClick?.();
            } else {
              editor?.commands.focus('end');
              onEditorClick?.();
            }
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
      {editor && editable && !disabled && <TiptapFloatingToolbar editor={editor} />}
    </div>
  );
};
