'use client';

import { RiArrowDownSLine, RiCheckLine, RiSparkling2Fill } from '@remixicon/react';
import { CollapseSectionProps } from '../types';

export function CollapseSection({
  title,
  isCollapsed,
  onToggleCollapse,
  children,
  headerContent,
  className = '',
  isPostContent = false,
  completionRate = 0,
  completedCount = 0,
  totalCount = 0,
  isEditMode = false,
}: CollapseSectionProps) {
  // PostContent 전용 디자인
  if (isPostContent) {
    // 편집 모드일 때는 100% 스타일 비활성화
    const isComplete = completionRate === 100 && !isEditMode;
    
    // 전체를 감싸는 wrapper로 통합된 border 처리
    return (
      <div
        className={`overflow-hidden ${className} ${
          isCollapsed 
            ? 'rounded-xl' 
            : 'rounded-xl'
        } ${
          isComplete
            ? 'border-4 border-white/20 bg-gradient-to-r from-purple-600/80 to-purple-400/80'
            : 'border border-[rgba(29,29,31,0.08)] bg-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className={`cursor-pointer transition-all duration-300 ease-in-out ${
            isCollapsed ? 'p-[10px]' : 'px-[10px] pt-[10px] pb-0'
          }`}
          onClick={e => {
            e.stopPropagation();
            onToggleCollapse();
          }}
        >
          {/* Container */}
          <div className="flex items-center gap-2 p-[10px]">
            {/* 아이콘 */}
            {isComplete ? (
              <RiSparkling2Fill className="h-4 w-4 flex-shrink-0 text-white" />
            ) : (
              <RiCheckLine className="h-4 w-4 flex-shrink-0 text-[#9747FF]" />
            )}
            
            {/* 달성률 텍스트 */}
            <span 
              className={`text-[13px] font-bold leading-[120%] ${
                isComplete ? 'text-white' : 'text-[#1D1D1F]'
              }`}
            >
              {completionRate}% 달성
            </span>
            
            {/* 개수 텍스트 */}
            <span 
              className={`text-[13px] font-normal leading-[120%] ${
                isComplete ? 'text-white' : 'text-[#9999A2]'
              }`}
            >
              ({completedCount}/{totalCount})
            </span>
            
            {/* 진행바 */}
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-[rgba(153,153,162,0.2)]">
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${completionRate}%`,
                  background: isComplete 
                    ? '#FFFFFF' 
                    : 'linear-gradient(270deg, rgba(140, 75, 249, 0.90) 0%, rgba(180, 120, 247, 0.90) 100%)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 콘텐츠 - border와 border-radius 없이 */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
          }`}
        >
          <div 
            className={
              isComplete 
                ? 'px-3 pb-3 pt-0 [&_*]:!text-white [&_input]:!text-white [&_button]:!text-white [&_svg]:!text-white'
                : 'px-3 pb-3 pt-0'
            }
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // 기존 디자인 (다른 곳에서 사용)
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
      onClick={e => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div
        className={`flex cursor-pointer items-center justify-between p-3 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'border-b-0' : 'border-b border-gray-200'
        } bg-white`}
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