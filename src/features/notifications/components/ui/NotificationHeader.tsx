'use client';

import type { NotificationCategory, NotificationFilter } from '@/shared/types/notification';
import { RiFlashlightFill } from '@remixicon/react';
import { CategoryFilter } from './CategoryFilter';

interface NotificationHeaderProps {
  spaceSlug: string;
  currentFilter: NotificationFilter;
  onCategoryChange: (category: NotificationCategory | 'all') => void;
  onMarkAllAsRead: () => Promise<void>;
  isMarkingAllAsRead: boolean;
  unreadCount: number;
  totalCount?: number;
}

export function NotificationHeader({
  spaceSlug,
  currentFilter,
  onCategoryChange,
  onMarkAllAsRead,
  isMarkingAllAsRead,
  unreadCount,
  totalCount = 0,
}: NotificationHeaderProps) {
  const handleCategoryChange = (category: NotificationCategory | 'all') => {
    onCategoryChange(category);
  };

  return (
    <header
      className="overflow-visible rounded-t-2xl border-b border-[rgba(34,34,34,0.08)] bg-white px-[30px] py-5"
      role="banner"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-[#222222]" id="notifications-title">
            알림
          </h1>
          <CategoryFilter
            currentFilter={currentFilter.category || 'all'}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <div
          className="flex items-center gap-0.5 opacity-50"
          role="status"
          aria-live="polite"
          aria-label="알림 개수"
        >
          <RiFlashlightFill className="h-3 w-3 text-[#222222]" aria-hidden="true" />
          <span className="text-xs font-bold text-[#222222]">
            {unreadCount > 0 ? `읽지 않음 ${unreadCount}개` : `전체 ${totalCount}개`}
          </span>
        </div>
      </div>
    </header>
  );
}
