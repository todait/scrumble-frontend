'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFBFB]">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">문제가 발생했습니다</h2>
        <p className="mb-4 text-gray-600">페이지를 불러오는 중 오류가 발생했습니다.</p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#FF7800] px-4 py-2 text-white hover:bg-[#FF7800]/90"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}