'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { clsx } from 'clsx';
import type { BaseTiptapEditorProps } from './tiptap.types';

const BaseTiptapEditor = forwardRef<{ editor: any }, BaseTiptapEditorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      className,
      extensions = [],
      editorProps = {},
      onFocus,
      onBlur,
      disabled = false,
      autoFocus = false,
      imageUploadConfig,
      mentionConfig,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions,
      content: value,
      editorProps: {
        attributes: {
          class: clsx(
            'tiptap-editor',
            'w-full',
            'focus:outline-none',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50',
            className
          ),
        },
        ...editorProps,
      },
      editable: !disabled,
      autofocus: autoFocus,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
      onFocus: ({ event }) => {
        if (onFocus) {
          onFocus();
        }
      },
      onBlur: ({ event }) => {
        if (onBlur) {
          onBlur();
        }
      },
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

    // placeholder 동기화
    useEffect(() => {
      if (editor && placeholder) {
        const placeholderExtension = editor.extensionManager.extensions.find(
          (ext) => ext.name === 'placeholder'
        );
        if (placeholderExtension) {
          placeholderExtension.options.placeholder = placeholder;
          editor.view.dispatch(editor.state.tr);
        }
      }
    }, [placeholder, editor]);

    // ref로 editor 인스턴스 노출
    useImperativeHandle(ref, () => ({
      editor,
    }));

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
      return () => {
        if (editor) {
          editor.destroy();
        }
      };
    }, [editor]);

    if (!editor) {
      return null;
    }

    return <EditorContent editor={editor} />;
  }
);

BaseTiptapEditor.displayName = 'BaseTiptapEditor';

export default BaseTiptapEditor;