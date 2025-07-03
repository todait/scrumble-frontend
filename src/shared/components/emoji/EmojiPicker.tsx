'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: EmojiData, event?: React.MouseEvent<HTMLDivElement>) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function EmojiPicker({ isOpen, onClose, onEmojiSelect, triggerRef }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    right?: number;
    left?: number;
  }>({ top: 0, right: 0 });

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const buttonRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 360;
    const pickerHeight = 233; // 350 * 2/3

    // 화면 공간 확인
    const bottomSpace = viewportHeight - buttonRect.bottom;

    // 세로 위치 결정
    const top =
      bottomSpace < pickerHeight + 16
        ? Math.max(8, buttonRect.top - pickerHeight - 8)
        : buttonRect.bottom + 8;

    // 가로 위치 결정 - 아이콘 바로 밑에서 시작하여 오른쪽으로
    const newPosition: { top: number; right?: number; left?: number } = { top };

    // 아이콘의 왼쪽 모서리에서 시작
    let leftPosition = buttonRect.left;

    // 피커가 화면 오른쪽을 벗어나는지 확인
    if (leftPosition + pickerWidth > viewportWidth - 8) {
      // 화면 오른쪽을 벗어나면 오른쪽 정렬로 조정
      leftPosition = viewportWidth - pickerWidth - 8;
    }

    // 최소 8px 여백 확보
    leftPosition = Math.max(8, leftPosition);

    newPosition.left = leftPosition;

    setPosition(newPosition);
  }, [triggerRef]);

  // 외부 클릭 시 닫기 및 스크롤/리사이즈 시 위치 업데이트
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 버튼이나 피커 내부 클릭이 아닌 경우에만 닫기
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        pickerRef.current &&
        !pickerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, calculatePosition, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        ...(position.right !== undefined && {
          right: `${position.right}px`,
        }),
        ...(position.left !== undefined && {
          left: `${position.left}px`,
        }),
      }}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="overflow-hidden rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.15)]">
        <Picker
          data={data}
          onEmojiSelect={(emoji: EmojiData, event: React.MouseEvent<HTMLDivElement>) =>
            onEmojiSelect(emoji, event)
          }
          autoFocus={false}
          searchPosition="sticky"
          navPosition="bottom"
          previewPosition="none"
          skinTonePosition="none"
          set="native"
          theme="light"
          emojiButtonSize={34}
          emojiSize={28}
          perLine={9}
          maxFrequentRows={2}
          categories={[
            'frequent',
            'people',
            'nature',
            'foods',
            'activity',
            'places',
            'objects',
            'symbols',
            'flags',
          ]}
        />
      </div>
    </div>
  );
}