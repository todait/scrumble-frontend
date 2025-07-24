'use client';

import type { Extension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Document } from '@tiptap/extension-document';
import { History } from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Text } from '@tiptap/extension-text';
import { EditorContent } from '@tiptap/react';
import { useEffect, useMemo, useState } from 'react';
import { AutoLink } from '../extensions/AutoLink';
import { createMentionConfig } from '../extensions/CustomMention';
import { useAccessibleEditor } from '../hooks/useAccessibleEditor';
import { useOptimizedEditor } from '../hooks/useOptimizedEditor';
import '../styles/tiptap.css';
import type { PostFormEditorProps } from '../tiptap.types';

export const PostFormEditor: React.FC<PostFormEditorProps> = ({
  value,
  onChange,
  placeholder = '오늘 하루는 어떠셨나요? 팀원들과 나누고 싶은 이야기를 들려주세요.',
  className = '',
  onFocus,
  onBlur,
  disabled = false,
  autoFocus = false,
  onSubmit,
  imageUploadHook,
  mentionConfig,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 마운트
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 정적으로 확장 구성 (메모이제이션으로 안정적인 참조 제공)
  const extensions = useMemo(() => {
    const baseExtensions: Extension[] = [
      Document as any,
      Paragraph as any,
      Text as any,
      History as any,
      Bold.configure({
        HTMLAttributes: {
          class: 'font-bold',
        },
      }) as any,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-5 space-y-1',
        },
      }) as any,
      ListItem.configure({
        HTMLAttributes: {
          class: 'leading-normal',
        },
      }) as any,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }) as any,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#9747FF] underline cursor-pointer hover:opacity-80',
        },
      }) as any,
      AutoLink as any,
    ];

    // 멘션 확장 추가 (필요한 경우만)
    if (mentionConfig?.suggestions && mentionConfig.suggestions.length > 0) {
      baseExtensions.push(
        createMentionConfig(mentionConfig.suggestions, mentionConfig.onMentionSelect) as any
      );
    }

    return baseExtensions;
  }, [placeholder, mentionConfig?.suggestions, mentionConfig?.onMentionSelect]);

  const editor = useOptimizedEditor({
    extensions,
    content: value,
    editable: !disabled,
    autofocus: autoFocus,
    extensionsLoaded: true, // 정적 로딩이므로 항상 true
    editorProps: {
      attributes: {
        class: `tiptap-editor tiptap-editor--post-form ${className}`,
      },
      handleKeyDown: (view: any, event: KeyboardEvent) => {
        // Cmd/Meta + Enter로 제출
        if (event.key === 'Enter' && event.metaKey && onSubmit) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
      handlePaste: (view: any, event: ClipboardEvent) => {
        // 이미지 붙여넣기 처리
        if (imageUploadHook && event.clipboardData) {
          const items = Array.from(event.clipboardData.items || []);
          const imageItems = items.filter((item: DataTransferItem) =>
            item.type.startsWith('image/')
          );

          if (imageItems.length > 0) {
            event.preventDefault();
            const files = imageItems
              .map((item: DataTransferItem) => item.getAsFile())
              .filter((file): file is File => file !== null);

            if (files.length > 0) {
              imageUploadHook.uploadImages(files);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view: any, event: DragEvent) => {
        // 이미지 드래그앤드롭 처리
        if (imageUploadHook && event.dataTransfer) {
          const files = Array.from(event.dataTransfer.files).filter((file: File) =>
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
    },
    onFocus: onFocus,
    onBlur: onBlur,
  });

  // 값이 외부에서 변경될 때 에디터 동기화 (마운트된 후에만)
  useEffect(() => {
    if (editor && isMounted && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isMounted]);

  // disabled 상태 동기화 (마운트된 후에만)
  useEffect(() => {
    if (editor && isMounted) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor, isMounted]);

  // 접근성 지원 (마운트된 후에만)
  useAccessibleEditor({
    editor: isMounted ? editor : null,
    ariaLabel: '게시물 작성 에디터',
    ariaDescribedBy: 'post-form-editor-description',
  });

  // SSR에서는 플레이스홀더, 클라이언트에서 에디터가 준비되기 전에는 로딩 상태
  if (!isMounted || !editor) {
    return (
      <div className={`tiptap-editor tiptap-editor--post-form tiptap-editor--loading ${className}`}>
        <div className="flex min-h-[240px] items-center justify-center p-4 text-gray-400">
          {!isMounted ? '에디터 준비 중...' : '에디터 로딩 중...'}
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      <EditorContent editor={editor} />
      <span id="post-form-editor-description" className="sr-only">
        오늘 하루의 소감을 작성하는 에디터입니다. Cmd+Enter로 제출할 수 있습니다.
      </span>
    </div>
  );
};
