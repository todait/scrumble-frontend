'use client';

import { withAuth } from '@/shared/components/auth';

function FeedbackSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-[28px] font-bold text-[#1D1D1F]">피드백</h1>
        <p className="text-[14px] text-[#86868B]">
          서비스 개선을 위한 피드백을 보내주세요.
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

export default withAuth(FeedbackSettingsPage);