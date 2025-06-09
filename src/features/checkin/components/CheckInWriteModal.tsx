'use client';

import { RiPokerClubsFill } from '@remixicon/react';
import { useParams, useRouter } from 'next/navigation';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';

interface CheckInWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckInWriteModal({ isOpen, onClose }: CheckInWriteModalProps) {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId as string;

  const handleSubmit = (data: { score: number; message: string; images: string[] }) => {
    console.log('체크인 제출:', data);
    // TODO: API 연동
    router.push(`/${spaceId}`);
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
          <RiPokerClubsFill className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-black">체크인 노트</h2>
        </div>
        <p className="text-sm leading-relaxed text-black opacity-50">
          하루의 리듬을 스스로 인식하고 조율하는 좋은 시작이 되어줄 거예요. 작은 기록 하나가
          팀워크의 흐름을 만드는 신호가 될 수 있답니다.
        </p>
      </div>
      <CheckInForm onSubmit={handleSubmit} />
    </CheckInModalLayout>
  );
}
