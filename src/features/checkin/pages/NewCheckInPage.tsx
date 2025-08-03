'use client';

import { useTeamSummary } from '@/shared/hooks/queries/useTeamSummary';
import { useDateStore } from '@/shared/stores/useDateStore';
import { convertToKoreanOrder, formatDateForPage } from '@/shared/utils';
import { RiCalendarFill } from '@remixicon/react';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckInWriteModal } from '../components/CheckInWriteModal';
import { TeamStatusSection } from '../components/ui';

// CheckInWriteModal 미리 로드하는 함수
const preloadCheckInModal = () => {
  import('../components/CheckInWriteModal');
};

export function NewCheckInPage() {
  const router = useRouter();
  const params = useParams();
  const spaceSlug = params.spaceSlug as string;
  const { selectedDate } = useDateStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 팀 요약 정보 가져오기 (nextCheckinOrder를 위해서만 사용)
  const { data: teamSummary } = useTeamSummary({
    date: selectedDate,
  });

  // 컴포넌트 마운트 시 CheckInWriteModal 미리 로드
  useEffect(() => {
    preloadCheckInModal();
  }, []);

  // 미래 날짜 접근 시 메인 피드로 리다이렉트
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate > today) {
      router.replace(`/${spaceSlug}/feed`);
    }
  }, [selectedDate, spaceSlug, router]);

  const nextCheckinOrder = teamSummary?.nextCheckinOrder ?? 0;

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
              <div className="mb-2 text-sm font-bold text-[#9747FF] md:text-[15px]">
                {formatDateForPage(selectedDate)}
              </div>

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
              {nextCheckinOrder > 0 && (
                <p className="mb-4 text-sm font-bold text-[#222222] opacity-80 md:text-[15px]">
                  {`오늘 ${convertToKoreanOrder(nextCheckinOrder)}번째로 체크인을 남겨보세요`}
                </p>
              )}

              <TeamStatusSection selectedDate={selectedDate} />
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
