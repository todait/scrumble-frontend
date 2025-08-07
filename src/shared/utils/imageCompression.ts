/**
 * 이미지 압축 및 리사이즈 유틸리티
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
}

/**
 * 이미지 파일을 압축하고 리사이즈합니다
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 이미지 파일
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = 'jpeg'
  } = options;

  // GIF는 압축하지 않음 (애니메이션 보존)
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // 이미지가 이미 작으면 압축하지 않음
      if (width <= maxWidth && height <= maxHeight && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      // 비율 유지하면서 리사이즈
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // 압축 후 오히려 커졌다면 원본 반환
          if (blob.size > file.size) {
            resolve(file);
            return;
          }

          // 새 파일 생성
          const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
          const extension = format === 'webp' ? '.webp' : '.jpg';
          const fileName = file.name.replace(/\.[^/.]+$/, extension);
          
          const compressedFile = new File([blob], fileName, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        format === 'webp' ? 'image/webp' : 'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // 이미지 로드
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지의 크기 정보를 가져옵니다
 * @param file 이미지 파일
 * @returns 이미지 크기 정보
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}