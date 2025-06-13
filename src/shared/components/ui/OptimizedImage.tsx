'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackClassName?: string;
}

/**
 * Vercel 배포 환경에서 외부 이미지 로딩 최적화 컴포넌트
 * 이미지 로딩 실패 시 fallback 이미지를 표시
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  fallbackClassName,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // 프로덕션 환경에서 외부 이미지는 일반 img 태그 사용 (502 에러 방지)
  if (process.env.NODE_ENV === 'production' && typeof src === 'string' && src.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={hasError ? fallbackClassName || className : className}
        onError={handleError}
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  // 개발 환경이나 내부 이미지는 Next.js Image 컴포넌트 사용
  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={hasError ? fallbackClassName || className : className}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;