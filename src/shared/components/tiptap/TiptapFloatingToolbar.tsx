'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { createPortal } from 'react-dom';

interface TiptapFloatingToolbarProps {
  editor: Editor;
}

export const TiptapFloatingToolbar = ({ editor }: TiptapFloatingToolbarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback(() => {
    try {
      if (!isMounted || !editor.view || !editor.view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection || !editor.view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const toolbarHeight = toolbarRef.current?.offsetHeight ?? 48;
      const toolbarWidth = toolbarRef.current?.offsetWidth ?? 0;

      const selectionTop = Math.min(start.top, end.top);
      const selectionBottom = Math.max(start.bottom, end.bottom);

      let top = selectionTop - toolbarHeight - 8;
      if (top < 8) {
        top = selectionBottom + 8;
      }

      let left = start.left;
      if (toolbarWidth > 0) {
        const viewportWidth = window.innerWidth;
        const maxLeft = viewportWidth - toolbarWidth - 8;
        left = Math.min(left, maxLeft);
      }
      left = Math.max(left, 8);

      setPosition({ top, left });
      setIsVisible(true);
    } catch (error) {
      // Editor may have been destroyed
      setIsVisible(false);
    }
  }, [editor, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleRealtimePositionUpdate = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleRealtimePositionUpdate);
    window.addEventListener('scroll', handleRealtimePositionUpdate, true);

    return () => {
      window.removeEventListener('resize', handleRealtimePositionUpdate);
      window.removeEventListener('scroll', handleRealtimePositionUpdate, true);
    };
  }, [isVisible, updatePosition]);

  const handleLinkAdd = () => {
    const url = window.prompt('링크 URL을 입력하세요:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!isMounted || !isVisible) return null;

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

  const toolbar = (
    <div
      ref={toolbarRef}
      className="tiptap-floating-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={e => {
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

  return typeof document !== 'undefined' ? createPortal(toolbar, document.body) : null;
};
