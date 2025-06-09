'use client';

import { CheckInModalLayout } from '@/features/checkin/components/layout';
import { RiPokerDiamondsFill } from '@remixicon/react';
import { useParams, useRouter } from 'next/navigation';
import { CheckOutForm } from './forms';

interface CheckOutWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckOutWriteModal({ isOpen, onClose }: CheckOutWriteModalProps) {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId as string;

  const handleSubmit = (data: { message: string; images: string[] }) => {
    console.log('체크아웃 제출:', data);
    // TODO: API 연동
    onClose();
    router.push(`/${spaceId}/feed`);
  };

  const formatDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    return `${month}월 ${date}일 ${day}요일`;
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-8 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">{formatDate()}</div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerDiamondsFill className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-black">체크아웃 노트</h2>
        </div>
        <p className="text-sm leading-relaxed text-black opacity-50">
          하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를 더
          유연하게 만들어줄 수 있답니다.
        </p>
      </div>
      <CheckOutForm onSubmit={handleSubmit} />
    </CheckInModalLayout>
  );
}
