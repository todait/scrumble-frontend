'use client';

import Image from 'next/image';

interface ProfileImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ProfileImage({ src, alt, size = 40, className = '' }: ProfileImageProps) {
  const textSize = size >= 48 ? 'text-lg' : size >= 32 ? 'text-sm' : 'text-xs';
  
  return (
    <div
      className={`overflow-hidden rounded-lg border border-[rgba(34,34,34,0.08)] ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gray-200 font-semibold ${textSize}`}>
          {alt[0]}
        </div>
      )}
    </div>
  );
}