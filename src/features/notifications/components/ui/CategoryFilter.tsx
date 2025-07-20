'use client';

import type { NotificationCategory } from '@/shared/types/notification';
import { memo } from 'react';

interface CategoryFilterProps {
  currentFilter: NotificationCategory | 'all';
  onCategoryChange: (category: NotificationCategory | 'all') => void;
  categoryCount?: Record<string, number>;
}

const categoryOptions: (NotificationCategory | 'all')[] = ['all', 'activity', 'notice'];

const getCategoryLabel = (category: NotificationCategory | 'all'): string => {
  switch (category) {
    case 'all':
      return '전체';
    case 'activity':
      return '활동';
    case 'notice':
      return '공지';
    case 'feed':
      return '피드';
    default:
      return '전체';
  }
};

const CategoryFilter = memo(function CategoryFilter({
  currentFilter,
  onCategoryChange,
  categoryCount = {},
}: CategoryFilterProps) {
  return (
    <div
      className="flex items-center gap-1.5 md:gap-2"
      role="tablist"
      aria-label="알림 카테고리 필터"
    >
      {categoryOptions.map(category => {
        const isActive = currentFilter === category;
        const count = categoryCount[category] || 0;
        const label = getCategoryLabel(category);

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex min-h-[44px] touch-manipulation items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2 md:min-h-[36px] md:px-3 ${
              isActive
                ? 'scale-105 transform bg-[#9747FF] text-white'
                : 'hover:scale-102 bg-[#F1F1F1] text-[#222222] hover:bg-[#E5E5E5] active:bg-[#D1D1D1]'
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`notifications-${category.toLowerCase()}`}
            aria-label={`${label} 알림 필터${count > 0 ? `, ${count}개의 알림` : ''}`}
          >
            <span className="text-xs md:text-sm">{label}</span>
            {count > 0 && (
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 md:h-5 md:w-5 ${
                  isActive ? 'animate-pulse bg-white/20 text-white' : 'bg-[#9747FF] text-white'
                }`}
                aria-label={`${count}개의 알림`}
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

export { CategoryFilter };
