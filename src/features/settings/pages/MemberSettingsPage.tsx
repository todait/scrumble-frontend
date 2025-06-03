'use client';

import { useState } from 'react';

import { InviteInput } from '@/features/space/components/forms';
import { CopyLinkButton } from '@/features/space/components/ui/CopyLinkButton';
import { inviteTeamSchema } from '@/schemas';
import { useForm } from '@/shared/hooks';
import { useToast } from '@/shared/hooks/useToast';

import { MemberTable, type Member } from '../components/tables';

// 더미 데이터
const dummyMembers: Member[] = [
  {
    id: '1',
    name: '장하준',
    displayName: '은붕어',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: true,
    lastActivity: '오전 10:49 (1시간 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  },
  {
    id: '2',
    name: '박노라',
    displayName: '느므좋아',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: true,
    lastActivity: '오전 11:49 (1분 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  },
  {
    id: '3',
    name: '김승호',
    displayName: '해운대쌀밥',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: false,
    lastActivity: '오전 10:49 (1시간 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  },
  {
    id: '4',
    name: '유자청',
    displayName: '때잉',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: false,
    lastActivity: '6월 2일 (2일 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  },
  {
    id: '5',
    name: '우아정',
    displayName: '쫄라당쑤나',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: true,
    lastActivity: '오전 9:49 (19시간 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  },
  {
    id: '6',
    name: '김준수',
    displayName: '컬리',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: true,
    lastActivity: '오전 10:49 (1시간 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  },
  {
    id: '7',
    name: '백차롱',
    displayName: '킹카원훈',
    email: '5zinguh@sea.food',
    role: '멤버',
    isActive: false,
    lastActivity: '오전 10:49 (1시간 전)',
    invitedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  },
];

export default function MemberSettingsPage() {
  const [members] = useState<Member[]>(dummyMembers);
  const { success, info } = useToast();

  const { values, setValue, isValid, handleSubmit } = useForm({
    schema: inviteTeamSchema,
    initialValues: { emails: [] },
    onSubmit: async data => {
      try {
        // TODO: API 호출로 팀 멤버 초대
        console.warn('초대할 이메일 목록:', data.emails);

        // 성공 시 토스트 표시
        success({
          title: '초대 완료',
          message: `${data.emails.length}명에게 초대장을 발송했습니다.`,
        });

        // 이메일 초기화
        setValue('emails', []);
      } catch (error) {
        console.error('팀 초대 중 오류 발생:', error);
      }
    },
  });

  const handleCopyEmail = () => {
    info({
      title: '복사 완료',
      message: '이메일 주소가 클립보드에 복사되었습니다.',
    });
  };

  const handleCopyInviteLink = async () => {
    try {
      // TODO: 실제 스페이스 ID를 사용해야 함
      const spaceId = 'current-space-id';
      const inviteLink = `${window.location.origin}/invite/${spaceId}`;

      await navigator.clipboard.writeText(inviteLink);

      success({
        title: '링크 복사 완료',
        message: '초대 링크가 클립보드에 복사되었습니다.',
      });
    } catch (error) {
      console.error('링크 복사 중 오류 발생:', error);
    }
  };

  const handleMemberAction = (memberId: string, action: string) => {
    console.warn('Member action:', memberId, action);
    // TODO: 멤버 관리 액션 구현 (권한 변경, 제거 등)
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours > 12 ? hours - 12 : hours || 12;

    return `${month}월 ${date}일 ${period} ${displayHours}:${minutes.toString().padStart(2, '0')} 기준`;
  };

  return (
    <div className="px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#181818]">멤버 관리</h1>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
            전체 {members.length}명
          </span>
        </div>
        <p className="text-gray-600">팀 멤버를 초대하고 관리하세요 • {getCurrentDateTime()}</p>
      </div>

      {/* 이메일 입력 및 초대하기 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">새 멤버 초대</h3>
        <div className="flex w-full items-start gap-3">
          {/* 이메일 입력 및 초대 버튼 */}
          <div className="flex-1">
            <InviteInput
              emails={values.emails || []}
              onEmailsChange={emails => setValue('emails', emails)}
              onInvite={handleSubmit}
              disabled={!isValid}
              layout="inline"
              buttonText="+ 초대하기"
            />
          </div>

          {/* 구분선 */}
          <div className="flex items-center px-2 pt-[10px]">
            <span className="text-sm text-gray-400">또는</span>
          </div>

          {/* 초대 링크 복사 */}
          <div className="shrink-0">
            <CopyLinkButton onClick={handleCopyInviteLink} />
          </div>
        </div>
      </div>

      {/* 멤버 테이블 */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">현재 멤버</h3>
        <MemberTable
          members={members}
          onCopyEmail={handleCopyEmail}
          onMemberAction={handleMemberAction}
        />
      </div>
    </div>
  );
}
