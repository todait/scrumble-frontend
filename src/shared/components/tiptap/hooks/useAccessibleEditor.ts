import type { Editor } from '@tiptap/react';
import { useEffect } from 'react';

interface UseAccessibleEditorProps {
  editor: Editor | null;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
}

/**
 * 에디터 접근성 향상을 위한 훅
 * - 스크린 리더 지원
 * - 키보드 탐색 개선
 * - ARIA 속성 설정
 */
export function useAccessibleEditor({
  editor,
  ariaLabel,
  ariaDescribedBy,
  role = 'textbox',
}: UseAccessibleEditorProps) {
  useEffect(() => {
    if (!editor) return;

    // 에디터가 완전히 마운트될 때까지 기다림
    const timer = setTimeout(() => {
      if (!editor.view || !editor.view.dom || editor.isDestroyed) return;

      const editorElement = editor.view.dom as HTMLElement;

      // ARIA 속성 설정
      if (ariaLabel) {
        editorElement.setAttribute('aria-label', ariaLabel);
      }

      if (ariaDescribedBy) {
        editorElement.setAttribute('aria-describedby', ariaDescribedBy);
      }

      // 기본 ARIA 속성
      editorElement.setAttribute('role', role);
      editorElement.setAttribute('aria-multiline', 'true');
      editorElement.setAttribute('aria-autocomplete', 'none');

      // 편집 가능 상태 표시
      editorElement.setAttribute('aria-readonly', editor.isEditable ? 'false' : 'true');

      // 키보드 탐색 개선
      if (!editorElement.hasAttribute('tabindex')) {
        editorElement.setAttribute('tabindex', '0');
      }

      // 포커스 이벤트 처리
      const handleFocus = () => {
        editorElement.setAttribute('aria-activedescendant', 'true');
      };

      const handleBlur = () => {
        editorElement.removeAttribute('aria-activedescendant');
      };

      editorElement.addEventListener('focus', handleFocus);
      editorElement.addEventListener('blur', handleBlur);

      // 정리 함수를 별도로 저장
      return () => {
        editorElement.removeEventListener('focus', handleFocus);
        editorElement.removeEventListener('blur', handleBlur);
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [editor, ariaLabel, ariaDescribedBy, role]);

  // 에디터 상태 변경 시 ARIA 속성 업데이트
  useEffect(() => {
    if (!editor) return;

    const updateAriaAttributes = () => {
      if (!editor.view || !editor.view.dom || editor.isDestroyed) return;

      const editorElement = editor.view.dom as HTMLElement;
      editorElement.setAttribute('aria-readonly', editor.isEditable ? 'false' : 'true');

      // 콘텐츠가 비어있는지 표시
      const isEmpty = editor.state.doc.textContent.trim() === '';
      editorElement.setAttribute('aria-invalid', isEmpty ? 'true' : 'false');
    };

    // 초기 설정
    const timer = setTimeout(updateAriaAttributes, 100);

    editor.on('update', updateAriaAttributes);
    editor.on('selectionUpdate', updateAriaAttributes);

    return () => {
      clearTimeout(timer);
      editor.off('update', updateAriaAttributes);
      editor.off('selectionUpdate', updateAriaAttributes);
    };
  }, [editor]);
}
