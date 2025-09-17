'use client';

interface ScoreSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

export const ScoreSelector = ({ value, onChange }: ScoreSelectorProps) => {
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

            return (
              <div key={score} className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleScoreSelect(score)}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
                >
                  <span
                    className={`pointer-events-none absolute inset-0 rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'scale-125 bg-purple-200/40'
                        : 'scale-0 bg-transparent group-hover:scale-125 group-hover:bg-purple-200/40'
                    }`}
                  />
                  <span
                    className={`pointer-events-none relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-gray-300 bg-white text-gray-600 group-hover:border-purple-300 group-hover:bg-purple-50 group-hover:text-purple-700'
                    }`}
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
