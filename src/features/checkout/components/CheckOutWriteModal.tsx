'use client';

import { CheckInModalLayout } from '@/features/checkin/components/layout';
import { useCreateCheckOut } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString } from '@/shared/utils';
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
  const { selectedDate } = useDateStore();
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    setDateString(formatDate(selectedDate));
  }, [selectedDate]);

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

  const handleSubmit = (data: { message: string; images: ImageMetadata[] }) => {
    // 디버깅: 제출 데이터 로깅
    console.warn('CheckOut Submit - Images count:', data.images?.length || 0);
    console.warn('CheckOut Submit - Images:', data.images);
    
    createCheckOut(
      {
        spaceSlug,
        postedDate: formatDateToAPIString(selectedDate),
        reflectionText: data.message,
        images: data.images || [], // 기본값 대비
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
      <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
        <div className="mb-2 text-sm font-bold text-black md:text-[15px]">{dateString}</div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerDiamondsFill className="h-5 w-5 text-blue-500 md:h-6 md:w-6" />
          <h2 className="text-xl font-bold text-black md:text-2xl">체크아웃 노트</h2>
        </div>
        <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
          하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를 더
          유연하게 만들어줄 수 있답니다.
        </p>
      </div>
      <CheckOutForm onSubmit={handleSubmit} disabled={isPending} isLoading={isPending} />
    </CheckInModalLayout>
  );
}
