'use client';

import { ProfileImage } from '@/shared/components/ui';
import type { NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';

interface SpaceInfoUpdateItemProps {
  notification: NotificationDTO;
  onClick?: () => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const SpaceInfoUpdateItem = memo(function SpaceInfoUpdateItem({
  notification,
  onClick,
}: SpaceInfoUpdateItemProps) {
  const { relatedUser, content, createdAt, isRead, payload } = notification;

  const getUpdateTypeDisplayName = (type: string) => {
    switch (type) {
      case 'name':
        return '스페이스 이름';
      case 'description':
        return '스페이스 설명';
      case 'settings':
        return '스페이스 설정';
      default:
        return '스페이스 정보';
    }
  };

  const getUpdateMessage = (type: string) => {
    switch (type) {
      case 'name':
        return '스페이스 이름이 변경되었습니다';
      case 'description':
        return '스페이스 설명이 변경되었습니다';
      case 'settings':
        return '스페이스 설정이 변경되었습니다';
      default:
        return '스페이스 정보가 변경되었습니다';
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
        {/* 스페이스 정보 업데이트 아이콘 */}
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] md:h-10 md:w-10">
            <span className="text-xs font-bold text-white md:text-sm">⚙️</span>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 헤더 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#222222] md:text-base">
                  스페이스 정보 변경
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs text-[#666666]">⚙️</span>
                  <span className="text-xs font-medium text-[#666666]">설정</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>
          </div>

          {/* 변경 내용 */}
          <div className="mb-3 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
            <div className="mb-2">
              <span className="text-sm font-medium text-[#222222]">
                {getUpdateMessage(payload?.updateType || 'settings')}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm text-[#666666]">
                {getUpdateTypeDisplayName(payload?.updateType || 'settings')}:
              </span>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-[#222222]">
                  {truncateText(payload?.newValue || content, 100)}
                </p>
              </div>
            </div>
          </div>

          {/* 변경자 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProfileImage
                src={relatedUser?.avatarUrl || ''}
                alt={relatedUser?.name || '관리자'}
                size={24}
                className="h-5 w-5 md:h-6 md:w-6"
              />
              <span className="text-xs text-[#666666]">
                {relatedUser?.name || '관리자'}님이 변경
              </span>
              <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            </div>
            <span className="text-xs text-[#9747FF]">스페이스 설정 확인하기</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { SpaceInfoUpdateItem };
