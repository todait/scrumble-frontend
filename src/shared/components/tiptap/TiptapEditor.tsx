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
  RiPaletteLine,
  RiQuoteText,
  RiStrikethrough,
  RiUnderline,
} from '@remixicon/react';
import { CharacterCount } from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
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
  onTextAreaClick?: () => void;
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
      isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    {children}
  </button>
);

// Separator component
const Separator = () => <div className="mx-1 h-5 w-px bg-gray-300" />;

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  disabled = false,
  className = '',
  minHeight = '240px',
  onTextAreaClick,
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
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-md p-4 my-4 overflow-x-auto font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
        emptyEditorClass:
          'cursor-text before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: '',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: '',
        },
      }),
      CharacterCount,
    ],
    content: content ? JSON.parse(content) : '',
    editorProps: {
      attributes: {
        class: `prose focus:outline-none relative text-gray-900`,
        style: `padding: 1rem; color: #111827; height: 100%; box-sizing: border-box; font-size: 15px;`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
    },
    editable: !disabled,
    immediatelyRender: false, // SSR 오류 해결
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
        tippyOptions={{
          duration: 100,
          placement: 'top',
          maxWidth: 'none',
        }}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-lg"
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

        {editor.isActive('highlight') && (
          <select
            value={editor.getAttributes('highlight').color || '#fef08a'}
            onChange={e => {
              if (e.target.value === 'none') {
                editor.chain().focus().unsetHighlight().run();
              } else {
                editor.chain().focus().setHighlight({ color: e.target.value }).run();
              }
            }}
            className="ml-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
          >
            <option value="#fef08a">🟡 노란색</option>
            <option value="#86efac">🟢 초록색</option>
            <option value="#fbbf24">🟠 주황색</option>
            <option value="none">❌ 제거</option>
          </select>
        )}

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="인라인 코드"
        >
          <RiCodeLine size={18} />
        </MenuButton>

        <Separator />

        <MenuButton onClick={() => {}} isActive={false} title="텍스트 색상">
          <RiPaletteLine
            size={18}
            style={{ color: editor.getAttributes('textStyle').color || '#000000' }}
          />
        </MenuButton>

        <select
          value={editor.getAttributes('textStyle').color || 'default'}
          onChange={e => {
            if (e.target.value === 'default') {
              editor.chain().focus().unsetColor().run();
            } else {
              editor.chain().focus().setMark('textStyle', { color: e.target.value }).run();
            }
          }}
          className="ml-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
        >
          <option value="default">⚫ 기본</option>
          <option value="#dc2626">🔴 빨강</option>
          <option value="#2563eb">🔵 파랑</option>
          <option value="#16a34a">🟢 초록</option>
        </select>

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

        {editor.isActive('codeBlock') && (
          <select
            value={editor.getAttributes('codeBlock').language || 'javascript'}
            onChange={e => {
              editor
                .chain()
                .focus()
                .updateAttributes('codeBlock', { language: e.target.value })
                .run();
            }}
            className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="yaml">YAML</option>
          </select>
        )}

        <Separator />

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="링크">
          <RiLinkM size={18} />
        </MenuButton>
      </BubbleMenu>

      {/* Editor content */}
      <div
        className={`rounded-lg bg-white ${disabled ? 'cursor-not-allowed bg-gray-50' : ''} `}
        style={{ height: minHeight }}
        onClick={onTextAreaClick}
      >
        <EditorContent editor={editor} className="h-full overflow-y-auto" />
      </div>
    </div>
  );
};
