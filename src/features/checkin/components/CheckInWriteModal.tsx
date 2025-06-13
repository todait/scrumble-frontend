'use client';

import { useCreateCheckIn } from '@/shared/hooks/queries/usePosts';
import { ErrorCode } from '@/shared/types/api';
import { formatDate, isErrorCode } from '@/shared/utils';
import { RiPokerClubsFill } from '@remixicon/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';

interface CheckInWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckInWriteModal({ isOpen, onClose }: CheckInWriteModalProps) {
  const router = useRouter();
  const params = useParams();
  const spaceSlug = params.spaceSlug as string;
  const [dateString, setDateString] = useState('');

  const { mutate: createCheckInMutation } = useCreateCheckIn();

  useEffect(() => {
    setDateString(formatDate());
  }, []);

  const handleSubmit = (data: { score: number; message: string; images: string[] }) => {
    createCheckInMutation(
      {
        spaceSlug,
        conditionScore: data.score,
        conditionText: data.message,
      },
      {
        onSuccess: async () => {
          // 쿼리 무효화가 완료될 때까지 잠시 대기
          await new Promise(resolve => setTimeout(resolve, 100));
          router.push(`/${spaceSlug}/feed`);
        },
        onError: (err: unknown) => {
          // CHECKIN_ALREADY_EXISTS 에러의 경우에만 피드로 라우팅
          if (isErrorCode(err, ErrorCode.CHECKIN_ALREADY_EXISTS)) {
            router.replace(`/${spaceSlug}/feed`);
          }
        },
      }
    );
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-7 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">{dateString}</div>
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
