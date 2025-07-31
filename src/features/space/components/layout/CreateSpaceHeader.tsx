'use client';

import React from 'react';

export const CreateSpaceHeader: React.FC = () => {
  return (
    <>
      <h1 className="mb-4 text-center font-pretendard text-[32px] font-bold leading-[1.5] text-[#222222]">
        새로운 스페이스 만들기
      </h1>
      <p className="text-center font-pretendard text-[15px] font-normal leading-[1.5] text-[#222222] opacity-50">
        이름만 정하면 시작할 수 있어요.
        <br />
        회사, 팀 또는 프로젝트 이름으로 설정해보세요.
      </p>
    </>
  );
};
