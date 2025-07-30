'use client';

import { ProfileImage } from '@/shared/components/ui';
import type { MemberJoinLeaveNotificationPayload, NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface MemberJoinLeaveItemProps {
  notification: NotificationDTO<MemberJoinLeaveNotificationPayload>;
  onClick?: () => void;
}

const MemberJoinLeaveItem = memo(function MemberJoinLeaveItem({
  notification,
  onClick,
}: MemberJoinLeaveItemProps) {
  const { createdAt, isRead, type, payload } = notification;
  const { member } = payload;

  // 알림 타입에 따라 액션 결정
  const action = type === 'member_joined' ? 'join' : 'leave';

  const getActionMessage = (action: string) => {
    switch (action) {
      case 'join':
        return '스페이스에 참여했습니다';
      case 'leave':
        return '스페이스에서 나갔습니다';
      default:
        return '멤버 상태가 변경되었습니다';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'join':
        return '#10B981'; // green
      case 'leave':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'join':
        return '👋';
      case 'leave':
        return '👋';
      default:
        return '👥';
    }
  };

  return (
    <div
      className={`group relative min-h-[80px] cursor-pointer touch-manipulation bg-white p-4 transition-colors hover:bg-gray-50 active:bg-gray-100 md:p-[30px] ${
        !isRead ? 'border-l-4 border-l-[#9747FF]' : ''
      }`}
      onClick={onClick}
    >
      {/* 읽지 않음 표시 */}
      {!isRead && <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#9747FF]" />}

      <div className="flex gap-3 md:gap-[10px]">
        {/* 멤버 가입/탈퇴 아이콘 */}
        <div className="flex-shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full md:h-10 md:w-10"
            style={{ backgroundColor: getActionColor(action) }}
          >
            <span className="text-sm font-bold text-white">{getActionIcon(action)}</span>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 헤더 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#222222] md:text-base">
                  {action === 'join' ? '새 멤버 참여' : '멤버 탈퇴'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs text-[#666666]">👥</span>
                  <span className="text-xs font-medium text-[#666666]">멤버</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>
          </div>

          {/* 멤버 정보 */}
          <div className="mb-3 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
            <div className="flex items-center gap-2">
              <ProfileImage
                src={member?.avatarURL || ''}
                alt={member?.name || '사용자'}
                size={24}
                className="h-6 w-6 md:h-8 md:w-8"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#222222]">
                    {member?.name || '사용자'}
                  </span>
                  <span className="text-sm text-[#666666]">님이</span>
                </div>
                <span className="text-sm text-[#666666]">{getActionMessage(action)}</span>
              </div>
            </div>
          </div>

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#9747FF]">
              {action === 'join' ? '새 멤버 확인하기' : '멤버 목록 확인하기'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { MemberJoinLeaveItem };
