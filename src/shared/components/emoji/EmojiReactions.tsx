'use client';

import { RiChat1Line, RiEmojiStickerLine } from '@remixicon/react';
import { useRef, useState } from 'react';
import type { EmojiData } from './EmojiPicker';
import { EmojiPicker } from './EmojiPicker';

export interface Reaction {
  emoji: string;
  count: number;
  spaceMemberIds: string[];
}

interface EmojiReactionsProps {
  reactions: Reaction[];
  currentSpaceMemberId?: string;
  targetType: 'posts' | 'comments';
  targetId: string;
  onReactionToggle?: (emoji: string) => void;
  onReactionAdd?: (emoji: string) => void;
  onError?: (message: string) => void;
  showCommentButton?: boolean;
  commentCount?: number;
  onCommentClick?: () => void;
}

export function EmojiReactions({
  reactions,
  currentSpaceMemberId,
  targetType,
  targetId,
  onReactionToggle,
  onReactionAdd,
  onError,
  showCommentButton = false,
  commentCount = 0,
  onCommentClick,
}: EmojiReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleReactionClick = (emoji: string) => {
    try {
      onReactionToggle?.(emoji);
    } catch {
      onError?.('리액션 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEmojiSelect = (emoji: EmojiData, event?: React.MouseEvent<HTMLDivElement>) => {
    const shiftPressed = !!event?.shiftKey; // ⇧ 키 여부

    try {
      onReactionAdd?.(emoji.native);
    } catch {
      onError?.('리액션 추가에 실패했습니다. 다시 시도해주세요.');
    }

    // Shift가 눌리지 않았을 때만 픽커 닫기
    if (!shiftPressed) {
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiPickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {/* 댓글 버튼 (옵션) */}
      {showCommentButton && (
        <button
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onCommentClick?.();
          }}
          className="flex flex-shrink-0 items-center gap-1"
          style={{ color: '#1D1D1F', opacity: 0.8 }}
        >
          <RiChat1Line className="h-5 w-5" />
          <span className="text-[15px] font-medium">{commentCount}</span>
        </button>
      )}

      {/* 기존 리액션들 */}
      {reactions.map((reaction, index) => (
        <button
          key={`${targetType}-${targetId}-${reaction.emoji}-${index}`}
          onClick={e => {
            e.stopPropagation();
            handleReactionClick(reaction.emoji);
          }}
          className={`flex min-w-12 items-center justify-between rounded-full border px-[10px] py-[6px] text-sm transition-colors md:text-[13px] ${
            reaction.spaceMemberIds.includes(currentSpaceMemberId || '')
              ? 'border-[#1D1D1F] text-[#1D1D1F]'
              : 'border-transparent bg-[rgba(241,241,241,0.5)] text-[#1D1D1F] hover:bg-[rgba(241,241,241,0.8)]'
          }`}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 0 && <span>{reaction.count}</span>}
        </button>
      ))}

      {/* 이모지 추가 버튼 */}
      <div>
        <button
          ref={emojiButtonRef}
          onClick={handleEmojiPickerToggle}
          className="flex h-[26px] w-[36px] items-center justify-center rounded-2xl bg-[rgba(241,241,241,0.5)] text-[#222222] opacity-50 transition-all hover:bg-[rgba(241,241,241,0.8)] hover:opacity-100"
        >
          <RiEmojiStickerLine className="h-4 w-4" />
        </button>

        {/* 이모지 피커 */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
          triggerRef={emojiButtonRef}
        />
      </div>
    </div>
  );
}
