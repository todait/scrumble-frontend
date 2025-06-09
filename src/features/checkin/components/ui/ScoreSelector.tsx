'use client';

import { useState } from 'react';

interface ScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

const getScoreTooltip = (score: number) => {
  const tooltips = {
    1: '😵‍💫 오늘은 완전히 방전',
    2: '💢 버겁지만 끝까지',
    3: '🌀 헤맸다. 포기는 안함',
    4: '🐌 쪼끔 답답한 하루',
    5: '🎈 조용히 흐름 타는 중',
    6: '🪴 평온함 만끽하기',
    7: '🎵 리듬 좀 탔다 오늘',
    8: '🔥 오늘 집중력 기대됨',
    9: '🔮 이대로 착착 풀려라',
    10: '🌟 완벽한 하루',
  };
  return tooltips[score as keyof typeof tooltips];
};

export const ScoreSelector = ({ value, onChange }: ScoreSelectorProps) => {
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const handleScoreSelect = (score: number) => {
    if (value === score) {
      onChange(0);
    } else {
      onChange(score);
    }
  };

  return (
    <div className="px-8">
      <div className="relative flex h-20 items-center">
        <div className="absolute left-[5%] right-[5%] top-1/2 h-1 -translate-y-1/2 transform rounded bg-gray-100" />
        <div className="relative z-10 flex w-full items-center justify-between">
          {Array.from({ length: 10 }, (_, i) => {
            const score = i + 1;
            const isHovered = score === hoveredScore;
            const isSelected = score === value;

            return (
              <div key={score} className="relative">
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 transform">
                    <div className="whitespace-nowrap rounded bg-[#F4F4F4]/90 px-[13px] py-3 text-center text-[13px] text-black">
                      {getScoreTooltip(score)}
                      <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-[#F4F4F4]/90" />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleScoreSelect(score)}
                  onMouseEnter={() => setHoveredScore(score)}
                  onMouseLeave={() => setHoveredScore(null)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                >
                  {(isHovered || isSelected) && (
                    <div className="absolute inset-0 scale-125 rounded-full bg-purple-200/40 transition-all duration-200" />
                  )}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : isHovered
                          ? 'border-purple-300 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    {score}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};