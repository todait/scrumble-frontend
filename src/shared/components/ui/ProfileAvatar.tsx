'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileAvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

/**
 * 프로필 아바타 컴포넌트
 * Vercel 배포 환경에서 외부 프로필 이미지 표시 최적화
 * randomuser.me 이미지가 로드되지 않을 때 기본 아바타 표시
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  alt,
  size = 40,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 기본 아바타 생성 함수 (이니셜 기반)
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

  // 에러가 발생했거나 src가 없을 때 기본 아바타 표시
  if (!src || hasError) {
    return (
      <div
        className={`
          ${defaultAvatar.bgColor} 
          flex items-center justify-center 
          text-white font-semibold 
          rounded-full 
          ${className}
        `}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title={alt}
      >
        {defaultAvatar.initials}
      </div>
    );
  }

  // 프로덕션 환경에서 randomuser.me 이미지는 일반 img 태그 사용
  if (process.env.NODE_ENV === 'production' && src.includes('randomuser.me')) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {!isLoaded && (
          <div
            className={`
              ${defaultAvatar.bgColor} 
              absolute inset-0 
              flex items-center justify-center 
              text-white font-semibold 
              rounded-full 
              ${className}
            `}
            style={{ fontSize: size * 0.4 }}
          >
            {defaultAvatar.initials}
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`
            rounded-full object-cover 
            ${className}
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ 
            width: size, 
            height: size,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
    );
  }

  // 개발 환경이나 다른 도메인은 Next.js Image 컴포넌트 사용
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!isLoaded && (
        <div
          className={`
            ${defaultAvatar.bgColor} 
            absolute inset-0 
            flex items-center justify-center 
            text-white font-semibold 
            rounded-full 
            ${className}
          `}
          style={{ fontSize: size * 0.4 }}
        >
          {defaultAvatar.initials}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`
          rounded-full object-cover 
          ${className}
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ 
          transition: 'opacity 0.3s ease-in-out'
        }}
        onLoad={handleLoad}
        onError={handleError}
        priority={size > 100} // 큰 이미지만 우선 로딩
      />
    </div>
  );
};

export default ProfileAvatar;