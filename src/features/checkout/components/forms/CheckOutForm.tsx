'use client';

import { RiCheckLine, RiImageLine } from '@remixicon/react';
import { useState } from 'react';

interface CheckOutFormProps {
  onSubmit: (data: { message: string; images: string[] }) => void;
  disabled?: boolean;
}

export const CheckOutForm = ({ onSubmit, disabled = false }: CheckOutFormProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit({ message, images: [] });
    }
  };

  const isSubmitDisabled = !message.trim() || disabled;

  return (
    <>
      <div className="px-8 pb-3">
        <div className="rounded-xl p-3">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="오늘 하루를 마무리하며 남기고 싶은 이야기가 있나요? 오늘의 Keep, Problem, Try를 중심으로 회고를 가볍게 남겨보세요."
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
