'use client';

import { CheckInModalLayout } from '@/features/checkin/components/layout';
import { useCreateCheckOut } from '@/shared/hooks/queries';
import { formatDate } from '@/shared/utils';
import { RiPokerDiamondsFill } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { CheckOutForm } from './forms';

interface CheckOutWriteModalProps {
  spaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckOutWriteModal({ spaceSlug, isOpen, onClose }: CheckOutWriteModalProps) {
  const { mutate: createCheckOut, isPending } = useCreateCheckOut();
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    setDateString(formatDate());
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (data: { message: string; images: string[] }) => {
    createCheckOut(
      {
        spaceSlug,
        reflectionText: data.message,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-7 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">{dateString}</div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerDiamondsFill className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-black">체크아웃 노트</h2>
        </div>
        <p className="text-sm leading-relaxed text-black opacity-50">
          하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를 더
          유연하게 만들어줄 수 있답니다.
        </p>
      </div>
      <CheckOutForm onSubmit={handleSubmit} disabled={isPending} isLoading={isPending} />
    </CheckInModalLayout>
  );
}
