'use client';

import { RiSkipUpLine } from '@remixicon/react';

interface GoToFocusedPostButtonProps {
  selectedPostId: string;
  onScrollToPost: () => void;
}

export function GoToFocusedPostButton({ selectedPostId, onScrollToPost }: GoToFocusedPostButtonProps) {
  if (!selectedPostId) return null;

  return (
    <div className="absolute bottom-[30px] right-[-10px] z-30">
      <button
        onClick={onScrollToPost}
        className="flex h-[50px] w-[50px] items-center justify-center rounded-[10px] bg-white shadow-[0px_4px_10px_rgba(151,71,255,0.25)] transition-all hover:shadow-[0px_6px_12px_rgba(151,71,255,0.35)] hover:scale-105"
        aria-label="선택된 포스트로 이동"
      >
        <RiSkipUpLine className="h-[28px] w-[28px] text-[#222222] opacity-40" />
      </button>
    </div>
  );
}