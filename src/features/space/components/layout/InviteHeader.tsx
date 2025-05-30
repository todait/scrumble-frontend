import React from 'react';

interface InviteHeaderProps {
  spaceName: string;
}

export const InviteHeader: React.FC<InviteHeaderProps> = ({ spaceName }) => {
  return (
    <>
      {/* 워크스페이스 이름 라벨 */}
      <div className="mb-10">
          <div className="inline-flex items-center gap-1 px-5 py-4 bg-[#9747FF]/20 border border-[#9747FF]/40 rounded-full font-pretendard">
            <div className="w-5 h-5 flex items-center justify-center">
              {/* 기본 아이콘 */}
              <div className="w-[13.8px] h-[15px] bg-[#9747FF]"></div>
            </div>
            <span className="text-[18px] font-normal text-[#9747FF]">
              {spaceName}
            </span>
          </div>
        </div>

        {/* 헤더 */}
        <div className="mb-4">
          <h1 className="text-[48px] font-bold text-[#181818] leading-[1.5] font-pretendard">
            지금 팀을 초대할 수 있어요
          </h1>
        </div>

        {/* 설명 텍스트 */}
        <div className="mb-4 space-y-2">
          <p className="text-[24px] font-normal text-[#181818] leading-[1.6] font-pretendard">
            이 공간을 함께 채워갈 멤버를 불러보세요.
            <br />
            이메일만 알려주시면, 저희가 초대 메일을 보낼게요.
          </p>
          <p className="text-[15px] font-normal text-[#181818]/50 leading-[1.6] font-pretendard">
            나중에도 언제든 초대할 수 있어요. 하지만 지금 해두면 잊지 않을 수 있죠 😉
          </p>
        </div>
    </>
  );
};