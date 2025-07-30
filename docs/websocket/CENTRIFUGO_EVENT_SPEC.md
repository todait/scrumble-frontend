# Centrifugo 실시간 이벤트 명세서

## 개요

Scrumble 백엔드는 Centrifugo를 통해 실시간 이벤트를 브로드캐스트합니다. 이 문서는 클라이언트 개발자가 WebSocket을 통해 실시간 이벤트를 구독하고 처리하는 데 필요한 모든 정보를 제공합니다.

## 채널 구조

### 1. 스페이스 채널

```
space:{spaceSlug}
```

- **용도**: 스페이스 전체 이벤트 (포스트 생성/수정/삭제)
- **예제**: `space:my-team-space`

### 2. 포스트 채널

```
space:{spaceSlug}:post:{postID}
```

- **용도**: 특정 포스트 관련 이벤트 (댓글, 포스트 변경)
- **예제**: `space:my-team-space:post:123e4567-e89b-12d3-a456-426614174000`

### 3. 리액션 채널

```
space:{spaceSlug}:post:{postID}:reactions
```

- **용도**: 포스트 리액션 추가/제거 이벤트
- **예제**: `space:my-team-space:post:123e4567-e89b-12d3-a456-426614174000:reactions`

### 4. 멤버 알림 채널

```
space:{spaceSlug}:member:{memberID}:notifications
```

- **용도**: 특정 멤버의 알림 이벤트
- **예제**: `space:my-team-space:member:456e7890-e89b-12d3-a456-426614174000:notifications`

## 이벤트 타입

### 댓글 이벤트

- `comment.created` - 댓글 생성
- `comment.updated` - 댓글 수정
- `comment.deleted` - 댓글 삭제

### 포스트 이벤트

- `post.created` - 포스트 생성
- `post.updated` - 포스트 수정
- `post.deleted` - 포스트 삭제

### 리액션 이벤트

- `reaction.added` - 리액션 추가
- `reaction.removed` - 리액션 제거

### 알림 이벤트

- `notification.created` - 알림 생성
- `notification.read` - 알림 읽음

## 메시지 구조

모든 실시간 이벤트는 다음과 같은 공통 구조를 가집니다:

```json
{
  "type": "string", // 이벤트 타입 (예: "comment.created")
  "spaceSlug": "string", // 스페이스 슬러그
  "postId": "string", // 포스트 ID (해당되는 경우)
  "userId": "string", // 이벤트를 발생시킨 사용자 ID
  "data": {}, // 이벤트별 상세 데이터
  "timestamp": "string" // ISO 8601 형식의 타임스탬프
}
```

## 이벤트별 상세 명세

### 1. 댓글 이벤트

**채널**: `space:{spaceSlug}:post:{postID}`

#### comment.created

```json
{
  "type": "comment.created",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "commentId": "comment-uuid",
    "authorId": "author-uuid",
    "authorName": "John Doe",
    "authorAvatarURL": "https://...",
    "content": "댓글 내용",
    "parentCommentId": null, // 대댓글인 경우 부모 댓글 ID
    "createdAt": "2023-07-17T10:30:00Z"
  },
  "timestamp": "2023-07-17T10:30:00Z"
}
```

#### comment.updated

```json
{
  "type": "comment.updated",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "commentId": "comment-uuid",
    "content": "수정된 댓글 내용",
    "updatedAt": "2023-07-17T10:35:00Z"
  },
  "timestamp": "2023-07-17T10:35:00Z"
}
```

#### comment.deleted

```json
{
  "type": "comment.deleted",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "commentId": "comment-uuid"
  },
  "timestamp": "2023-07-17T10:40:00Z"
}
```

### 2. 포스트 이벤트

**채널**: `space:{spaceSlug}` + `space:{spaceSlug}:post:{postID}` (배치 발행)

#### post.created

```json
{
  "type": "post.created",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "postId": "post-uuid",
    "authorId": "author-uuid",
    "authorName": "Jane Doe",
    "authorAvatarURL": "https://...",
    "title": "포스트 제목",
    "content": "포스트 내용",
    "category": "general",
    "createdAt": "2023-07-17T10:30:00Z"
  },
  "timestamp": "2023-07-17T10:30:00Z"
}
```

#### post.updated

```json
{
  "type": "post.updated",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "postId": "post-uuid",
    "title": "수정된 포스트 제목",
    "content": "수정된 포스트 내용",
    "updatedAt": "2023-07-17T10:35:00Z"
  },
  "timestamp": "2023-07-17T10:35:00Z"
}
```

#### post.deleted

```json
{
  "type": "post.deleted",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "postId": "post-uuid"
  },
  "timestamp": "2023-07-17T10:40:00Z"
}
```

### 3. 리액션 이벤트

**채널**: `space:{spaceSlug}:post:{postID}:reactions`

#### reaction.added

```json
{
  "type": "reaction.added",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "reactionId": "reaction-uuid",
    "postId": "post-uuid",
    "userId": "user-uuid",
    "userName": "John Doe",
    "userAvatarURL": "https://...",
    "emoji": "👍",
    "createdAt": "2023-07-17T10:30:00Z"
  },
  "timestamp": "2023-07-17T10:30:00Z"
}
```

#### reaction.removed

```json
{
  "type": "reaction.removed",
  "spaceSlug": "my-team-space",
  "postId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-string",
  "data": {
    "reactionId": "reaction-uuid",
    "postId": "post-uuid",
    "userId": "user-uuid",
    "emoji": "👍"
  },
  "timestamp": "2023-07-17T10:30:00Z"
}
```

