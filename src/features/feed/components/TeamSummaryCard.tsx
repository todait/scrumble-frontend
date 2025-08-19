'use client';

import { RiHeart3Fill, RiPokerClubsFill, RiPokerDiamondsFill } from '@remixicon/react';
import type { TeamSummary } from '../types/feed.types';

interface TeamSummaryCardProps {
  summary: TeamSummary;
}

export function TeamSummaryCard({ summary }: TeamSummaryCardProps) {
  const { teamCondition, checkedInCount, totalMembers, checkedOutCount } = summary;
  const isAllCheckedIn = checkedInCount === totalMembers;
  const isAllCheckedOut = checkedOutCount === totalMembers;

  return (
    <div className="rounded-2xl border border-[rgba(34,34,34,0.08)] bg-white p-2.5">
      {/* 활동 요약 보기 버튼 */}
      <div className="flex w-[140px] flex-col gap-1 px-2 py-2.5">
        <span className="text-xs font-bold text-[#222222]">오늘의 활동 멤버: {totalMembers}명</span>
      </div>

      {/* 팀 컨디션 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">팀 컨디션</span>
        </div>
        <div className="flex items-center gap-1">
          <RiHeart3Fill className={`h-3.5 w-3.5 ${isAllCheckedIn ? 'text-[#9747FF]' : 'text-[#9999A2]'}`} />
          <span className="text-[15px] font-bold text-[#222222]">{teamCondition.toFixed(1)}점</span>
        </div>
      </div>

      {/* 체크인 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">체크인</span>
        </div>
        <div className="flex items-center gap-1">
          <RiPokerClubsFill className={`h-3.5 w-3.5 ${isAllCheckedIn ? 'text-[#39CD32]' : 'text-[#9999A2]'}`} />
          <span className="text-[15px] font-bold text-[#222222]">
            {isAllCheckedIn ? '모두 완료' : `${checkedInCount}/${totalMembers}`}
          </span>
        </div>
      </div>

      {/* 체크아웃 */}
      <div className="flex flex-col gap-1 px-2 py-2.5">
        <div className="flex items-center gap-0.5 opacity-50">
          <span className="text-xs text-[#222222]">체크아웃</span>
        </div>
        <div className="flex items-center gap-1">
          <RiPokerDiamondsFill className={`h-3.5 w-3.5 ${isAllCheckedOut ? 'text-[#009DFF]' : 'text-[#9999A2]'}`} />
          <span className="text-[15px] font-bold text-[#222222]">{checkedOutCount}명</span>
        </div>
      </div>
    </div>
  );
}
