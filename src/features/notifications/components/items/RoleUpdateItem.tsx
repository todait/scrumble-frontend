'use client';

import { ProfileImage } from '@/shared/components/ui';
import type { NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface RoleUpdateItemProps {
  notification: NotificationDTO;
  onClick?: () => void;
}

const RoleUpdateItem = memo(function RoleUpdateItem({
  notification,
  onClick,
}: RoleUpdateItemProps) {
  const { createdAt, isRead, payload } = notification;
  // 임시 처리: payload에서 데이터 추출
  const relatedUser = payload?.relatedUser || payload?.member;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'member':
        return '멤버';
      case 'moderator':
        return '모더레이터';
      default:
        return role;
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
        {/* 역할 업데이트 아이콘 */}
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B] md:h-10 md:w-10">
            <span className="text-xs font-bold text-white md:text-sm">👤</span>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 헤더 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#222222] md:text-base">역할 변경</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs text-[#666666]">👤</span>
                  <span className="text-xs font-medium text-[#666666]">역할</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>
          </div>

          {/* 역할 변경 내용 */}
          <div className="mb-3 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
            <div className="mb-2 flex items-center gap-2">
              <ProfileImage
                src={relatedUser?.avatarUrl || ''}
                alt={relatedUser?.name || '사용자'}
                size={24}
                className="h-5 w-5 md:h-6 md:w-6"
              />
              <span className="font-medium text-[#222222]">{relatedUser?.name || '사용자'}</span>
              <span className="text-sm text-[#666666]">님의 역할이</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#666666]">다음으로 변경되었습니다:</span>
              <div className="rounded-full bg-[#9747FF] px-2 py-1">
                <span className="text-xs font-medium text-white">
                  {getRoleDisplayName(payload?.newRole || 'member')}
                </span>
              </div>
            </div>
          </div>

          {/* 변경자 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProfileImage
                src={payload?.updatedBy?.avatarUrl || ''}
                alt={payload?.updatedBy?.name || '관리자'}
                size={24}
                className="h-5 w-5 md:h-6 md:w-6"
              />
              <span className="text-xs text-[#666666]">
                {payload?.updatedBy?.name || '관리자'}님이 변경
              </span>
              <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            </div>
            <span className="text-xs text-[#9747FF]">멤버 설정 확인하기</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { RoleUpdateItem };
