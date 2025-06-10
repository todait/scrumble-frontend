'use client';

import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useState, useEffect } from 'react';
import { ScoreSelector } from '../ui';

interface CheckInFormProps {
  onSubmit: (data: { score: number; message: string; images: string[] }) => void;
  disabled?: boolean;
  initialData?: { score: number; message: string; images: string[] };
}

export const CheckInForm = ({ onSubmit, disabled = false, initialData }: CheckInFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(initialData?.score || null);
  const [message, setMessage] = useState(initialData?.message || '');

  useEffect(() => {
    if (initialData) {
      setSelectedScore(initialData.score);
      setMessage(initialData.message);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (selectedScore && message.trim()) {
      onSubmit({ score: selectedScore, message, images: [] });
    }
  };

  const isSubmitDisabled = !selectedScore || !message.trim() || disabled;

  return (
    <>
      <ScoreSelector value={selectedScore} onChange={score => setSelectedScore(score || null)} />

      <div className="px-8 pb-3">
        <div className="rounded-xl p-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="오늘 하루는 어떠셨나요? 팀원들과 나누고 싶은 이야기를 들려주세요."
            className="h-[240px] w-full resize-none border-none text-[15px] text-black placeholder-gray-400 outline-none"
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

      <div className="p-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-4 text-center font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <RiCheckLine className="h-5 w-5" />
          완료
        </button>
      </div>
    </>
  );
};