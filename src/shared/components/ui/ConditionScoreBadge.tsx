'use client';

interface ConditionScoreBadgeProps {
  score: number;
  emoji?: string | null;
}

const scoreColors: Record<number, string> = {
  1: '#D94848',
  2: '#DF5E2B',
  3: '#E0890E',
  4: '#EDC41F',
  5: '#6CC921',
  6: '#21C993',
  7: '#27A8ED',
  8: '#3666D6',
  9: '#6A45E2',
  10: '#9747FF',
};

export function ConditionScoreBadge({ score, emoji: _emoji }: ConditionScoreBadgeProps) {
  const color = scoreColors[score] || '#222222';
  
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-2.5 rounded-lg border aspect-square"
      style={{
        borderColor: `${color}99`, // 60% opacity with hex
      }}
    >
      <span
        className="text-center text-[13px] font-bold leading-[120%]"
        style={{
          color: color,
        }}
      >
        {score}점
      </span>
    </div>
  );
}