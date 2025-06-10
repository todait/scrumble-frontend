'use client';

import {
  RiArrowRightSLine,
  RiHeart3Fill,
  RiPokerClubsFill,
  RiPokerDiamondsFill,
  RiQuestionLine,
} from '@remixicon/react';
import type { TeamSummary } from '../types/feed.types';

interface TeamSummaryCardProps {
  summary: TeamSummary;
  onViewSummaryClick?: () => void;
}

export function TeamSummaryCard({ summary, onViewSummaryClick }: TeamSummaryCardProps) {
  const { teamCondition, checkedInCount, totalMembers, checkedOutCount } = summary;
  const isAllCheckedIn = checkedInCount === totalMembers;

  return (
    <div className="rounded-2xl border border-[rgba(34,34,34,0.08)] bg-white p-2.5">
      {/* 활동 요약 보기 버튼 */}
      <button
        onClick={onViewSummaryClick}
        className="flex w-full items-center justify-between rounded-lg p-2.5 hover:bg-gray-50"
      >
        <span className="text-xs font-bold text-[#222222]">활동 요약 보기</span>
        <RiArrowRightSLine className="h-4 w-4 text-[#222222]" />
      </button>

      {/* 팀 컨디션 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">팀 컨디션</span>
          <RiQuestionLine className="h-2.5 w-2.5 text-[#222222]" />
        </div>
        <div className="flex items-center gap-1">
          <RiHeart3Fill className="h-3.5 w-3.5 text-[#9747FF]" />
          <span className="text-[15px] font-bold text-[#222222]">{teamCondition.toFixed(1)}점</span>
        </div>
      </div>

      {/* 체크인 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">체크인</span>
          <RiQuestionLine className="h-2.5 w-2.5 text-[#222222]" />
        </div>
        <div className="flex items-center gap-1">
          <RiPokerClubsFill className="h-3.5 w-3.5 text-[#39CD32]" />
          <span className="text-[15px] font-bold text-[#222222]">
            {isAllCheckedIn ? '모두 완료' : `${checkedInCount}/${totalMembers}`}
          </span>
        </div>
      </div>

      {/* 체크아웃 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">체크아웃</span>
          <RiQuestionLine className="h-2.5 w-2.5 text-[#222222]" />
        </div>
        <div className="flex items-center gap-1">
          <RiPokerDiamondsFill className="h-3.5 w-3.5 text-[#009DFF]" />
          <span className="text-[15px] font-bold text-[#222222]">{checkedOutCount}명</span>
        </div>
      </div>
    </div>
  );
}
