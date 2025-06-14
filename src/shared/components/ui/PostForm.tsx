'use client';

import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PostFormProps {
  onSubmit: (data: { message: string; images: string[] }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  initialMessage?: string;
  children?: React.ReactNode; // ScoreSelector 등 추가 컴포넌트를 위한 slot
  onTextAreaClick?: () => void; // 텍스트 영역 클릭 콜백
  submitDisabled?: boolean; // 추가 제출 비활성화 조건
}

export const PostForm = ({
  onSubmit,
  disabled = false,
  isLoading = false,
  placeholder = '오늘 하루는 어떠셨나요? 팀원들과 나누고 싶은 이야기를 들려주세요.',
  initialMessage = '',
  children,
  onTextAreaClick,
  submitDisabled = false,
}: PostFormProps) => {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit({ message, images: [] });
    }
  };

  const isSubmitDisabled = !message.trim() || disabled || isLoading || submitDisabled;

  return (
    <>
      {children}

      <div className="px-2 md:px-7">
        <div 
          className="rounded-xl p-3 cursor-text"
          onClick={onTextAreaClick}
        >
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            className="h-[240px] w-full resize-none border-none p-[10px] text-[15px] text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            disabled={disabled}
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto py-1">
          <button
            className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 transition-colors hover:border-gray-400"
            disabled={disabled}
          >
            <RiImageLine className="h-6 w-6 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-7">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-4 text-center font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="text-gray-900" />
              저장 중...
            </>
          ) : (
            <>
              <RiCheckLine className="h-5 w-5" />
              저장
            </>
          )}
        </button>
      </div>
    </>
  );
};
