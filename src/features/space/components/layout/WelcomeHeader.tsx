'use client';

import React from 'react';

export const WelcomeHeader: React.FC = () => {
  return (
    <>
      {/* 메인 타이틀 */}
      <div>
        <h1 className="text-[32px] font-bold leading-[1.5] text-[#222222] font-pretendard text-center">
          환영합니다<br />
          팀워크를 시작해보세요
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mt-4">
        <p className="text-[15px] font-normal leading-[1.5] text-[#222222] font-pretendard opacity-50 text-center">
          작은 연결에서 시작하는 좋은 팀워크.<br />
          가볍게 체크인하고, 팀의 리듬을 함께 맞춰보세요.
        </p>
      </div>
    </>
  );
}; 