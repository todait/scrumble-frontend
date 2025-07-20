'use client';

import type { NotificationDTO } from '@/shared/types/notification';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef } from 'react';
import {
  CommentItem,
  EmojiReactionItem,
  MemberJoinLeaveItem,
  MentionItem,
  RoleUpdateItem,
  SpaceInfoUpdateItem,
  SpaceNoticeItem,
} from './items';
import { EmptyState, NotificationSkeleton } from './ui';

interface NotificationItemListProps {
  spaceSlug: string;
  notifications: NotificationDTO[];
  isLoading?: boolean;
  isError?: boolean;
  onMarkAsRead: (notificationIds: string[]) => Promise<void>;
  isMarkingAsRead: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
}

const NotificationItemList = memo(function NotificationItemList({
  spaceSlug,
  notifications,
  isLoading = false,
  isError = false,
  onMarkAsRead,
  isMarkingAsRead,
  onLoadMore,
  hasMore = false,
  isFetchingNextPage = false,
}: NotificationItemListProps) {
  const router = useRouter();

  // 키보드 네비게이션을 위한 ref
  const notificationListRef = useRef<HTMLDivElement>(null);
  const notificationItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 무한 스크롤을 위한 observer ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 키보드 네비게이션 핸들러
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!notificationListRef.current) return;

    const notificationElements = Array.from(notificationItemRefs.current.values());
    const currentIndex = notificationElements.findIndex(el => el === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < notificationElements.length - 1 ? currentIndex + 1 : 0;
        notificationElements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : notificationElements.length - 1;
        notificationElements[prevIndex]?.focus();
        break;

      case 'Home':
        event.preventDefault();
        notificationElements[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        notificationElements[notificationElements.length - 1]?.focus();
        break;
    }
  }, []);

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    const listElement = notificationListRef.current;
    if (listElement) {
      listElement.addEventListener('keydown', handleKeyboardNavigation);
      return () => listElement.removeEventListener('keydown', handleKeyboardNavigation);
    }
  }, [handleKeyboardNavigation]);

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    const loadMoreElement = loadMoreRef.current;
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [onLoadMore, hasMore, isFetchingNextPage]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationDTO) => {
      // 읽지 않은 알림이면 읽음으로 표시
      if (!notification.isRead) {
        try {
          await onMarkAsRead([notification.id]);
        } catch (error) {
          console.error('알림 읽음 처리 실패:', error);
        }
      }

      console.log('notification', notification);

      // deepLink가 있으면 해당 경로로 이동, 없으면 기본 경로로 이동
      if (notification.deepLink) {
        router.push(notification.deepLink);
      } else {
        // 알림 유형에 따라 적절한 페이지로 이동
        switch (notification.type) {
          case 'comment':
          case 'emoji_reaction':
            if (notification.payload?.post?.postId) {
              router.push(`/${spaceSlug}/feed?post=${notification.payload.post.postId}`);
            } else {
              router.push(`/${spaceSlug}/feed`);
            }
            break;

          case 'mention':
            if (
              notification.payload?.context?.type === 'post' &&
              notification.payload?.context?.id
            ) {
              router.push(`/${spaceSlug}/feed?post=${notification.payload.context.id}`);
            } else if (
              notification.payload?.context?.type === 'comment' &&
              notification.payload?.context?.id
            ) {
              router.push(`/${spaceSlug}/feed?comment=${notification.payload.context.id}`);
            } else {
              router.push(`/${spaceSlug}/feed`);
            }
            break;

          case 'space_notice':
          case 'space_info_update':
            router.push(`/${spaceSlug}/settings/space`);
            break;

          case 'role_update':
          case 'member_joined':
          case 'member_left':
            router.push(`/${spaceSlug}/settings/members`);
            break;

          default:
            router.push(`/${spaceSlug}/feed`);
        }
      }
    },
    [spaceSlug, router, onMarkAsRead]
  );

  const renderNotificationItem = useCallback(
    (notification: NotificationDTO) => {
      const key = notification.id;
      const onClick = () => handleNotificationClick(notification);

      // 키보드 네비게이션과 접근성을 위한 props
      const commonProps = {
        onClick,
        tabIndex: 0,
        role: 'button',
        'aria-label': `알림: ${notification.type} - ${notification.payload?.title || ''}`
          .replace(/_/g, ' ')
          .trim(),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
        ref: (el: HTMLDivElement | null) => {
          if (el) {
            notificationItemRefs.current.set(key, el);
          } else {
            notificationItemRefs.current.delete(key);
          }
        },
      };

      // 새로운 API 구조에 맞춰 알림 타입별로 렌더링
      switch (notification.type) {
        case 'comment':
          return <CommentItem key={key} {...commonProps} notification={notification} />;

        case 'emoji_reaction':
          return <EmojiReactionItem key={key} {...commonProps} notification={notification} />;

        case 'mention':
          return <MentionItem key={key} {...commonProps} notification={notification} />;

        case 'space_notice':
          return <SpaceNoticeItem key={key} {...commonProps} notification={notification} />;

        case 'role_update':
          return <RoleUpdateItem key={key} {...commonProps} notification={notification} />;

        case 'space_info_update':
          return <SpaceInfoUpdateItem key={key} {...commonProps} notification={notification} />;

        case 'member_joined':
        case 'member_left':
          return <MemberJoinLeaveItem key={key} {...commonProps} notification={notification} />;

        case 'system_notice':
          return <SpaceNoticeItem key={key} {...commonProps} notification={notification} />;

        default:
          // 기본 알림 아이템 (향후 확장을 위해)
          return (
            <div
              key={key}
              {...commonProps}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.payload?.title || notification.type}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {notification.payload?.content || ''}
                </p>
                <time className="mt-2 block text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleString('ko-KR')}
                </time>
              </div>
              {!notification.isRead && (
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              )}
            </div>
          );
      }
    },
    [handleNotificationClick]
  );

  // 로딩 상태
  if (isLoading) {
    return <NotificationSkeleton count={5} />;
  }

  // 에러 상태
  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center px-4 py-12"
        role="alert"
        aria-live="polite"
      >
        <div className="mb-4 rounded-full bg-red-50 p-3">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-base font-semibold text-red-700">알림을 불러올 수 없습니다</h3>

        <p className="mb-4 max-w-md text-center text-sm text-red-600">
          네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] touch-manipulation rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="페이지 새로고침하기"
          >
            새로고침
          </button>

          <button
            onClick={() => window.history.back()}
            className="min-h-[44px] touch-manipulation rounded-lg bg-gray-500 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="이전 페이지로 돌아가기"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!notifications || notifications.length === 0) {
    return <EmptyState category="all" isFiltered={false} />;
  }

  return (
    <div
      ref={notificationListRef}
      className="divide-y divide-black/8"
      role="listbox"
      aria-label="알림 목록"
      aria-live="polite"
    >
      {notifications.map(renderNotificationItem)}

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#9747FF]"></div>
              <span className="text-sm text-gray-500">더 많은 알림을 불러오는 중...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-[#9747FF] transition-colors hover:text-[#7C3AED]"
            >
              더 많은 알림 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export { NotificationItemList };
