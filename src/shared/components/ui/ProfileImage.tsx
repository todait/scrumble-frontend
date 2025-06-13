'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  variant?: 'square' | 'circle'; // 사각형 또는 원형
}

export function ProfileImage({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  variant = 'square'
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const textSize = size >= 48 ? 'text-lg' : size >= 32 ? 'text-sm' : 'text-xs';
  
  // 기본 아바타 생성 함수
  const generateDefaultAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    // 이름 기반으로 배경색 생성
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    
    return {
      initials,
      bgColor: colors[colorIndex]
    };
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const defaultAvatar = generateDefaultAvatar(alt);
  const roundedClass = variant === 'circle' ? 'rounded-full' : 'rounded-lg';
  const borderClass = variant === 'square' ? 'border border-[rgba(34,34,34,0.08)]' : '';

  // 에러가 발생했거나 src가 없을 때 기본 아바타 표시
  if (!src || hasError) {
    return (
      <div
        className={`
          ${defaultAvatar.bgColor} 
          ${roundedClass}
          ${borderClass}
          flex items-center justify-center 
          text-white font-semibold 
          overflow-hidden
          ${textSize}
          ${className}
        `}
        style={{ width: size, height: size }}
        title={alt}
      >
        {defaultAvatar.initials}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${roundedClass} ${borderClass} relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 로딩 중 플레이스홀더 */}
      {!isLoaded && (
        <div
          className={`
            ${defaultAvatar.bgColor} 
            absolute inset-0 
            flex items-center justify-center 
            text-white font-semibold 
            ${textSize}
          `}
        >
          {defaultAvatar.initials}
        </div>
      )}
      
      {/* 프로덕션 환경에서 randomuser.me 이미지는 일반 img 태그 사용 */}
      {process.env.NODE_ENV === 'production' && src.includes('randomuser.me') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`
            h-full w-full object-cover
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ 
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={`
            h-full w-full object-cover
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ 
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleLoad}
          onError={handleError}
          priority={size > 100}
        />
      )}
    </div>
  );
}