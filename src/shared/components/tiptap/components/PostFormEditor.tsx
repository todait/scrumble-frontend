'use client';

import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { loadPostFormExtensions } from '../extensions';
import { useOptimizedEditor } from '../hooks/useOptimizedEditor';
import { useAccessibleEditor } from '../hooks/useAccessibleEditor';
import type { PostFormEditorProps } from '../tiptap.types';
import type { Extension } from '@tiptap/core';
import '../styles/tiptap.css';

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
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [extensionsLoaded, setExtensionsLoaded] = useState(false);

  // 동적으로 확장 로드
  useEffect(() => {
    loadPostFormExtensions(
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
          const imageItems = items.filter((item: DataTransferItem) => item.type.startsWith('image/'));
          
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

  // 접근성 지원
  useAccessibleEditor({
    editor,
    ariaLabel: '게시물 작성 에디터',
    ariaDescribedBy: 'post-form-editor-description',
  });

  // 확장이 로드되기 전에는 로딩 상태 표시
  if (!extensionsLoaded || !editor) {
    return (
      <div className={`tiptap-editor tiptap-editor--post-form tiptap-editor--loading ${className}`}>
        <div className="text-gray-400 p-4">에디터 로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <EditorContent editor={editor} />
      <span id="post-form-editor-description" className="sr-only">
        오늘 하루의 소감을 작성하는 에디터입니다. Cmd+Enter로 제출할 수 있습니다.
      </span>
    </>
  );
};