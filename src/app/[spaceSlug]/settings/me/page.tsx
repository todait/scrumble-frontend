'use client';

import { withAuth } from '@/shared/components/auth';
import { useState } from 'react';
import { RiUserLine } from '@remixicon/react';

function MySettingsPage() {
  const [username] = useState('홍길동');
  const [userTag] = useState('@gdhong');
  const [mentionName] = useState('hongdong');
  const [email] = useState('1hannom@scrum.com');
  const [joinDate] = useState('2025년 3월 20일 가입');
  
  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="mb-2 text-[20px] font-bold text-[#1D1D1F]">프로필 설정</h1>
        <p className="text-[14px] text-[#86868B] leading-[20px]">
          스페이스에서 보여지는 프로필의 정보를 관리할 수 있습니다
        </p>
      </div>

      <div className="space-y-12">
        {/* 프로필 섹션 */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-6">프로필</h3>
          
          {/* 프로필 이미지 */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="h-[100px] w-[100px] rounded-[16px] bg-[#9747FF] flex items-center justify-center">
                <span className="text-[40px] font-bold text-white">H</span>
              </div>
            </div>
          </div>
          
          {/* 사용자 정보 */}
          <div className="text-center mb-8">
            <p className="text-[14px] text-[#6E6E73]">{username} ({userTag})</p>
          </div>
        </div>

        {/* 이름 섹션 */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-6">이름</h3>
          <div className="flex items-center gap-8 max-w-[500px]">
            <RiUserLine className="h-5 w-5 text-[#6E6E73]" />
            <div className="flex-1">
              <p className="text-[14px] text-[#1D1D1F] font-medium">{username}</p>
              <p className="text-[12px] text-[#86868B] mt-1">멤버 리스트와 포스트에 표시되는 이름입니다</p>
            </div>
          </div>
        </div>

        {/* @mention 섹션 */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-6">@mention</h3>
          <div className="flex items-center gap-8 max-w-[500px]">
            <span className="text-[20px] text-[#6E6E73]">@</span>
            <div className="flex-1">
              <p className="text-[14px] text-[#1D1D1F] font-medium">{mentionName}</p>
              <p className="text-[12px] text-[#86868B] mt-1">다른 사용자가 언급할 때 사용하는 이름입니다 (@username)</p>
            </div>
          </div>
        </div>

        {/* 계정 정보 섹션 */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-6">계정 정보</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-8 max-w-[500px]">
              <span className="text-[16px] text-[#6E6E73]">📧</span>
              <div className="flex-1">
                <p className="text-[14px] text-[#1D1D1F] font-medium">{email}</p>
              </div>
            </div>
            <div className="max-w-[500px] ml-12">
              <p className="text-[12px] text-[#86868B]">{joinDate}</p>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="border-t border-[#F2F2F7] pt-10 mt-16 flex justify-center">
          <div className="flex gap-4">
            <button className="w-[180px] rounded-[10px] bg-[#F2F2F7] px-6 py-3.5 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:bg-[#E5E5EA]">
              취소
            </button>
            <button className="w-[180px] rounded-[10px] bg-[#E5E5EA] px-6 py-3.5 text-[14px] font-medium text-[#C7C7CC] cursor-not-allowed" disabled>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(MySettingsPage);