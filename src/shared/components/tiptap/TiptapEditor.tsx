'use client';

import {
  RiBold,
  RiCheckboxLine,
  RiCodeLine,
  RiH1,
  RiH2,
  RiH3,
  RiItalic,
  RiLinkM,
  RiListOrdered2,
  RiListUnordered,
  RiMarkPenLine,
  RiQuoteText,
  RiStrikethrough,
  RiTable2,
  RiUnderline,
} from '@remixicon/react';
import { CharacterCount } from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import React, { useCallback, useEffect } from 'react';

// Create a lowlight instance with common languages
const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

// MenuButton component for toolbar buttons
const MenuButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, isActive = false, disabled = false, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rounded p-1.5 transition-colors ${
      isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
  >
    {children}
  </button>
);

// Separator component
const Separator = () => <div className="mx-1 h-6 w-px bg-gray-300" />;

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  disabled = false,
  className = '',
  minHeight = '240px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: false,
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
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-[1rem] before:left-[1rem] before:text-gray-400 before:pointer-events-none',
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'space-y-2',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start',
        },
      }),
      CharacterCount,
    ],
    content: content ? JSON.parse(content) : '',
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg focus:outline-none ${minHeight}`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
    },
    editable: !disabled,
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content) {
      try {
        const currentContent = JSON.stringify(editor.getJSON());
        if (currentContent !== content) {
          editor.commands.setContent(JSON.parse(content));
        }
      } catch (error) {
        console.error('Failed to parse content:', error);
      }
    }
  }, [content, editor]);

  // Link dialog
  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bubble Menu */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      >
        {/* Text formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="굵게 (Cmd+B)"
        >
          <RiBold size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="기울임 (Cmd+I)"
        >
          <RiItalic size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="밑줄 (Cmd+U)"
        >
          <RiUnderline size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="취소선"
        >
          <RiStrikethrough size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="형광펜"
        >
          <RiMarkPenLine size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="인라인 코드"
        >
          <RiCodeLine size={18} />
        </MenuButton>

        <Separator />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <RiH1 size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <RiH2 size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <RiH3 size={18} />
        </MenuButton>

        <Separator />

        {/* Lists and blocks */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="글머리 기호"
        >
          <RiListUnordered size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="번호 매기기"
        >
          <RiListOrdered2 size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="체크리스트"
        >
          <RiCheckboxLine size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="인용구"
        >
          <RiQuoteText size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="코드 블록"
        >
          <RiCodeLine size={18} />
        </MenuButton>

        <Separator />

        {/* Links and tables */}
        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="링크">
          <RiLinkM size={18} />
        </MenuButton>

        <MenuButton
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="표 삽입"
        >
          <RiTable2 size={18} />
        </MenuButton>
      </BubbleMenu>

      {/* Editor content */}
      <div
        className={`rounded-lg border bg-white ${disabled ? 'cursor-not-allowed bg-gray-50' : ''} `}
      >
        <EditorContent editor={editor} className="p-4" />
      </div>

      {/* Character count */}
      <div className="mt-2 flex justify-end text-sm text-gray-500">
        {editor.storage.characterCount?.characters() || 0}자 /{' '}
        {editor.storage.characterCount?.words() || 0}단어
      </div>
    </div>
  );
};
