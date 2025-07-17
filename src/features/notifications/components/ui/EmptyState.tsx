'use client';

import type { NotificationCategory } from '@/shared/types/notification';
import { RiNotificationLine } from '@remixicon/react';

interface EmptyStateProps {
  category: NotificationCategory | 'all';
  isFiltered?: boolean;
}

export function EmptyState({ category, isFiltered = false }: EmptyStateProps) {
  const getEmptyMessage = () => {
    if (isFiltered) {
      return {
        title: '조건에 맞는 알림이 없습니다',
        description: '필터를 변경하거나 다른 카테고리를 확인해보세요.',
      };
    }

    switch (category) {
      case 'all':
        return {
          title: '아직 알림이 없습니다',
          description: '새로운 활동이나 공지사항이 있으면 여기에 표시됩니다.',
        };
      case 'activity':
        return {
          title: '활동 알림이 없습니다',
          description: '댓글, 이모지 반응, 멘션 등의 활동이 있으면 여기에 표시됩니다.',
        };
      case 'notice':
        return {
          title: '공지사항이 없습니다',
          description: '스페이스 공지사항이나 중요한 업데이트가 있으면 여기에 표시됩니다.',
        };
      case 'feed':
        return {
          title: '피드 알림이 없습니다',
          description: '체크인, 체크아웃 등의 피드 활동이 있으면 여기에 표시됩니다.',
        };
      default:
        return {
          title: '알림이 없습니다',
          description: '새로운 알림이 있으면 여기에 표시됩니다.',
        };
    }
  };

  const { title, description } = getEmptyMessage();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="mb-4 rounded-full bg-[#F8F9FA] p-3 md:p-4">
        <RiNotificationLine className="h-6 w-6 text-[#9CA3AF] md:h-8 md:w-8" />
      </div>

      <h3 className="mb-2 text-base font-semibold text-[#222222] md:text-lg">{title}</h3>
      <p className="max-w-xs text-center text-xs text-[#6B7280] md:text-sm">{description}</p>

      {isFiltered && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 min-h-[44px] touch-manipulation rounded-lg px-4 py-2 text-xs text-[#9747FF] transition-colors hover:bg-[#F8F9FA] hover:text-[#7C3AED] md:text-sm"
        >
          모든 알림 보기
        </button>
      )}
    </div>
  );
}
