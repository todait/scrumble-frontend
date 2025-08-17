'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

import type { Space } from '@/shared/types/space';
import { useSpaceLogin } from '@/shared/hooks/auth/useSpaceLogin';

interface SpaceItemProps {
  space: Space;
}

export function SpaceItem({ space }: SpaceItemProps) {
  const { loginToSpace, isLoading } = useSpaceLogin();

  const handleEnterSpace = () => {
    loginToSpace(space.slug, space.name);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 없음';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '날짜 없음';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일 개설`;
  };

  return (
    <button
      onClick={handleEnterSpace}
      disabled={isLoading}
      className="flex items-center justify-between w-full max-w-[580px] bg-white p-4 transition-all hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      {/* 스페이스 정보 */}
      <div className="flex items-center space-x-4">
        {/* 스페이스 아이콘 */}
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
          {space.iconURL ? (
            <Image
              src={space.iconURL}
              alt={`${space.name} 아이콘`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-lg">
              {space.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* 스페이스 정보 */}
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
          <p className="text-sm text-gray-500">
            {space.createdAt ? formatDate(space.createdAt) : '날짜 없음'} • {space.memberCount}명
          </p>
        </div>
      </div>

      {/* 입장 아이콘 */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#1D1D1F]/10 hover:bg-[#1D1D1F] hover:text-white transition-colors duration-200 text-[#222222] group-hover:bg-[#1D1D1F] group-hover:text-white">
        {isLoading ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <ArrowUpRight className="w-5 h-5" />
        )}  
      </div>
    </button>
  );
}