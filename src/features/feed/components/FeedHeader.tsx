'use client';

import { RiArrowDownSFill, RiFlashlightFill } from '@remixicon/react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FeedHeaderProps {
  selectedDate: Date;
  activeUsers: number;
  onDateClick?: () => void;
}

export function FeedHeader({ selectedDate, activeUsers, onDateClick }: FeedHeaderProps) {
  const formattedDate = format(selectedDate, 'M월 d일 EEEE', { locale: ko });

  return (
    <div className="rounded-t-2xl border-b border-[rgba(34,34,34,0.08)] bg-white px-[30px] py-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onDateClick}
          className="flex items-center gap-1 text-[18px] font-bold text-[#222222] hover:opacity-80"
        >
          {formattedDate}
          <RiArrowDownSFill className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-0.5 opacity-50">
          <RiFlashlightFill className="h-3 w-3 text-[#222222]" />
          <span className="text-xs font-bold text-[#222222]">오늘 {activeUsers}명 활동 중</span>
        </div>
      </div>
    </div>
  );
}
