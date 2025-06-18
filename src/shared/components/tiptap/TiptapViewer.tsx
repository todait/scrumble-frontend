'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import React from 'react';

const lowlight = createLowlight(common);

interface TiptapViewerProps {
  content: string;
  className?: string;
}

export const TiptapViewer: React.FC<TiptapViewerProps> = ({ content, className = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-md p-4 my-4 overflow-x-auto font-mono text-sm',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content ? JSON.parse(content) : '',
    editable: false, // 읽기 전용
    immediatelyRender: false, // SSR 오류 해결
    editorProps: {
      attributes: {
        class: 'tiptap-viewer focus:outline-none',
      },
    },
  });

  if (!editor || !content) {
    return null;
  }

  return (
    <div className={`tiptap-viewer-wrapper ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
