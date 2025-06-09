'use client';

import { useMemo } from 'react';

interface ConditionSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const getConditionEmoji = (score: number): string => {
  if (score <= 2) return '😔';
  if (score <= 4) return '😕';
  if (score <= 6) return '😐';
  if (score <= 8) return '😊';
  return '😄';
};

const getConditionColor = (score: number): string => {
  if (score <= 3) return 'text-red-500';
  if (score <= 6) return 'text-yellow-500';
  return 'text-green-500';
};

const getConditionBgColor = (score: number): string => {
  if (score <= 3) return 'bg-red-500';
  if (score <= 6) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getSliderThumbColor = (score: number): string => {
  if (score <= 3) return '#ef4444';
  if (score <= 6) return '#eab308';
  return '#22c55e';
};

const getConditionText = (score: number): string => {
  if (score <= 2) return '매우 나쁨';
  if (score <= 4) return '나쁨';
  if (score <= 6) return '보통';
  if (score <= 8) return '좋음';
  return '매우 좋음';
};

export function ConditionSlider({ value, onChange }: ConditionSliderProps) {
  const emoji = useMemo(() => getConditionEmoji(value), [value]);
  const colorClass = useMemo(() => getConditionColor(value), [value]);
  const bgColorClass = useMemo(() => getConditionBgColor(value), [value]);
  const conditionText = useMemo(() => getConditionText(value), [value]);
  const thumbColor = useMemo(() => getSliderThumbColor(value), [value]);

  return (
    <div className="space-y-6">
      {/* 이모지와 점수 표시 */}
      <div className="space-y-2 text-center">
        <div className="text-6xl">{emoji}</div>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-3xl font-bold ${colorClass}`}>{value}</span>
          <span className="text-gray-500">/10</span>
        </div>
        <p className="text-sm text-gray-600">{conditionText}</p>
      </div>

      {/* 슬라이더 */}
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
          aria-label={`컨디션 점수: ${value}점 (${conditionText})`}
          aria-valuetext={`현재 컨디션: ${value}점`}
          style={{
            background: `linear-gradient(to right, ${thumbColor} 0%, ${thumbColor} ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            background-color: ${thumbColor};
          }
          input[type="range"]::-moz-range-thumb {
            background-color: ${thumbColor};
          }
        `}</style>
      </div>

      {/* 점수 가이드 */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
