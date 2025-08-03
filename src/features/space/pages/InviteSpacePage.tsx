'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { inviteTeamSchema } from '@/schemas';
import { IntroLayout } from '@/shared/components/layout';
import { useForm } from '@/shared/hooks';

import { EmailTagInput } from '../components/forms';

interface InviteSpacePageProps {
  spaceSlug?: string; // 스페이스 ID
  spaceName?: string; // 추후 API로 받아올 예정
}

export const InviteSpacePage: React.FC<InviteSpacePageProps> = ({
  spaceSlug,
  spaceName = '스페이스 이름',
}) => {
  const router = useRouter();

  const {
    values,
    setValue,
    isValid,
    // isSubmitting, // TODO: 로딩 상태 표시에 사용 예정
    handleSubmit,
  } = useForm({
    schema: inviteTeamSchema,
    initialValues: { emails: [] },
    onSubmit: async data => {
      try {
        // TODO: API 호출로 팀 멤버 초대
        console.warn('스페이스 ID:', spaceSlug);
        console.warn('초대할 이메일 목록:', data.emails);

        // 성공 시 다음 페이지로 이동 (추후 구현)
        router.push(`/${spaceSlug}/feed`);
      } catch (error) {
        console.error('팀 초대 중 오류 발생:', error);
      }
    },
  });

  const handleCopyInviteLink = async () => {
    try {
      // TODO: 초대 링크 생성 API 호출
      const inviteLink = `${window.location.origin}/invite/${spaceSlug}`;

      await navigator.clipboard.writeText(inviteLink);

      // TODO: 토스트 알림 표시
      console.warn('초대 링크가 복사되었습니다!', inviteLink);
    } catch (error) {
      console.error('링크 복사 중 오류 발생:', error);
    }
  };

  const handleSkip = () => {
    router.push(`/${spaceSlug}/feed`);
  };

  const emailCount = values.emails?.length || 0;
  const hasValidEmails = emailCount > 0 && isValid;

  return (
    <IntroLayout>
      <div className="relative flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] space-y-6">
          {/* Header Section - 중앙 정렬 */}
          <div className="text-center space-y-4">
            {/* 스페이스 이름 칩 */}
            <div className="inline-flex items-center rounded-full border border-[#9747FF]/40 bg-[#9747FF] px-4 py-1.5">
              <span className="text-[15px] font-bold text-white">
                {spaceName}
              </span>
            </div>

            {/* 타이틀 */}
            <h1 className="text-[32px] font-bold text-[#222222]">
              팀원을 초대하세요
            </h1>

            {/* 설명 */}
            <p className="text-[15px] text-[#222222] opacity-50">
              이 공간을 함께 채워갈 멤버를 불러보세요.<br />
              이메일만 알려주시면, 저희가 초대 메일을 보낼게요.
            </p>
          </div>

          {/* Body Section - Email Input & Buttons */}
          <div className="space-y-4">
            {/* Email Tags Input */}
            <EmailTagInput
              emails={values.emails || []}
              onEmailsChange={emails => setValue('emails', emails)}
            />

            {/* 초대하기 버튼 */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasValidEmails}
              className="w-full h-[54px] bg-[#222222] text-white text-[15px] font-medium rounded-[12px] hover:bg-[#181818] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {hasValidEmails ? `${emailCount}명 초대하기` : '초대하기'}
            </button>

            {/* 일단 시작하기 버튼 */}
            <button
              type="button"
              onClick={handleSkip}
              className="w-full h-[54px] bg-[#F5F5F7] text-[#666666] text-[15px] font-medium rounded-[12px] hover:bg-[#EBEBF0] transition-colors"
            >
              일단 시작하기
            </button>

            {/* 초대 링크 복사하기 - 텍스트 링크 */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="text-[13px] text-[#222222] opacity-50 hover:opacity-70 transition-opacity"
              >
                초대 링크 복사하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </IntroLayout>
  );
};
