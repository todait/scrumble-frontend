'use client';

import { useCreateCheckIn, useExistsCheckin } from '@/shared/hooks/queries/usePosts';
import { useToast } from '@/shared/hooks/useToast';
import { ErrorCode, createTiptapDocumentFromText } from '@/shared/types/api';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString, isErrorCode } from '@/shared/utils';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { error, info } = useToast();

  const { mutate: createCheckIn, isPending } = useCreateCheckIn();
  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(new Date()),
  });

  useEffect(() => {
    setDateString(formatDate());
  }, []);

  const handleSubmit = (data: { score: number; message: string; images: ImageMetadata[] }) => {
    setIsProcessing(true);

    createCheckIn(
      {
        spaceSlug,
        conditionScore: data.score,
        conditionContent: createTiptapDocumentFromText(data.message),
        images: data.images || [], // 기본값 대비
      },
      {
        onSuccess: async () => {
          let success = false;
          for (let i = 0; i < 5; i++) {
            const { data: existsCheckin } = await refetchExistsCheckin();
            if (existsCheckin?.exists === true) {
              success = true;
              break;
            }
            await new Promise(res => setTimeout(res, 200)); // 200ms 대기 후 재시도
          }
          if (success) {
            router.replace(`/${spaceSlug}/feed`);
          } else {
            setIsProcessing(false);
            error({
              title: '체크인 작성 실패',
              message: '체크인 작성 중 오류가 발생했습니다. 다시 시도해주세요.',
            });
          }
        },
        onError: (err: unknown) => {
          setIsProcessing(false);
          // CHECKIN_ALREADY_EXISTS 에러의 경우에만 피드로 라우팅
          if (isErrorCode(err, ErrorCode.CHECKIN_ALREADY_EXISTS)) {
            router.replace(`/${spaceSlug}/feed`);
          }
        },
      }
    );
  };

  const handleScoreRequiredToast = () => {
    info({
      title: '점수를 먼저 선택해주세요 😊',
      message:
        '오늘의 컴디션 점수를 먼저 선택한 후 메시지를 작성해주세요. 점수를 매기면 마음을 더 잘 정리할 수 있어요!',
    });
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
        <div className="mb-2 text-sm font-bold text-black md:text-[15px]">{dateString}</div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerClubsFill className="h-5 w-5 text-green-500 md:h-6 md:w-6" />
          <h2 className="text-xl font-bold text-black md:text-2xl">체크인 노트</h2>
        </div>
        <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
          하루의 리듬을 스스로 인식하고 조율하는 좋은 시작이 되어줄 거예요. 작은 기록 하나가
          팀워크의 흐름을 만드는 신호가 될 수 있답니다.
        </p>
      </div>
      <CheckInForm
        onSubmit={handleSubmit}
        disabled={isPending || isProcessing}
        isLoading={isPending || isProcessing}
        onScoreRequiredToast={handleScoreRequiredToast}
      />
    </CheckInModalLayout>
  );
}
