'use client';

import { RiArrowDownSLine } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import type { FilterType } from '../types/feed.types';

interface FilterDropdownProps {
  value: FilterType;
  onChange: (value: FilterType) => void;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'checkin', label: '체크인' },
  { value: 'checkout', label: '체크아웃' },
];

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = filterOptions.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full p-1"
      >
        <span className="text-[15px] font-bold text-[#222222]">{selectedOption?.label}</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F1F1] opacity-50">
          <RiArrowDownSLine className="h-5 w-5 text-black" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 min-w-[120px] rounded-lg bg-white py-1 shadow-lg">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm text-[#222222] hover:bg-gray-100 ${
                option.value === value ? 'bg-gray-50 font-semibold' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
