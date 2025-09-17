'use client';

import { getConditionScoreColor } from '@/shared/constants';

interface ConditionScoreBadgeProps {
  score: number;
  emoji?: string | null;
}

export function ConditionScoreBadge({ score, emoji: _emoji }: ConditionScoreBadgeProps) {
  const color = getConditionScoreColor(score);
  
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
