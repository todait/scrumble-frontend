'use client';

import { useState } from 'react';

import { getConditionScoreColor } from '@/shared/constants';

interface ScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

const DEFAULT_BORDER_COLOR = '#D1D5DB';
const DEFAULT_TEXT_COLOR = '#4B5563';
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');

  if (sanitized.length !== 6) {
    return hex;
  }

  const bigint = Number.parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    <div className="px-5 pb-2 pt-8">
      <div className="relative flex items-center">
        {/* 가로선 - 점수 버튼들 뒤에 위치 */}
        <div className="absolute left-[5%] right-[5%] top-1/2 h-1 -translate-y-1/2 transform rounded bg-[#F1F1F1]" />

        {/* 점수 버튼들 */}
        <div className="relative z-10 grid w-full grid-cols-10 gap-0">
          {Array.from({ length: 10 }, (_, i) => {
            const score = i + 1;
            const isSelected = score === value;
            const isHovered = hoveredScore === score;
            const baseColor = getConditionScoreColor(score);
            const auraColor = hexToRgba(baseColor, 0.18);
            const hoverBorderColor = hexToRgba(baseColor, 0.45);
            const hoverBackgroundColor = hexToRgba(baseColor, 0.12);
            const textColor = isSelected
              ? '#FFFFFF'
              : isHovered
                ? baseColor
                : DEFAULT_TEXT_COLOR;
            const borderColor = isSelected
              ? baseColor
              : isHovered
                ? hoverBorderColor
                : DEFAULT_BORDER_COLOR;
            const backgroundColor = isSelected
              ? baseColor
              : isHovered
                ? hoverBackgroundColor
                : DEFAULT_BACKGROUND_COLOR;

            return (
              <div key={score} className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleScoreSelect(score)}
                  onMouseEnter={() => setHoveredScore(score)}
                  onMouseLeave={() => setHoveredScore(null)}
                  onFocus={() => setHoveredScore(score)}
                  onBlur={() => setHoveredScore(null)}
                  aria-pressed={isSelected}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: auraColor,
                      transform: `scale(${isSelected || isHovered ? 1.25 : 0})`,
                      opacity: isSelected || isHovered ? 1 : 0,
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all"
                    style={{
                      borderColor,
                      backgroundColor,
                      color: textColor,
                    }}
                  >
                    {score}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
