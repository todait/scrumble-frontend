import { useCallback, useRef } from 'react';
import { extractImagesFromClipboard, hasImagesInClipboard } from '@/shared/utils/clipboard.utils';

interface UseClipboardImagePasteOptions {
  /**
   * 이미지 업로드 함수
   */
  onImagePaste: (files: File[]) => void;
  
  /**
   * 붙여넣기 전에 호출되는 콜백 (선택사항)
   * false를 반환하면 기본 붙여넣기 동작을 방지
   */
  onBeforePaste?: (event: ClipboardEvent) => boolean;
  
  /**
   * 에러 발생 시 호출되는 콜백 (선택사항)
   */
  onError?: (error: string) => void;
  
  /**
   * 붙여넣기 기능 활성화 여부 (기본값: true)
   */
  enabled?: boolean;
}

/**
 * 클립보드 이미지 붙여넣기 기능을 제공하는 훅
 * 
 * @example
 * ```tsx
 * const { textareaProps } = useClipboardImagePaste({
 *   onImagePaste: (files) => uploadImages(files),
 *   onError: (error) => alert(error),
 * });
 * 
 * return (
 *   <textarea {...textareaProps} />
 * );
 * ```
 */
export function useClipboardImagePaste(options: UseClipboardImagePasteOptions) {
  const {
    onImagePaste,
    onBeforePaste,
    onError,
    enabled = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!enabled) return;

    try {
      // 이미지가 클립보드에 있는지 확인
      if (!hasImagesInClipboard(event)) {
        return; // 이미지가 없으면 기본 붙여넣기 동작 허용
      }

      // 커스텀 onBeforePaste 콜백 실행
      if (onBeforePaste && !onBeforePaste(event)) {
        return; // false를 반환하면 처리 중단
      }

      // 기본 붙여넣기 동작 방지 (이미지가 텍스트로 붙여넣어지는 것을 방지)
      event.preventDefault();

      // 클립보드에서 이미지 파일들 추출
      const imageFiles = extractImagesFromClipboard(event);
      
      if (imageFiles.length === 0) {
        return;
      }

      // 이미지 업로드 함수 호출
      onImagePaste(imageFiles);

    } catch (error) {
      console.error('클립보드 이미지 처리 중 오류 발생:', error);
      
      if (onError) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : '이미지 붙여넣기 중 오류가 발생했습니다.';
        onError(errorMessage);
      }
    }
  }, [enabled, onImagePaste, onBeforePaste, onError]);

  // textarea나 다른 요소에 적용할 props
  const elementProps = {
    onPaste: (e: React.ClipboardEvent) => handlePaste(e.nativeEvent),
    ref: elementRef,
  };

  return {
    /**
     * textarea나 다른 요소에 적용할 props
     * 이 props를 spread해서 사용하면 자동으로 paste 이벤트가 연결됩니다.
     */
    elementProps,
    
    /**
     * 수동으로 paste 이벤트를 처리할 때 사용하는 핸들러
     */
    handlePaste,
    
    /**
     * 요소의 ref (필요한 경우 직접 접근)
     */
    elementRef,
  };
}

/**
 * textarea 전용 클립보드 이미지 붙여넣기 훅
 * useClipboardImagePaste의 타입 안전한 wrapper
 */
export function useTextareaClipboardImagePaste(options: UseClipboardImagePasteOptions) {
  const result = useClipboardImagePaste(options);
  
  return {
    ...result,
    textareaProps: result.elementProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    textareaRef: result.elementRef as React.RefObject<HTMLTextAreaElement>,
  };
}