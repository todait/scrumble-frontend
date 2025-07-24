import type { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface UseOptimizedEditorOptions {
  extensions: Extension[];
  content: string;
  editable?: boolean;
  autofocus?: boolean;
  editorProps?: any;
  onUpdate?: (props: { editor: Editor }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  extensionsLoaded: boolean;
}

/**
 * 최적화된 에디터 훅
 * - 메모리 누수 방지를 위한 적절한 정리
 * - 한글 입력 시 성능 최적화
 * - 불필요한 리렌더링 방지
 */
export function useOptimizedEditor(options: UseOptimizedEditorOptions) {
  const {
    extensions,
    content,
    editable = true,
    autofocus = false,
    editorProps,
    onUpdate,
    onFocus,
    onBlur,
    extensionsLoaded,
  } = options;

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComposingRef = useRef(false);
  const [editorKey, setEditorKey] = useState(0);

  // 기본 확장 (Schema 에러 방지) - 메모이제이션으로 무한 루프 방지
  const defaultExtensions = useMemo(() => [Document, Paragraph, Text], []);
  const finalExtensions = useMemo(() => {
    return extensionsLoaded && extensions.length > 0 ? extensions : defaultExtensions;
  }, [extensionsLoaded, extensions, defaultExtensions]);

  // 에디터 인스턴스 생성
  const editor = useEditor(
    {
      extensions: finalExtensions,
      content,
      editable,
      autofocus,
      immediatelyRender: false, // SSR 환경에서 hydration mismatch 방지
      editorProps: {
        ...editorProps,
        handleDOMEvents: {
          ...editorProps?.handleDOMEvents,
          // 한글 입력 최적화를 위한 compositionstart/end 처리
          compositionstart: () => {
            isComposingRef.current = true;
            return false;
          },
          compositionend: () => {
            isComposingRef.current = false;
            return false;
          },
        },
      },
      onUpdate: props => {
        // 한글 입력 중에는 업데이트 디바운스
        if (isComposingRef.current) {
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            onUpdate?.(props);
          }, 100);
        } else {
          onUpdate?.(props);
        }
      },
      onFocus,
      onBlur,
      onCreate: ({ editor }) => {
        // 에디터가 생성되었을 때 로그
        console.log('Editor created with extensions:', finalExtensions.length);
      },
    },
    [finalExtensions, editorKey, extensionsLoaded]
  );

  // 에디터 인스턴스 정리
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // 에디터 정리
      setTimeout(() => {
        editor?.destroy();
      }, 0);
    };
  }, [editor]);

  // extensions 변경 시 에디터 재생성 - 조건을 더 엄격하게
  useEffect(() => {
    if (extensionsLoaded && extensions.length > 0) {
      setEditorKey(prev => prev + 1);
    }
  }, [extensionsLoaded, extensions]);

  // 메모리 누수 방지를 위한 추가 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      editor?.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor]);

  return editor;
}
