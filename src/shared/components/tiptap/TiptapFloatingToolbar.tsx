'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiUnderline,
  RiListUnordered,
  RiListOrdered,
  RiLink,
  RiLinkUnlink,
  RiCodeSSlashLine,
  RiDoubleQuotesL,
} from '@remixicon/react';

interface TiptapFloatingToolbarProps {
  editor: Editor;
}

export const TiptapFloatingToolbar = ({ editor }: TiptapFloatingToolbarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    try {
      if (!editor.view || !editor.view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection || !editor.view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      const { from: startPos } = editor.view.state.selection;
      const start = editor.view.coordsAtPos(startPos);
      const editorRect = editor.view.dom.getBoundingClientRect();

      const toolbarHeight = 48;
      const top = start.top - editorRect.top - toolbarHeight - 8;
      const left = start.left - editorRect.left;

      setPosition({ top, left });
      setIsVisible(true);
    } catch (error) {
      // Editor may have been destroyed
      setIsVisible(false);
    }
  }, [editor]);

  useEffect(() => {
    const handleUpdate = () => {
      updatePosition();
    };

    const handleSelectionUpdate = () => {
      updatePosition();
    };

    const handleFocus = () => {
      updatePosition();
    };

    const handleBlur = () => {
      setTimeout(() => {
        try {
          if (editor.view && !editor.view.hasFocus()) {
            setIsVisible(false);
          }
        } catch (error) {
          // Editor may have been destroyed
          setIsVisible(false);
        }
      }, 100);
    };

    if (!editor || !editor.view) {
      return;
    }

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      if (editor && editor.off) {
        editor.off('update', handleUpdate);
        editor.off('selectionUpdate', handleSelectionUpdate);
        editor.off('focus', handleFocus);
        editor.off('blur', handleBlur);
      }
    };
  }, [editor, updatePosition]);

  const handleLinkAdd = () => {
    const url = window.prompt('링크 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!isVisible) return null;

  const buttons = [
    {
      icon: RiBold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      label: 'Bold (Ctrl+B)',
    },
    {
      icon: RiItalic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      label: 'Italic (Ctrl+I)',
    },
    {
      icon: RiUnderline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      label: 'Underline (Ctrl+U)',
    },
    {
      icon: RiStrikethrough,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      label: 'Strike through',
    },
    'divider',
    {
      icon: RiCodeSSlashLine,
      onClick: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      label: 'Code',
    },
    {
      icon: RiDoubleQuotesL,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      label: 'Blockquote',
    },
    'divider',
    {
      icon: RiListUnordered,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      label: 'Bullet List',
    },
    {
      icon: RiListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      label: 'Ordered List',
    },
    'divider',
    {
      icon: RiLink,
      onClick: handleLinkAdd,
      isActive: editor.isActive('link'),
      label: 'Add Link',
    },
    {
      icon: RiLinkUnlink,
      onClick: () => editor.chain().focus().unsetLink().run(),
      isActive: false,
      label: 'Remove Link',
      disabled: !editor.isActive('link'),
    },
  ];

  return (
    <div
      className="tiptap-floating-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {buttons.map((button, index) => {
        if (button === 'divider') {
          return <div key={`divider-${index}`} className="tiptap-toolbar-divider" />;
        }

        if (typeof button === 'string') {
          return null;
        }

        const ButtonIcon = button.icon;
        return (
          <button
            key={index}
            onClick={button.onClick}
            className={button.isActive ? 'is-active' : ''}
            title={button.label}
            disabled={button.disabled}
            type="button"
          >
            <ButtonIcon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};
