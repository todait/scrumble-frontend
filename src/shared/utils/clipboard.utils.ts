/**
 * 클립보드 관련 유틸리티 함수들
 */

// 지원되는 이미지 MIME 타입들
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
] as const;

/**
 * 파일이 지원되는 이미지 타입인지 확인
 */
export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type as any);
}

/**
 * 클립보드 이벤트에서 이미지 파일들을 추출
 * @param event ClipboardEvent 객체
 * @returns 이미지 파일 배열
 */
export function extractImagesFromClipboard(event: ClipboardEvent): File[] {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return [];

  const files: File[] = [];
  
  // clipboardData.files에서 이미지 파일만 필터링
  for (let i = 0; i < clipboardData.files.length; i++) {
    const file = clipboardData.files[i];
    if (isImageFile(file)) {
      files.push(file);
    }
  }

  // clipboardData.items에서도 확인 (스크린샷 등)
  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i];
    
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file && isImageFile(file)) {
        // 중복 제거
        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && 
          existingFile.size === file.size &&
          existingFile.type === file.type
        );
        
        if (!isDuplicate) {
          files.push(file);
        }
      }
    }
  }

  return files;
}

/**
 * 클립보드 이벤트에 이미지가 포함되어 있는지 확인
 * @param event ClipboardEvent 객체
 * @returns 이미지가 포함되어 있으면 true
 */
export function hasImagesInClipboard(event: ClipboardEvent): boolean {
  const images = extractImagesFromClipboard(event);
  return images.length > 0;
}