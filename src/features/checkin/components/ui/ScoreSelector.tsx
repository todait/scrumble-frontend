'use client';

import { useState } from 'react';

interface ScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

const getScoreTooltip = (score: number) => {
  const tooltips = {
    1: { emoji: '😵‍💫', text: '오늘은 완전히 방전' },
    2: { emoji: '💢', text: '버겁지만 끝까지' },
    3: { emoji: '🌀', text: '헤맸다. 포기는 안함' },
    4: { emoji: '🐌', text: '쪼끔 답답한 하루' },
    5: { emoji: '🎈', text: '조용히 흐름 타는 중' },
    6: { emoji: '🪴', text: '평온함 만끽하기' },
    7: { emoji: '🎵', text: '리듬 좀 탔다 오늘' },
    8: { emoji: '🔥', text: '오늘 집중력 기대됨' },
    9: { emoji: '🔮', text: '이대로 착착 풀려라' },
    10: { emoji: '🌟', text: '완벽한 하루' },
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
    <div className="px-5 pb-2 pt-20">
      {/* 툴팁을 위한 상단 여유공간 추가 */}
      <div className="relative flex items-center">
        {/* 가로선 - 점수 버튼들 뒤에 위치 */}
        <div className="absolute left-[5%] right-[5%] top-1/2 h-1 -translate-y-1/2 transform rounded bg-[#F1F1F1]" />

        {/* 점수 버튼들 */}
        <div className="relative z-10 grid w-full grid-cols-10 gap-0">
          {Array.from({ length: 10 }, (_, i) => {
            const score = i + 1;
            const isHovered = score === hoveredScore;
            const isSelected = score === value;
            const tooltip = getScoreTooltip(score);

            return (
              <div key={score} className="relative flex items-center justify-center">
                {/* 점수 버튼 */}
                <button
                  onClick={() => handleScoreSelect(score)}
                  onMouseEnter={() => setHoveredScore(score)}
                  onMouseLeave={() => setHoveredScore(null)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                >
                  {/* 호버/선택 시 배경 효과 복원 */}
                  {(isHovered || isSelected) && (
                    <div className="absolute inset-0 scale-125 rounded-full bg-purple-200/40 transition-all duration-200" />
                  )}

                  {/* 점수 원 */}
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

                  {/* 툴팁 - 버튼 내부로 이동 */}
                  {(isHovered || isSelected) &&
                    (score === 1 ? (
                      // 1번 툴팁 - 왼쪽 정렬
                      <div
                        className="absolute bottom-full left-0 z-50 mb-4"
                        style={{
                          animation: 'fadeIn 200ms ease-out forwards',
                        }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-[rgba(244,244,244,0.95)] px-4 py-3 text-[13px] text-black shadow-lg">
                            <span className="text-base">{tooltip.emoji}</span>
                            <span className="font-medium">{tooltip.text}</span>
                          </div>
                          <div
                            className="absolute top-full"
                            style={{
                              marginTop: '-1px',
                              left: '20px',
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                              <path d="M6 6L0 0h12L6 6z" fill="rgba(244,244,244,0.95)" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : score === 10 ? (
                      // 10번 툴팁 - 오른쪽 정렬
                      <div
                        className="absolute bottom-full right-0 z-50 mb-4"
                        style={{
                          animation: 'fadeIn 200ms ease-out forwards',
                        }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-[rgba(244,244,244,0.95)] px-4 py-3 text-[13px] text-black shadow-lg">
                            <span className="text-base">{tooltip.emoji}</span>
                            <span className="font-medium">{tooltip.text}</span>
                          </div>
                          <div
                            className="absolute top-full"
                            style={{
                              marginTop: '-1px',
                              right: '20px',
                              transform: 'translateX(50%)',
                            }}
                          >
                            <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                              <path d="M6 6L0 0h12L6 6z" fill="rgba(244,244,244,0.95)" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 나머지 툴팁 - 중앙 정렬 (기존 방식)
                      <div
                        className="absolute bottom-full left-1/2 z-50 mb-4 -translate-x-1/2 transform"
                        style={{
                          animation: 'slideUpFade 200ms ease-out forwards',
                        }}
                      >
                        <div className="relative">
                          <div className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-[rgba(244,244,244,0.95)] px-4 py-3 text-[13px] text-black shadow-lg">
                            <span className="text-base">{tooltip.emoji}</span>
                            <span className="font-medium">{tooltip.text}</span>
                          </div>
                          <div
                            className="absolute left-1/2 top-full -translate-x-1/2 transform"
                            style={{ marginTop: '-1px' }}
                          >
                            <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                              <path d="M6 6L0 0h12L6 6z" fill="rgba(244,244,244,0.95)" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 애니메이션 스타일 추가 */}
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate(-50%, 4px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
