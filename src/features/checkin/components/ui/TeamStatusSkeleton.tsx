'use client';

export const TeamStatusSkeleton = () => {
  return (
    <div className="flex gap-4 py-[10px]">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex-1 rounded-lg bg-[#FAFAFA] p-4">
          <div className="flex flex-col justify-center gap-1">
            <div className="flex items-center gap-1 opacity-50">
              <div className="h-3 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-1 h-4 w-12 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
};