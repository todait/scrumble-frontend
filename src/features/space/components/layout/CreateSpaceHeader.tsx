'use client';

import React from 'react';

export const CreateSpaceHeader: React.FC = () => {
  return (
    <>
      {/* 메인 타이틀 */}
      <div className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold leading-[1.5] text-[#181818] font-pretendard">
          새로운 스페이스 만들기
        </h1>
      </div>

      {/* 서브 타이틀 */}
      <div className="mb-3">
        <p className="text-base lg:text-lg font-normal leading-[1.6] text-[#181818] font-pretendard">
          이름만 정하면 시작할 수 있어요.<br />
          회사, 팀 또는 프로젝트 이름으로 설정해보세요.
        </p>
      </div>
    </>
  );
}; 