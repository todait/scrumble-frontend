'use client';

import React from 'react';

export const AuthHeader: React.FC = () => {
  return (
    <>
      {/* 메인 타이틀 */}
      <div className="mb-6">
        <h1 className="text-3xl lg:text-[48px] font-bold leading-[1.5] text-[#181818] font-pretendard">
          Scrumble,<br />
          팀워크의 온도를 지키는 법
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mb-8">
        <p className="text-lg lg:text-[24px] font-normal leading-[1.6] text-[#181818] font-pretendard">
          작은 연결에서 시작하는 좋은 팀워크.<br />
          더 유연한 팀워크의 리듬, 직접 경험해보세요.
        </p>
      </div>
    </>
  );
};