### 4. 알림 이벤트

**채널**: `space:{spaceSlug}:member:{memberID}:notifications`

#### notification.created

```json
{
  "type": "notification.created",
  "spaceSlug": "my-team-space",
  "postId": "related-content-id",
  "userId": "triggering-user-id",
  "data": {
    "notificationId": "notification-uuid",
    "memberId": "target-member-uuid",
    "category": "comment",
    "type": "comment_on_post",
    "spaceId": "space-uuid",
    "spaceSlug": "my-team-space",
    "action": "notification.created",
    // 알림별 추가 페이로드 데이터
    "authorName": "John Doe",
    "postTitle": "관련 포스트 제목"
  },
  "timestamp": "2023-07-17T10:30:00Z"
}
```

#### notification.read

```json
{
  "type": "notification.read",
  "spaceSlug": "my-team-space",
  "postId": "notification-id",
  "userId": "member-id",
  "data": {
    "notificationId": "notification-uuid",
    "memberId": "member-uuid",
    "category": "comment",
    "type": "comment_on_post",
    "spaceId": "space-uuid",
    "spaceSlug": "my-team-space",
    "action": "notification.read"
  },
  "timestamp": "2023-07-17T10:35:00Z"
}
```

## 클라이언트 구현 가이드

### 1. 기본 연결 설정

```javascript
import { Centrifuge } from 'centrifuge';

const centrifuge = new Centrifuge('ws://localhost:8080/connection/websocket', {
  token: 'your-jwt-token',
});

centrifuge.connect();
```

### 2. 채널 구독

```javascript
// 스페이스 전체 이벤트 구독
const spaceSubscription = centrifuge.newSubscription(`space:${spaceSlug}`);
spaceSubscription.on('publication', ctx => {
  const event = ctx.data;
  console.log('Space event:', event);

  switch (event.type) {
    case 'post.created':
      handlePostCreated(event);
      break;
    case 'post.updated':
      handlePostUpdated(event);
      break;
    case 'post.deleted':
      handlePostDeleted(event);
      break;
  }
});
spaceSubscription.subscribe();

// 특정 포스트 이벤트 구독
const postSubscription = centrifuge.newSubscription(`space:${spaceSlug}:post:${postId}`);
postSubscription.on('publication', ctx => {
  const event = ctx.data;
  console.log('Post event:', event);

  switch (event.type) {
    case 'comment.created':
      handleCommentCreated(event);
      break;
    case 'comment.updated':
      handleCommentUpdated(event);
      break;
    case 'comment.deleted':
      handleCommentDeleted(event);
      break;
  }
});
postSubscription.subscribe();

// 리액션 이벤트 구독
const reactionSubscription = centrifuge.newSubscription(
  `space:${spaceSlug}:post:${postId}:reactions`
);
reactionSubscription.on('publication', ctx => {
  const event = ctx.data;
  console.log('Reaction event:', event);

  switch (event.type) {
    case 'reaction.added':
      handleReactionAdded(event);
      break;
    case 'reaction.removed':
      handleReactionRemoved(event);
      break;
  }
});
reactionSubscription.subscribe();

// 멤버별 알림 이벤트 구독
const notificationSubscription = centrifuge.newSubscription(
  `space:${spaceSlug}:member:${memberId}:notifications`
);
notificationSubscription.on('publication', ctx => {
  const event = ctx.data;
  console.log('Notification event:', event);

  switch (event.type) {
    case 'notification.created':
      handleNotificationCreated(event);
      break;
    case 'notification.read':
      handleNotificationRead(event);
      break;
  }
});
notificationSubscription.subscribe();
```

### 3. 이벤트 핸들러 예제

```javascript
function handleCommentCreated(event) {
  // 새 댓글을 UI에 추가
  const comment = event.data;
  addCommentToUI(comment);

  // 댓글 수 업데이트
  updateCommentCount(event.postId, +1);
}

function handleReactionAdded(event) {
  // 리액션을 UI에 반영
  const reaction = event.data;
  addReactionToUI(reaction);
}

function handleNotificationCreated(event) {
  // 새 알림을 알림 목록에 추가
  const notification = event.data;
  addNotificationToUI(notification);

  // 알림 배지 업데이트
  updateNotificationBadge();
}
```

### 4. 에러 처리

```javascript
centrifuge.on('error', ctx => {
  console.error('Connection error:', ctx);
});

centrifuge.on('disconnect', ctx => {
  console.log('Disconnected:', ctx);
});

subscription.on('error', ctx => {
  console.error('Subscription error:', ctx);
});
```

## 주의사항

1. **JWT 토큰**: WebSocket 연결 시 유효한 JWT 토큰이 필요합니다.
2. **연결 관리**: 네트워크 연결이 끊어졌을 때 자동 재연결을 처리해야 합니다.
3. **메모리 관리**: 더 이상 필요하지 않은 구독은 `unsubscribe()`를 호출하여 정리해야 합니다.
4. **중복 처리**: 같은 이벤트가 여러 번 수신될 수 있으므로 중복 처리 로직을 구현해야 합니다.

## 환경별 엔드포인트

- **Development**: `ws://localhost:8080/connection/websocket`

## 관련 문서

- [Centrifugo Setup Guide](./CENTRIFUGO_SETUP.md)
- [Centrifugo Migration Guide](./CENTRIFUGO_MIGRATION_GUIDE.md)
- [Authentication API Specification](./AUTH_API_SPECIFICATION.md)
