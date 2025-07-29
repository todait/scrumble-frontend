'use client';

import type { Space } from '@/shared/types/space';
import { SpaceItem } from './SpaceItem';

interface SpaceListProps {
  spaces: Space[];
}

export function SpaceList({ spaces }: SpaceListProps) {
  if (spaces.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
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
    <div className="space-y-3">
      {spaces.map((space) => (
        <SpaceItem key={space.id} space={space} />
      ))}
    </div>
  );
}