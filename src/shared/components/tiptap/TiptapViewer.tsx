'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useMemo, useState, useEffect } from 'react';
import { getViewerExtensions } from './extensions';
import { extractTextFromJson } from './hooks/useTiptapContent';
import type { TiptapViewerProps, JSONContent } from './types';
import './styles/tiptap.css';

export const TiptapViewer = ({
  content,
  fallbackText,
  maxLength,
  className = '',
  expandText = '...더보기',
  initialExpanded = false,
  onExpandChange,
}: TiptapViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const normalizedContent = useMemo(() => {
    if (!content) return null;
    if (typeof content === 'string') {
      const s = content.trim();
      if (s.startsWith('{') || s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === 'object' && 'type' in parsed) {
            return parsed as JSONContent;
          }
        } catch {
          // Not a valid JSON, treat as plain text
        }
      }
      return content;
    }
    return content;
  }, [content]);

  const isJsonContent = useMemo(() => {
    return normalizedContent && typeof normalizedContent === 'object' && 'type' in normalizedContent;
  }, [normalizedContent]);

  const plainText = useMemo(() => {
    if (isJsonContent) {
      return extractTextFromJson(normalizedContent as JSONContent);
    }
    return (normalizedContent as string) || fallbackText || '';
  }, [normalizedContent, fallbackText, isJsonContent]);

  const shouldTruncate = !!maxLength && plainText.length > maxLength && !isExpanded;

  const displayContent = useMemo(() => {
    if (isJsonContent) {
      // Keep JSON to preserve styling; truncation is visual via CSS
      return normalizedContent as JSONContent;
    }
    // For plain strings, build a minimal doc
    const text = shouldTruncate ? plainText.slice(0, maxLength) : plainText;
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: text ? [{ type: 'text', text }] : [],
        },
      ],
    } as JSONContent;
  }, [isJsonContent, normalizedContent, shouldTruncate, plainText, maxLength]);

  const editor = useEditor({
    immediatelyRender: typeof window !== 'undefined',
    extensions: getViewerExtensions(),
    content: displayContent,
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap-viewer-content',
      },
    },
  });

  useEffect(() => {
    if (editor && displayContent) {
      editor.commands.setContent(displayContent);
    }
  }, [displayContent, editor]);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  if (!content && !fallbackText) {
    return null;
  }

  return (
    <div className={`tiptap-viewer-wrapper ${className}`}>
      <div className={shouldTruncate && isJsonContent ? 'tiptap-clamped' : ''}>
        <EditorContent editor={editor} />
      </div>
      {shouldTruncate && (
        <button
          onClick={handleExpand}
          className="ml-1 text-[15px] font-medium text-[#A0A0A0] hover:text-[#808080] inline"
        >
          {expandText}
        </button>
      )}
    </div>
  );
};
