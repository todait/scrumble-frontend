// PagerDots 컴포넌트 - 2-step 체크인 모달의 현재 단계를 나타내는 도트 인디케이터
'use client';

interface PagerDotsProps {
  total: number;
  current: number;
}

export const PagerDots = ({ total, current }: PagerDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors ${
            index === current ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};