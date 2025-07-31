'use client';

import React from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';

export const SpaceListHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {/* 메인 타이틀 */}
      <div>
        <h1 className="text-[24px] font-bold leading-[1.5] text-[#222222] font-pretendard text-center">
          {user?.email}의 스페이스
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mt-4">
        <p className="text-[15px] font-normal leading-[1.5] text-[#222222] font-pretendard opacity-50 text-center">
          참여 중인 스페이스를 선택하고, 팀과 함께 스크럼블을 시작해보세요.
        </p>
      </div>
    </>
  );
};