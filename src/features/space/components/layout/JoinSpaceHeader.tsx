'use client';

import React from 'react';

export const JoinSpaceHeader: React.FC = () => {
  return (
    <>
      <h1 className="text-[32px] font-bold leading-[1.5] text-[#222222] font-pretendard text-center">
        초대받은 스페이스 입장하기
      </h1>
      <p className="text-[15px] font-normal leading-[1.5] text-[#222222] font-pretendard opacity-50 text-center">
        가입하신 메일로 초대장을 받으셨나요?<br />
        아래에 해당 스페이스의 입장 코드를 입력해주세요.
      </p>
    </>
  );
};