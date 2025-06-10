'use client';

import {
  RiHeart3Fill,
  RiPokerClubsFill,
  RiPokerDiamondsFill,
  RiQuestionLine,
} from '@remixicon/react';
import { useState } from 'react';
import { Tooltip } from './Tooltip';

interface TeamStatusCardProps {
  teamCondition: number;
  checkedInCount: number;
  checkedOutCount: number;
}

export const TeamStatusCard = ({
  teamCondition,
  checkedInCount,
  checkedOutCount,
}: TeamStatusCardProps) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const statusItems = [
    {
      key: 'condition',
      label: '팀 컨디션',
      tooltip: '팀원들의 평균 컨디션 점수입니다',
      icon: <RiHeart3Fill className="h-4 w-4 text-[#9747FF]" />,
      value: `${teamCondition}점`,
    },
    {
      key: 'checkin',
      label: '체크인',
      tooltip: '오늘 체크인을 완료한 팀원 수입니다',
      icon: <RiPokerClubsFill className="h-4 w-4 text-[#22C55E]" />,
      value: `${checkedInCount}명`,
    },
    {
      key: 'checkout',
      label: '체크아웃',
      tooltip: '업무를 마치고 체크아웃한 팀원 수입니다',
      icon: <RiPokerDiamondsFill className="h-4 w-4 text-[#3B82F6]" />,
      value: `${checkedOutCount}명`,
    },
  ];

  return (
    <div className="flex gap-4 py-[10px]">
      {statusItems.map(item => (
        <div key={item.key} className="flex-1 rounded-lg bg-[#FAFAFA] p-4">
          <div className="flex flex-col justify-center gap-1">
            <div className="flex items-center gap-1 opacity-50">
              <span className="text-xs text-[#222222]">{item.label}</span>
              <div
                className="relative"
                onMouseEnter={() => setHoveredTooltip(item.key)}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <RiQuestionLine className="h-3 w-3 cursor-help text-[#222222]" />
                <Tooltip text={item.tooltip} show={hoveredTooltip === item.key} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {item.icon}
              <span className="text-sm font-bold text-[#222222]">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};