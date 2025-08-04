'use client';

import { withAuth } from '@/shared/components/auth';

function RecommendSettingsPage() {
  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="mb-2 text-[20px] font-bold text-[#1D1D1F]">추천하기</h1>
        <p className="text-[14px] text-[#86868B] leading-[20px]">
          친구나 동료에게 Scrumble을 추천하세요.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-[12px] border border-[#F2F2F7] p-6 text-center">
          <p className="text-[16px] text-[#86868B]">준비 중인 기능입니다.</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(RecommendSettingsPage);