'use client';

import { useBulkMarkAsRead } from '@/shared/hooks/queries/useNotifications';
import { NotificationDTO } from '@/shared/types/notification';
import { memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useNotificationFilter } from '../hooks/useNotificationFilter';
import {
  CheckInPostItem,
  CheckOutPostItem,
  CommentItem,
  EmojiReactionItem,
  MemberJoinLeaveItem,
  MentionItem,
  RoleUpdateItem,
  SpaceInfoUpdateItem,
  SpaceNoticeItem,
} from './items';
import { EmptyState, NotificationSkeleton } from './ui';

interface VirtualizedNotificationListProps {
  spaceSlug: string;
  notifications: NotificationDTO[];
  isLoading?: boolean;
  isError?: boolean;
  height: number;
}

interface ItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    spaceSlug: string;
    notifications: NotificationDTO[];
    onNotificationClick: (notification: NotificationDTO) => void;
  };
}

const NotificationItem = memo(function NotificationItem({ index, style, data }: ItemProps) {
  const { spaceSlug, notifications, onNotificationClick } = data;
  const notification = notifications[index];

  if (!notification) return null;

  const onClick = () => onNotificationClick(notification);

  const renderContent = () => {
    // Use string type comparison for now
    switch (notification.type) {
      case 'check_in_post':
        return <CheckInPostItem notification={notification} onClick={onClick} />;

      case 'check_out_post':
        return <CheckOutPostItem notification={notification} onClick={onClick} />;

      case 'comment':
        return <CommentItem notification={notification} onClick={onClick} />;

      case 'emoji_reaction':
        return <EmojiReactionItem notification={notification} onClick={onClick} />;

      case 'mention':
        return <MentionItem notification={notification} onClick={onClick} />;

      case 'space_notice':
        return <SpaceNoticeItem notification={notification} onClick={onClick} />;

      case 'role_update':
        return <RoleUpdateItem notification={notification} onClick={onClick} />;

      case 'space_info_update':
        return <SpaceInfoUpdateItem notification={notification} onClick={onClick} />;

      case 'member_joined':
      case 'member_left':
        return <MemberJoinLeaveItem notification={notification} onClick={onClick} />;

      default:
        return null;
    }
  };

  return (
    <div style={style} className="border-b border-black/8 last:border-b-0">
      {renderContent()}
    </div>
  );
});

const VirtualizedNotificationList = memo(function VirtualizedNotificationList({
  spaceSlug,
  notifications,
  isLoading = false,
  isError = false,
  height,
}: VirtualizedNotificationListProps) {
  const { currentFilter } = useNotificationFilter();
  const { mutate: markAsRead } = useBulkMarkAsRead();

  const handleNotificationClick = useCallback(
    (notification: NotificationDTO) => {
      // 읽지 않은 알림이면 읽음으로 표시
      if (!notification.isRead) {
        markAsRead({
          spaceSlug,
          notificationIds: [notification.id],
        });
      }

      // 알림 유형에 따라 적절한 페이지로 이동
      const router = typeof window !== 'undefined' ? (window as any).router : null;
      if (!router) return;

      switch (notification.type) {
        case 'check_in_post':
        case 'check_out_post':
          router.push(`/${spaceSlug}/feed`);
          break;

        case 'comment':
        case 'emoji_reaction':
          if (notification.relatedPost?.id) {
            router.push(`/${spaceSlug}/feed?post=${notification.relatedPost.id}`);
          }
          break;

        case 'mention':
          if (notification.relatedPost?.id) {
            router.push(`/${spaceSlug}/feed?post=${notification.relatedPost.id}`);
          }
          break;

        case 'space_notice':
          router.push(`/${spaceSlug}/settings/space`);
          break;

        case 'role_update':
        case 'member_joined':
        case 'member_left':
          router.push(`/${spaceSlug}/settings/members`);
          break;

        case 'space_info_update':
          router.push(`/${spaceSlug}/settings/space`);
          break;

        default:
          router.push(`/${spaceSlug}/feed`);
      }
    },
    [spaceSlug, markAsRead]
  );

  // 로딩 상태
  if (isLoading) {
    return <NotificationSkeleton count={5} />;
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <p className="mb-4 text-center text-sm text-red-500">
          알림을 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#9747FF] transition-colors hover:text-[#7C3AED]"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  // 빈 상태
  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        category={currentFilter.category}
        isFiltered={currentFilter.category !== 'all' || currentFilter.isRead !== undefined}
      />
    );
  }

  const itemData = {
    spaceSlug,
    notifications,
    onNotificationClick: handleNotificationClick,
  };

  return (
    <List
      height={height}
      width="100%"
      itemCount={notifications.length}
      itemSize={120} // 각 알림 아이템의 예상 높이
      itemData={itemData}
    >
      {NotificationItem}
    </List>
  );
});

export { VirtualizedNotificationList };
