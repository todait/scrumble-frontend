import { r2Service } from '@/shared/services/r2.service';
import type { ImageMetadata, UploadingImage } from '@/shared/types/upload.types';
import { useCallback, useRef, useState } from 'react';

interface UseImageUploadOptions {
  maxSize?: number;
  maxFiles?: number;
  acceptedFormats?: string[];
  initialImages?: ImageMetadata[];
  onUploadComplete?: (images: ImageMetadata[]) => void;
  onError?: (error: string) => void;
}

export function useImageUpload({
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  initialImages = [],
  onUploadComplete,
  onError,
}: UseImageUploadOptions = {}) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>(() => {
    // 초기 이미지들을 UploadingImage 형태로 변환
    return initialImages.map((img, index) => ({
      id: `initial-${index}`,
      file: new File([], img.name, { type: img.format }),
      preview: img.url,
      progress: 100,
      metadata: img,
    }));
  });
  const uploadIdCounter = useRef(0);

  // 파일 유효성 검사
  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (!acceptedFormats.includes(file.type)) {
        errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: 파일 크기가 10MB를 초과합니다.`);
      } else if (uploadingImages.filter(img => !img.error).length + valid.length >= maxFiles) {
        errors.push(`${file.name}: 최대 ${maxFiles}개까지만 업로드 가능합니다.`);
      } else {
        valid.push(file);
      }
    });

    return { valid, errors };
  }, [acceptedFormats, maxSize, maxFiles, uploadingImages]);

  // 단일 이미지 업로드
  const uploadSingleImage = async (file: File, uploadId: string): Promise<ImageMetadata> => {
    try {
      // 1. Presigned URL 가져오기
      const { uploadUrl, publicUrl, key } = await r2Service.getPresignedUrl(file.name, file.type);

      // 2. 이미지 메타데이터 추출
      const imageMeta = await r2Service.getImageMetadata(file);

      // 3. R2에 업로드
      await r2Service.uploadToR2(uploadUrl, file, progress => {
        setUploadingImages(prev =>
          prev.map(img => (img.id === uploadId ? { ...img, progress } : img))
        );
      });

      // 4. 최종 메타데이터 생성
      const metadata: ImageMetadata = {
        url: publicUrl,
        key,
        size: file.size,
        format: file.type,
        name: file.name,
        width: imageMeta.width || 0,
        height: imageMeta.height || 0,
      };

      return metadata;
    } catch (error) {
      throw new Error(`업로드 실패 ${error}`);
    }
  };

  // 이미지 업로드 처리
  const uploadImages = useCallback(
    async (files: File[]) => {
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        onError?.(errors.join('\n'));
      }

      if (valid.length === 0) return;

      const newUploadingImages: UploadingImage[] = [];

      for (const file of valid) {
        const id = `upload-${uploadIdCounter.current++}`;
        const preview = URL.createObjectURL(file);

        newUploadingImages.push({
          id,
          file,
          preview,
          progress: 0,
        });
      }

      setUploadingImages(prev => [...prev, ...newUploadingImages]);

      // 병렬 업로드 (최대 3개씩)
      const uploadQueue = async (images: UploadingImage[], concurrency = 3) => {
        const results: ImageMetadata[] = [];

        for (let i = 0; i < images.length; i += concurrency) {
          const batch = images.slice(i, i + concurrency);
          const batchPromises = batch.map(async img => {
            try {
              const metadata = await uploadSingleImage(img.file, img.id);

              setUploadingImages(prev =>
                prev.map(prevImg =>
                  prevImg.id === img.id ? { ...prevImg, metadata, progress: 100 } : prevImg
                )
              );

              return metadata;
            } catch (error) {
              setUploadingImages(prev =>
                prev.map(prevImg =>
                  prevImg.id === img.id
                    ? { ...prevImg, error: '업로드 실패', progress: 0 }
                    : prevImg
                )
              );
              throw error;
            } finally {
              URL.revokeObjectURL(img.preview);
            }
          });

          const batchResults = await Promise.allSettled(batchPromises);
          batchResults.forEach(result => {
            if (result.status === 'fulfilled') {
              results.push(result.value);
            }
          });
        }

        return results;
      };

      try {
        const completedImages = await uploadQueue(newUploadingImages);
        if (completedImages.length > 0) {
          onUploadComplete?.(completedImages);
        }
      } catch (error) {
        console.error('Upload queue error:', error);
      }
    },
    [uploadingImages, maxFiles, acceptedFormats, maxSize, onError, onUploadComplete]
  );

  // 이미지 제거
  const removeImage = useCallback((id: string) => {
    setUploadingImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  // 모든 이미지 초기화
  const clearImages = useCallback(() => {
    uploadingImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setUploadingImages([]);
  }, [uploadingImages]);

  const isUploading = uploadingImages.some(
    img => img.progress > 0 && img.progress < 100 && !img.error
  );

  const completedImages = uploadingImages
    .filter(img => img.metadata && !img.error)
    .map(img => img.metadata!);

  return {
    uploadImages,
    uploadingImages,
    completedImages,
    removeImage,
    clearImages,
    isUploading,
  };
}
