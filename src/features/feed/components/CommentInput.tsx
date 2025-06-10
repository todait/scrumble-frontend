'use client';

import { RiAtLine, RiAttachment2, RiImageLine, RiSendPlaneFill } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';

interface CommentInputProps {
  authorName: string;
  placeholder?: string;
  onSubmit: (content: string, attachments?: File[]) => void;
}

export function CommentInput({ authorName, placeholder, onSubmit }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // textarea 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '22px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSubmitEnabled = content.trim().length > 0;
  const displayPlaceholder = placeholder || `${authorName}님의 체크인에 가볍게 코멘트를 남겨보세요`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[rgba(34,34,34,0.08)] bg-white p-4">
      {/* 텍스트 입력 영역 */}
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none overflow-y-auto border-none bg-transparent text-[15px] leading-[1.4] text-[#181818] focus:outline-none"
            style={{ minHeight: '22px', maxHeight: '150px' }}
          />
          {/* 커서 애니메이션 - 빈 상태일 때만 */}
          {!content && !isFocused && (
            <div className="pointer-events-none absolute left-0 top-0">
              <span className="ml-1 animate-pulse text-[20px] leading-[1.1] text-[#181818] opacity-20">
                |
              </span>
              <span className="text-[15px] leading-[1.4] text-[#181818] opacity-20">
                {displayPlaceholder}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 바 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽 액션 버튼들 */}
        <div className="flex items-center gap-1">
          {/* 이미지 첨부 버튼 */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-[#F1F1F1] transition-colors hover:bg-[#E5E5E5]"
            title="이미지 첨부"
          >
            <RiImageLine className="h-4 w-4 text-[#222222] opacity-50" />
          </button>

          {/* 파일 첨부 버튼 */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-[#F1F1F1] transition-colors hover:bg-[#E5E5E5]"
            title="파일 첨부"
          >
            <RiAttachment2 className="h-4 w-4 text-[#222222] opacity-50" />
          </button>

          {/* 멘션 버튼 */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-[#F1F1F1] transition-colors hover:bg-[#E5E5E5]"
            title="멘션"
          >
            <RiAtLine className="h-4 w-4 text-[#222222] opacity-50" />
          </button>
        </div>

        {/* 오른쪽 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`flex h-8 w-8 items-center justify-center rounded border transition-all ${
            isSubmitEnabled
              ? 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] hover:bg-[#8537EF]'
              : 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] opacity-30'
          }`}
          title="전송"
        >
          <RiSendPlaneFill className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
