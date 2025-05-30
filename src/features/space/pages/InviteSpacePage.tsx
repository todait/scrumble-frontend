'use client';

import { useRouter } from 'next/navigation'; 
import React from 'react';

import { inviteTeamSchema } from '@/schemas';
import { IntroLayout } from '@/shared/components/layout';
import { useForm } from '@/shared/hooks';

import { InviteInput } from '../components/forms';
import { InviteHeader } from '../components/layout';
import { CopyLinkButton } from '../components/ui';

interface InviteSpacePageProps {
  spaceId?: string; // 스페이스 ID
  spaceName?: string; // 추후 API로 받아올 예정
}

export const InviteSpacePage: React.FC<InviteSpacePageProps> = ({ 
  spaceId,
  spaceName = "스페이스 이름" 
}) => {
  const router = useRouter(); 
  
  const {
    values,
    setValue,
    isValid,
    // isSubmitting, // TODO: 로딩 상태 표시에 사용 예정
    handleSubmit
  } = useForm({
    schema: inviteTeamSchema,
    initialValues: { emails: [] },
    onSubmit: async (data) => {
      try {
        // TODO: API 호출로 팀 멤버 초대
        console.warn('스페이스 ID:', spaceId);
        console.warn('초대할 이메일 목록:', data.emails);
        
        // 성공 시 다음 페이지로 이동 (추후 구현)
        router.push(`/${spaceId}/settings/members`);
      } catch (error) {
        console.error('팀 초대 중 오류 발생:', error);
      }
    },
  });

  const handleCopyInviteLink = async () => {
    try {
      // TODO: 초대 링크 생성 API 호출
      const inviteLink = `${window.location.origin}/invite/${spaceId}`;
      
      await navigator.clipboard.writeText(inviteLink);
      
      // TODO: 토스트 알림 표시
      console.warn('초대 링크가 복사되었습니다!', inviteLink);
    } catch (error) {
      console.error('링크 복사 중 오류 발생:', error);
    }
  };

  return (
    <IntroLayout>
      <div className="w-full max-w-[524px]">
        <InviteHeader spaceName={spaceName} />        

        {/* 이메일 입력 및 버튼 */}
        <div onSubmit={handleSubmit} className="space-y-[10px]">
          <InviteInput 
            emails={values.emails || []}
            onEmailsChange={(emails) => setValue('emails', emails)}
            onInvite={handleSubmit}
            disabled={!isValid}
          />
        </div>

        {/* 초대 링크 복사 버튼 */}
        <div className="mt-3">
          <CopyLinkButton onClick={handleCopyInviteLink} />
        </div>
      </div>
    </IntroLayout>
  );
}; 