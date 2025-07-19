좋은 접근입니다! 서버 구조를 그대로 유지하면서 클라이언트에서 필요에 따라 파싱하는 방식이 더 깔끔하겠네요.

## 1. NotificationDTO 타입 수정

```typescript
// 기본 알림 타입 (title, content, relatedUser, relatedPost 제거)
export interface NotificationDTO<T = any> {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  deepLink: string;
  payload: T;
}

// 각 타입별 Payload 정의
export interface CommentNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}

export interface PostReactionNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  reaction: {
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}

export interface CommentReactionNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  reaction: {
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL?: string | null;
    };
  };
}

// 타입별 NotificationDTO
export type CommentNotification = NotificationDTO<CommentNotificationPayload>;
export type PostReactionNotification = NotificationDTO<PostReactionNotificationPayload>;
export type CommentReactionNotification = NotificationDTO<CommentReactionNotificationPayload>;

// Union type
export type TypedNotificationDTO =
  | CommentNotification
  | PostReactionNotification
  | CommentReactionNotification
  | NotificationDTO; // 기타 타입들을 위한 fallback
```

## 2. 변환 함수 간소화

```typescript
function convertEventToDTO(eventData: NotificationEventData, timestamp: string): NotificationDTO {
  return {
    id: eventData.notificationId,
    category: eventData.category as NotificationCategory,
    type: eventData.type as NotificationType,
    isRead: false,
    createdAt: timestamp,
    deepLink: `/${eventData.spaceSlug}/notifications`,
    payload: {
      post: eventData.post,
      comment: eventData.comment,
      reaction: eventData.reaction,
    },
  };
}
```

## 3. Item 컴포넌트 수정 예시

```typescript
// CommentItem.tsx
interface CommentItemProps {
  notification: CommentNotification;
  onClick?: () => void;
}

const CommentItem = memo(function CommentItem({ notification, onClick }: CommentItemProps) {
  const { payload, createdAt, isRead } = notification;
  const { comment, post } = payload;

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
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <ProfileImage
            src={comment.author.avatarURL || ''}
            alt={comment.author.name}
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
                  {comment.author.name}
                </span>
                <span className="text-xs text-[#666666] md:text-sm">님이 댓글을 남겼습니다</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex items-center gap-1 rounded-full bg-[#F1F1F1] px-2 py-1">
                  <span className="text-xs text-[#666666]">💬</span>
                  <span className="text-xs font-medium text-[#666666]">댓글</span>
                </div>
                <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
              </div>
            </div>
          </div>

          {/* 댓글 내용 */}
          <div className="mb-3 rounded-lg bg-[#F8F9FA] p-2 md:p-3">
            <p className="text-xs leading-relaxed text-[#222222] md:text-sm">
              {truncateText(comment.content, 150)}
            </p>
          </div>

          {/* 포스트 정보 */}
          {post && (
            <div className="mb-2 rounded-lg border border-[#E5E7EB] bg-white p-2 md:p-3">
              <div className="mb-1 flex items-center gap-1">
                <span className="text-xs text-[#999999]">
                  {post.postType === 'checkout' ? '체크아웃' : '체크인'} 포스트
                </span>
              </div>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
            <span className="text-xs text-[#9747FF]">댓글 확인하기</span>
          </div>
        </div>
      </div>
    </div>
  );
});
```

## 4. 타입 가드 함수 (옵션)

타입 안정성을 위해 타입 가드 함수를 만들 수도 있습니다:

```typescript
// 타입 가드 함수들
export function isCommentNotification(
  notification: NotificationDTO
): notification is CommentNotification {
  return (
    notification.type === 'comment' &&
    'comment' in notification.payload &&
    'post' in notification.payload
  );
}

export function isPostReactionNotification(
  notification: NotificationDTO
): notification is PostReactionNotification {
  return (
    notification.type === 'emoji_reaction' &&
    'reaction' in notification.payload &&
    'post' in notification.payload &&
    !('comment' in notification.payload)
  );
}

export function isCommentReactionNotification(
  notification: NotificationDTO
): notification is CommentReactionNotification {
  return (
    notification.type === 'emoji_reaction' &&
    'reaction' in notification.payload &&
    'comment' in notification.payload &&
    'post' in notification.payload
  );
}
```

이렇게 하면 서버 구조를 그대로 유지하면서도 타입 안정성을 확보할 수 있습니다!
