'use client';

import type {
  NotificationCategory,
  NotificationFilter,
  UnreadCountByCategory,
} from '@/shared/types/notification';
import {
  RiCloseLine,
  RiHeart3Line,
  RiLayoutHorizontalLine,
  RiMegaphoneLine,
} from '@remixicon/react';

interface NotificationHeaderProps {
  spaceSlug: string;
  currentFilter: NotificationFilter;
  onCategoryChange: (category: NotificationCategory | 'all') => void;
  onMarkAllAsRead: () => Promise<void>;
  isMarkingAllAsRead: boolean;
  unreadCount: number;
  totalCount?: number;
  categoryUnreadCounts?: UnreadCountByCategory;
}

const categoryOptions: {
  key: NotificationCategory | 'all';
  label: string;
  icon: React.ComponentType<any>;
}[] = [
  { key: 'feed', label: '피드', icon: RiLayoutHorizontalLine },
  { key: 'activity', label: '활동', icon: RiHeart3Line },
  { key: 'notice', label: '공지', icon: RiMegaphoneLine },
];

export function NotificationHeader({
  currentFilter,
  onCategoryChange,
  categoryUnreadCounts,
}: NotificationHeaderProps) {
  const handleCategoryChange = (category: NotificationCategory | 'all') => {
    onCategoryChange(category);
  };

  const handleClearFilter = () => {
    onCategoryChange('all');
  };

  const currentCategory = currentFilter.category || 'all';
  const isFilterActive = currentCategory !== 'all';

  return (
    <header className="bg-white" role="banner">
      {/* 알림 타이틀 */}
      <div className="px-[30px] py-5">
        <h1 className="text-[18px] font-bold text-[#222222]" id="notifications-title">
          알림
        </h1>
      </div>

      {/* 첫 번째 divider */}
      <div className="h-px bg-[rgba(34,34,34,0.08)]"></div>

      {/* 카테고리 버튼들 */}
      <div className="px-[30px] py-4">
        <div className="flex items-center gap-3">
          {categoryOptions.map(({ key, label, icon: Icon }) => {
            const isActive = currentCategory === key;
            const categoryUnreadCount =
              key !== 'all' && categoryUnreadCounts ? categoryUnreadCounts[key] : 0;

            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2 ${
                  isActive
                    ? 'bg-[#9747FF] text-white'
                    : 'bg-[#FAFAFA] text-[#6E6E73] hover:bg-[rgba(34,34,34,0.04)]'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`notifications-${key}`}
                aria-label={`${label} 알림 필터`}
              >
                <Icon className="h-4 w-4" aria-hidden={true} />
                <span>{label}</span>
                {/* 읽지 않은 알림 표시 점 - 카테고리별 표시 */}
                {categoryUnreadCount > 0 && (
                  <div className="absolute right-1 top-1 h-[6px] w-[6px] rounded-full bg-[#9747FF]" />
                )}
              </button>
            );
          })}

          {/* X 버튼 - 필터가 활성화되었을 때만 표시 */}
          {isFilterActive && (
            <button
              onClick={handleClearFilter}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(34,34,34,0.08)] text-[#6E6E73] transition-all duration-200 hover:bg-[rgba(34,34,34,0.12)] focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2"
              aria-label="필터 해제"
            >
              <RiCloseLine className="h-4 w-4" aria-hidden={true} />
            </button>
          )}
        </div>
      </div>

      {/* 두 번째 divider */}
      <div className="h-px bg-[rgba(34,34,34,0.08)]"></div>

      {/* 20px 마진 */}
      <div className="h-5"></div>
    </header>
  );
}
