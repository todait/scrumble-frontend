'use client';

import React from 'react';

export const WelcomeHeader: React.FC = () => {
  return (
    <>
      {/* 메인 타이틀 */}
      <div className="mb-2">
        <h1 className="text-3xl lg:text-[48px] font-bold leading-[1.5] text-[#181818] font-pretendard">
          환영합니다<br />
          팀워크를 시작해보세요
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mb-3">
        <p className="text-lg lg:text-[24px] font-normal leading-[1.6] text-[#181818] font-pretendard">
          팀원 간 연결을 부드럽게 이어주는 Scrumble.<br />
          가볍게 체크인하고, 팀의 리듬을 함께 맞춰보세요.
        </p>
      </div>
    </>
  );
}; 