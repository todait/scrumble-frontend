import { r2Service } from '@/shared/services/r2.service';
import type { ImageMetadata, UploadingImage } from '@/shared/types/upload.types';
import { convertHeicToJpeg, isHeicFile } from '@/shared/utils';
import { compressImage } from '@/shared/utils/imageCompression';
import { debug } from '@/shared/utils/debug';
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
  acceptedFormats = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ],
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
  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        // HEIC 파일은 확장자로도 허용 (MIME type이 정확하지 않을 수 있음)
        const isValidFormat = acceptedFormats.includes(file.type) || isHeicFile(file);

        if (!isValidFormat) {
          errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
        } else if (file.size > maxSize) {
          errors.push(`${file.name}: 파일 크기가 10MB를 초과합니다.`);
        } else if (uploadingImages.filter(img => !img.error).length + valid.length >= maxFiles) {
          errors.push(`${file.name}: 최대 ${maxFiles}개까지만 업로드 가능합니다.`);
        } else {
          // HEIC 파일에 대한 안내 메시지
          if (isHeicFile(file)) {
            debug('UPLOAD', `${file.name}: HEIC 파일을 JPEG로 변환합니다.`);
          }
          valid.push(file);
        }
      });

      return { valid, errors };
    },
    [acceptedFormats, maxSize, maxFiles, uploadingImages]
  );

  // 단일 이미지 업로드
  const uploadSingleImage = async (file: File, uploadId: string): Promise<ImageMetadata> => {
    try {
      // 1. 이미지 압축 (GIF 제외)
      let processedFile = file;
      if (file.type !== 'image/gif') {
        try {
          processedFile = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            format: 'jpeg'
          });
          debug('UPLOAD', `Image compressed: ${file.size} -> ${processedFile.size} bytes`);
        } catch (compressionError) {
          debug('UPLOAD', `Image compression failed, using original: ${compressionError}`);
          // 압축 실패 시 원본 사용
        }
      }

      // 2. Presigned URL 가져오기
      const { uploadUrl, publicUrl, key } = await r2Service.getPresignedUrl(processedFile.name, processedFile.type);

      // 3. 이미지 메타데이터 추출
      const imageMeta = await r2Service.getImageMetadata(processedFile);

      // 4. R2에 업로드
      await r2Service.uploadToR2(uploadUrl, processedFile, progress => {
        setUploadingImages(prev =>
          prev.map(img => (img.id === uploadId ? { ...img, progress } : img))
        );
      });

      // 5. 최종 메타데이터 생성
      const metadata: ImageMetadata = {
        url: publicUrl,
        key,
        size: processedFile.size,
        format: processedFile.type,
        name: processedFile.name,
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

      // 파일 처리 및 HEIC 변환
      const processedImages: UploadingImage[] = [];

      // 각 파일을 순차적으로 처리
      for (const file of valid) {
        const uniqueId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 11)}-${uploadIdCounter.current++}`;
        let processedFile = file;
        let preview = URL.createObjectURL(file);

        if (isHeicFile(file)) {
          // HEIC 파일 변환 중 상태 먼저 추가
          const convertingImage: UploadingImage = {
            id: uniqueId,
            file,
            preview,
            progress: 0,
            isConverting: true,
          };

          // 변환 중 상태를 즉시 표시
          setUploadingImages(prev => [...prev, convertingImage]);

          try {
            // HEIC 파일을 JPEG로 변환
            processedFile = await convertHeicToJpeg(file);

            // 이전 preview URL 정리
            URL.revokeObjectURL(preview);
            preview = URL.createObjectURL(processedFile);

            // 변환 완료 상태로 업데이트
            setUploadingImages(prev =>
              prev.map(img =>
                img.id === uniqueId
                  ? { ...img, file: processedFile, preview, isConverting: false }
                  : img
              )
            );

            // 업로드 대상 목록에 추가
            processedImages.push({
              id: uniqueId,
              file: processedFile,
              preview,
              progress: 0,
            });
          } catch (error) {
            // 변환 실패 시 에러 상태로 업데이트
            setUploadingImages(prev =>
              prev.map(img =>
                img.id === uniqueId
                  ? { ...img, error: `변환 실패: ${error}`, isConverting: false }
                  : img
              )
            );
            continue;
          }
        } else {
          // 일반 이미지 파일
          const normalImage: UploadingImage = {
            id: uniqueId,
            file: processedFile,
            preview,
            progress: 0,
          };

          // 일반 이미지는 즉시 추가
          setUploadingImages(prev => [...prev, normalImage]);
          processedImages.push(normalImage);
        }
      }

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
        // 처리된 이미지들만 업로드 큐에 전달 (에러가 없는 것들)
        const imagesToUpload = processedImages.filter(img => !img.error);
        if (imagesToUpload.length > 0) {
          const completedImages = await uploadQueue(imagesToUpload);
          if (completedImages.length > 0) {
            onUploadComplete?.(completedImages);
          }
        }
      } catch (error) {
        debug('UPLOAD', `Upload queue error: ${error}`);
      }
    },
    [validateFiles, onError, onUploadComplete]
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
    setUploadingImages(prev => {
      prev.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return [];
    });
  }, []);

  const isUploading = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100 && !img.error) || img.isConverting
  );

  const isConverting = uploadingImages.some(img => img.isConverting);
  const convertingCount = uploadingImages.filter(img => img.isConverting).length;

  const completedImages = uploadingImages
    .filter(img => img.metadata && !img.error)
    .map(img => img.metadata!);

  // 기존 이미지들을 동적으로 초기화하는 함수
  const initializeWithImages = useCallback((images: ImageMetadata[]) => {
    const existingImages: UploadingImage[] = images.map((img, index) => ({
      id: `existing-${img.url}-${index}`,
      file: new File([], img.name, { type: img.format }),
      preview: img.url,
      progress: 100,
      metadata: img,
    }));
    setUploadingImages(existingImages);
  }, []);

  return {
    uploadImages,
    uploadingImages,
    completedImages,
    removeImage,
    clearImages,
    isUploading,
    isConverting,
    convertingCount,
    initializeWithImages,
    // HEIC 지원 여부 체크
    isHeicSupported: typeof window !== 'undefined',
  };
}
