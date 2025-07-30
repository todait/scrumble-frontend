'use client';

import Image from 'next/image';

import type { Space } from '@/shared/types/space';
import { useSpaceLogin } from '@/shared/hooks/auth/useSpaceLogin';
import { SpaceEnterButton } from './ui/SpaceEnterButton';

interface SpaceItemProps {
  space: Space;
}

export function SpaceItem({ space }: SpaceItemProps) {
  const { loginToSpace, isLoading } = useSpaceLogin();

  const handleEnterSpace = () => {
    loginToSpace(space.slug, space.name);
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm">
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
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
          <p className="text-sm text-gray-500">
            멤버 {space.members.length}명 • 
            {space.members.find(member => member.role === 'owner')?.name || '소유자 없음'}가 관리
          </p>
        </div>
      </div>

      {/* 입장 버튼 */}
      <SpaceEnterButton
        onClick={handleEnterSpace}
        isLoading={isLoading}
      />
    </div>
  );
}