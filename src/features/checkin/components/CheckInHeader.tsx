'use client';

import { X } from 'lucide-react';

interface CheckInHeaderProps {
  onCancel: () => void;
}

export function CheckInHeader({ onCancel }: CheckInHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-900">체크인 작성</h2>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
