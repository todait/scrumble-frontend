'use client';

import { useTeamSummary } from '@/shared/hooks/queries/useTeamSummary';
import { useEffect, useState } from 'react';
import { TeamStatusCard } from './TeamStatusCard';
import { TeamStatusSkeleton } from './TeamStatusSkeleton';

interface TeamStatusSectionProps {
  selectedDate: Date;
}

export const TeamStatusSection = ({ selectedDate }: TeamStatusSectionProps) => {
  const [isClient, setIsClient] = useState(false);
  
  // 팀 요약 정보 가져오기
  const { data: teamSummary, isLoading } = useTeamSummary({
    date: selectedDate,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버 사이드에서는 항상 스켈레톤 표시
  if (!isClient) {
    return <TeamStatusSkeleton />;
  }

  // 클라이언트 사이드에서 로딩 처리
  if (isLoading) {
    return <TeamStatusSkeleton />;
  }

  return (
    <TeamStatusCard
      teamCondition={teamSummary?.teamCondition ?? 0}
      checkedInCount={teamSummary?.checkedInCount ?? 0}
      checkedOutCount={teamSummary?.checkedOutCount ?? 0}
    />
  );
};