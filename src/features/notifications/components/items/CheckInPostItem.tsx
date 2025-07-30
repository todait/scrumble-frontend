'use client';

import { ProfileImage, StatusBadge } from '@/shared/components/ui';
import type { CheckInPostNotificationPayload, NotificationDTO } from '@/shared/types/notification';
import { formatTime } from '@/shared/utils';
import { memo } from 'react';
import { truncateText } from '../../utils/notificationHelpers';

interface CheckInPostItemProps {
  notification: NotificationDTO<CheckInPostNotificationPayload>;
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const getConditionScoreColor = (score: number): string => {
  if (score >= 8) return '#10B981'; // green
  if (score >= 6) return '#F59E0B'; // yellow
  if (score >= 4) return '#EF4444'; // red
  return '#6B7280'; // gray
};

const getConditionLabel = (score: number): string => {
  if (score >= 8) return '좋음';
  if (score >= 6) return '보통';
  if (score >= 4) return '나쁨';
  return '매우 나쁨';
};

const CheckInPostItem = memo(function CheckInPostItem({
  notification,
  onClick,
  tabIndex = 0,
  role = 'button',
  'aria-label': ariaLabel,
  onKeyDown,
  ...props
}: CheckInPostItemProps) {
  const { createdAt, isRead, payload } = notification;
  const { author, content, conditionScore = 5 } = payload;
  const conditionColor = getConditionScoreColor(conditionScore);
  const conditionLabel = getConditionLabel(conditionScore);

  return (
    <div
      className={`group relative min-h-[80px] cursor-pointer touch-manipulation bg-white p-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:ring-offset-2 active:bg-gray-100 md:p-[30px] ${
        !isRead ? 'border-l-4 border-l-[#9747FF]' : ''
      }`}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={
        ariaLabel || `${author?.name || '사용자'}님의 체크인 알림, 컨디션 점수 ${conditionScore}점`
      }
      onKeyDown={onKeyDown}
      {...props}
    >
      {/* 읽지 않음 표시 */}
      {!isRead && (
        <div
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#9747FF]"
          aria-label="읽지 않은 알림"
          role="status"
        />
      )}

      <div className="flex gap-3 md:gap-[10px]">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={author?.avatarURL || ''}
            alt={author?.name || '사용자'}
            size={32}
            className="h-8 w-8 md:h-10 md:w-10"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1">
          {/* 헤더 */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#222222] md:text-base">
                  {author?.name || '사용자'}
                </span>
                <span className="text-xs text-[#666666] md:text-sm">님이 체크인했습니다</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <StatusBadge type="checkin" className="text-xs" />
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>

            {/* 컨디션 점수 */}
            <div
              className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded border px-2 py-1 text-xs font-bold"
              style={{
                backgroundColor: conditionColor,
                color: 'white',
                borderColor: conditionColor,
              }}
              aria-label={`컨디션 점수 ${conditionScore}점, ${conditionLabel}`}
              role="status"
            >
              {conditionScore}
            </div>
          </div>

          {/* 포스트 내용 */}
          {content && (
            <div className="mb-2 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
              <p className="text-xs leading-relaxed text-[#222222] md:text-sm">
                {truncateText(content, 150)}
              </p>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#999999]">컨디션 {conditionLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { CheckInPostItem };
