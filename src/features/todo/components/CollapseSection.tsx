'use client';

import { RiArrowDownSLine } from '@remixicon/react';
import { CollapseSectionProps } from '../types';

export function CollapseSection({
  title,
  isCollapsed,
  onToggleCollapse,
  children,
  headerContent,
  className = '',
}: CollapseSectionProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
      onClick={e => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'border-b-0' : 'border-b border-gray-200'
        } bg-gray-50`}
        onClick={e => {
          e.stopPropagation();
          onToggleCollapse();
        }}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-gray-600 opacity-75">{title}</div>
          {headerContent}
        </div>

        <button
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 opacity-50 transition-all duration-300 ease-in-out hover:opacity-100 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        >
          <RiArrowDownSLine className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* 콘텐츠 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
        }`}
      >
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
