'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

// 이미지 캐시 관리를 위한 Map
const imageCache = new Map<string, boolean>();

// 이미지 캐시 확인 및 프리로딩을 위한 커스텀 훅
const useImagePreload = (src?: string) => {
  const [isCached, setIsCached] = useState(() => {
    if (!src) return false;
    return imageCache.has(src);
  });
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    // 이미 캐시에 있으면 즉시 사용
    if (imageCache.has(src)) {
      setIsCached(true);
      setIsPreloaded(true);
      return;
    }

    // 새 이미지 프리로딩
    const img = new window.Image();
    img.src = src;

    // 이미 브라우저 캐시에 있는 경우
    if (img.complete && img.naturalWidth > 0) {
      imageCache.set(src, true);
      setIsCached(true);
      setIsPreloaded(true);
      return;
    }

    // 이미지 로드 이벤트
    img.onload = () => {
      imageCache.set(src, true);
      setIsCached(true);
      setIsPreloaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsPreloaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isCached, isPreloaded, hasError };
};

interface ProfileImageProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  variant?: 'square' | 'circle';
  skipLoadingState?: boolean;
}

export function ProfileImage({
  src,
  alt = 'Profile',
  size = 40,
  className = '',
  variant = 'square',
  skipLoadingState = false,
}: ProfileImageProps) {
  const { isCached, isPreloaded, hasError: preloadError } = useImagePreload(src);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(skipLoadingState || isCached);

  const textSize = size >= 48 ? 'text-lg' : size >= 32 ? 'text-sm' : 'text-xs';

  // 기본 아바타 생성 함수
  const generateDefaultAvatar = (name: string) => {
    const safeName = name || 'Unknown';
    const initials = safeName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const colorIndex = safeName.charCodeAt(0) % colors.length;

    return {
      initials,
      bgColor: colors[colorIndex],
    };
  };

  const handleError = () => {
    setImageLoadError(true);
    setIsImageLoaded(false);
  };

  const handleLoad = () => {
    setIsImageLoaded(true);
    setImageLoadError(false);
  };

  const defaultAvatar = generateDefaultAvatar(alt);
  const roundedClass = variant === 'circle' ? 'rounded-full' : 'rounded-lg';
  const borderClass = variant === 'square' ? 'border border-[rgba(34,34,34,0.08)]' : '';

  // 에러가 발생했거나 src가 없을 때 기본 아바타 표시
  const shouldShowDefault = !src || preloadError || imageLoadError;
  
  if (shouldShowDefault) {
    return (
      <div
        className={` ${defaultAvatar.bgColor} ${roundedClass} ${borderClass} flex items-center justify-center overflow-hidden font-semibold text-white ${textSize} ${className} `}
        style={{ width: size, height: size }}
        title={alt}
      >
        {defaultAvatar.initials}
      </div>
    );
  }

  // 캐시된 이미지는 즉시 표시
  const showImageImmediately = isPreloaded && src && !preloadError;
  
  return (
    <div
      className={`overflow-hidden ${roundedClass} ${borderClass} relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 로딩 중 플레이스홀더 - 캐시되지 않은 이미지만 표시 */}
      {!showImageImmediately && !isImageLoaded && !skipLoadingState && (
        <div
          className={`${defaultAvatar.bgColor} absolute inset-0 flex items-center justify-center font-semibold text-white ${textSize} animate-pulse`}
        >
          {defaultAvatar.initials}
        </div>
      )}

      {/* 프로덕션 환경에서 randomuser.me 이미지는 일반 img 태그 사용 */}
      {process.env.NODE_ENV === 'production' && src?.includes('randomuser.me') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${
            showImageImmediately || isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transition: showImageImmediately ? 'none' : 'opacity 0.3s ease-in-out',
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        src && (
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={`h-full w-full object-cover ${
              showImageImmediately || isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transition: showImageImmediately ? 'none' : 'opacity 0.3s ease-in-out',
            }}
            onLoad={handleLoad}
            onError={handleError}
            priority={showImageImmediately || size > 100}
            unoptimized={showImageImmediately ? true : undefined}
          />
        )
      )}
    </div>
  );
}
