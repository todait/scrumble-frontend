'use client';

import React from 'react';

export const AuthHeader: React.FC = () => {
  return (
    <>
      {/* 메인 타이틀 */}
      <div>
        <h1 className="text-[32px] font-bold leading-[1.5] text-[#222222] font-pretendard text-center">
          팀워크의 온도를 지키는 법
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mt-4">
        <p className="text-[15px] font-normal leading-[1.5] text-[#222222] font-pretendard opacity-50 text-center">
          팀원 간 연결을 부드럽게 이어주는 Scrumbl<br />
          더 유연한 팀워크의 리듬, 직접 경험해보세요.
        </p>
      </div>
    </>
  );
};