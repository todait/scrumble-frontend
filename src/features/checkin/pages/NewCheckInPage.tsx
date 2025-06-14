'use client';

import { formatDateForPage } from '@/shared/utils';
import { RiCalendarFill } from '@remixicon/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckInWriteModal } from '../components/CheckInWriteModal';
import { TeamStatusCard } from '../components/ui';

export function NewCheckInPage() {
  const router = useRouter();
  const params = useParams();
  const spaceSlug = params.spaceSlug as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const today = new Date();
    setDateString(formatDateForPage(today));
  }, []);

  // 체크인 가능 횟수 (임시로 15로 설정)
  const remainingCheckins = 15;

  const handleStartCheckin = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBack = () => {
    router.push(`/${spaceSlug}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA] px-4 py-4 md:px-4 md:py-8">
        <div className="w-full max-w-[640px]">
          {/* 카드 컨테이너 */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-2xl">
            {/* 상단 섹션 - 날짜와 제목 */}
            <div className="border-b border-[rgba(34,34,34,0.08)] px-5 py-5 md:px-[30px] md:py-[30px]">
              <div className="mb-2 text-sm font-bold text-[#9747FF] md:text-[15px]">{dateString}</div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold leading-[1.5] text-[#222222] md:text-[24px]">
                  오늘의 팀워크를 시작해보세요
                </h1>
                <p className="max-w-[580px] text-xs leading-[1.5] text-[#222222] opacity-50 md:text-[14px]">
                  팀원 간 연결을 부드럽게 이어주는 Scrumble. 가볍게 체크인하고, 팀의 리듬을 함께
                  맞춰보세요.
                </p>
              </div>
            </div>

            {/* 중간 섹션 - 체크인 가능 횟수와 박스들 */}
            <div className="border-b border-[rgba(34,34,34,0.08)] px-5 py-5 md:px-[30px] md:py-[30px]">
              <p className="mb-4 text-sm font-bold text-[#222222] opacity-80 md:text-[15px]">
                {remainingCheckins}번째 체크인을 남길 수 있습니다
              </p>

              <TeamStatusCard teamCondition={7.2} checkedInCount={14} checkedOutCount={6} />
            </div>

            {/* 하단 섹션 - 버튼 */}
            <div className="px-5 py-5 md:px-[30px] md:py-[30px]">
              <button
                onClick={handleStartCheckin}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-[rgba(24,24,24,0.2)] bg-[#181818] px-4 py-3 text-center text-base font-normal text-white transition-colors hover:bg-[#000000] md:rounded-xl md:px-5 md:py-4 md:text-[18px]"
              >
                <RiCalendarFill className="mr-1 h-4 w-4 md:h-5 md:w-5" />
                스크럼블 시작하기
              </button>
            </div>
          </div>

          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleBack}
            className="mx-auto mt-4 block text-xs font-medium text-gray-600 hover:text-gray-800 md:mt-6 md:text-sm"
          >
            나중에 하기
          </button>
        </div>
      </div>

      {/* 체크인 작성 모달 */}
      <CheckInWriteModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
