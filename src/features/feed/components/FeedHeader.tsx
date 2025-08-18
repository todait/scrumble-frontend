'use client';

import { RiArrowDownSFill } from '@remixicon/react';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

interface FeedHeaderProps {
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
}

export function FeedHeader({ selectedDate, onDateChange }: FeedHeaderProps) {
  const formattedDate = format(selectedDate, 'M월 d일 EEEE', { locale: ko });
  const isToday = isSameDay(selectedDate, new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const today = new Date();

  // 날짜 피커 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isPickerOpen]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange?.(date);
      setIsPickerOpen(false);
    }
  };

  const handleTodayClick = () => {
    onDateChange?.(new Date());
    setIsPickerOpen(false);
  };

  return (
    <div className="overflow-visible rounded-t-2xl border-b border-[rgba(34,34,34,0.08)] bg-white px-[30px] py-5">
      <div className="flex items-center justify-between">
        <div className="relative flex items-center gap-3">
          <button
            ref={buttonRef}
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="flex items-center gap-1 text-[18px] font-bold text-[#222222] transition-all hover:opacity-80"
          >
            {formattedDate}
            <RiArrowDownSFill
              className={`h-5 w-5 transition-transform duration-200 ${
                isPickerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* 오늘로 돌아가기 버튼 */}
          {!isToday && (
            <button
              onClick={handleTodayClick}
              className="flex items-center gap-1 text-sm font-medium text-[#9747FF] transition-colors hover:text-[#7C3AED]"
            >
              🗓️ 오늘로 돌아가기
            </button>
          )}

          {/* 날짜 피커 드롭다운 */}
          {isPickerOpen && (
            <div
              ref={pickerRef}
              className="absolute left-0 top-full z-50 mt-2 rounded-lg bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]"
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ko}
                weekStartsOn={1}
                showOutsideDays={false}
                className="p-3"
                today={today}
                defaultMonth={selectedDate}
                disabled={date => {
                  // 미래 날짜 비활성화
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const targetDate = new Date(date);
                  targetDate.setHours(0, 0, 0, 0);
                  return targetDate > today;
                }}
                modifiersClassNames={{
                  selected: 'rdp-day_selected',
                  today: 'rdp-day_today custom-today',
                  disabled: 'rdp-day_disabled',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
