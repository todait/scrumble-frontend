'use client';

import type { Space } from '@/shared/types/space';
import { SpaceItem } from './SpaceItem';

interface SpaceListProps {
  spaces: Space[];
}

export function SpaceList({ spaces }: SpaceListProps) {
  if (spaces.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-[12px] border border-[#1D1D1F]/10 bg-gray-50">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium text-gray-600">
            참여 중인 스페이스가 없습니다
          </div>
          <div className="text-sm text-gray-500">
            새로운 스페이스를 만들거나 초대를 받아보세요
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {spaces.map((space, index) => (
        <div key={space.id} className="w-full flex flex-col items-center">
          <SpaceItem space={space} />
          {index < spaces.length - 1 && (
            <div className="w-full max-w-[580px] h-[1px] bg-[#1D1D1F]/10 my-4" />
          )}
        </div>
      ))}
    </div>
  );
}