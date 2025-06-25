# WebSocket 구독 가이드

## 개요

WebSocket 서비스는 실시간 이벤트 구독을 위한 포괄적인 기능을 제공합니다. 댓글, 리액션, 포스트에 대한 개별 및 배치 구독을 지원합니다.

## 지원하는 구독 타입

### 1. 댓글 구독 (Comments) ✅ 백엔드 지원
- **개별 구독**: 특정 포스트의 댓글 이벤트 구독
- **배치 구독**: 여러 포스트의 댓글 이벤트를 한 번에 구독
- **자동 관리**: Viewport에 보이는 포스트에 자동 구독/해제

### 2. 리액션 구독 (Reactions) ✅ 백엔드 지원
- **개별 구독**: 특정 포스트의 리액션 이벤트 구독
- **배치 구독**: 여러 포스트의 리액션 이벤트를 한 번에 구독
- **실시간 업데이트**: 이모지 리액션 추가/제거 실시간 반영

### 3. 포스트 구독 (Posts) 🚧 향후 백엔드 지원 예정
- **스페이스 구독**: 특정 스페이스의 포스트 이벤트 구독
- **배치 구독**: 여러 스페이스의 포스트 이벤트를 한 번에 구독
- **신규 포스트**: 체크인/체크아웃 포스트 생성 실시간 알림

## API 레퍼런스

### Comments 구독

```typescript
import { websocketService } from '@/shared/services/websocket.service';

// 개별 댓글 구독
websocketService.subscribeToComments('post-id');
websocketService.unsubscribeFromComments('post-id');

// 배치 댓글 구독
websocketService.batchSubscribeToComments(['post-1', 'post-2', 'post-3']);
websocketService.batchUnsubscribeFromComments(['post-1', 'post-2']);

// 현재 구독 중인 포스트 목록 확인
const subscribedPostIds = websocketService.getSubscribedPostIds();
```

### Reactions 구독

```typescript
// 개별 리액션 구독
websocketService.subscribeToReactions('post-id');
websocketService.unsubscribeFromReactions('post-id');

// 배치 리액션 구독
websocketService.batchSubscribeToReactions(['post-1', 'post-2', 'post-3']);
websocketService.batchUnsubscribeFromReactions(['post-1', 'post-2']);

// 현재 구독 중인 리액션 포스트 목록 확인
const subscribedReactionPostIds = websocketService.getSubscribedReactionPostIds();
```

### Posts 구독 (향후 지원)

```typescript
// 스페이스 포스트 구독
websocketService.subscribeToPosts('space-slug');
websocketService.unsubscribeFromPosts('space-slug');

// 배치 포스트 구독
websocketService.batchSubscribeToPosts(['space-1', 'space-2', 'space-3']);
websocketService.batchUnsubscribeFromPosts(['space-1', 'space-2']);

// 현재 구독 중인 스페이스 목록 확인
const subscribedSpaceSlugs = websocketService.getSubscribedPostSpaceSlugs();
```

## React Hook 통합

### useWebSocket 훅에서 사용

```typescript
import { useWebSocket } from '@/shared/hooks/useWebSocket';

function FeedPage({ spaceSlug }: { spaceSlug: string }) {
  const { connected, addEventListener } = useWebSocket({
    spaceSlug,
    visiblePostIds: ['post-1', 'post-2'], // 자동 댓글 구독
  });

  useEffect(() => {
    if (connected) {
      // 리액션 구독 추가
      websocketService.batchSubscribeToReactions(['post-1', 'post-2']);
      
      // 포스트 이벤트 구독 (향후 지원)
      websocketService.subscribeToPosts(spaceSlug);
    }
  }, [connected, spaceSlug]);

  // 리액션 이벤트 핸들러 등록
  useEffect(() => {
    const handleReactionAdded = (message: any) => {
      console.log('리액션 추가됨:', message);
      // 리액션 상태 업데이트 로직
    };

    const handleReactionRemoved = (message: any) => {
      console.log('리액션 제거됨:', message);
      // 리액션 상태 업데이트 로직
    };

    addEventListener('reaction.added', handleReactionAdded);
    addEventListener('reaction.removed', handleReactionRemoved);

    return () => {
      removeEventListener('reaction.added', handleReactionAdded);
      removeEventListener('reaction.removed', handleReactionRemoved);
    };
  }, [addEventListener, removeEventListener]);
}
```

## 배치 구독의 장점

### 성능 최적화
- **네트워크 트래픽 감소**: 여러 구독을 하나의 메시지로 처리
- **서버 부하 감소**: 개별 요청 대신 배치 처리로 효율성 향상
- **동시성 처리**: 여러 구독을 원자적으로 처리

### 사용 시나리오
```typescript
// ❌ 비효율적: 개별 구독
visiblePosts.forEach(postId => {
  websocketService.subscribeToComments(postId);
  websocketService.subscribeToReactions(postId);
});

// ✅ 효율적: 배치 구독
const postIds = visiblePosts.map(post => post.id);
websocketService.batchSubscribeToComments(postIds);
websocketService.batchSubscribeToReactions(postIds);
```

## 메시지 타입 정의

### 백엔드에서 지원하는 메시지 타입

#### Comments
- `subscribe` / `unsubscribe` - 개별 댓글 구독/해제
- `batchSubscribe` / `batchUnsubscribe` - 배치 댓글 구독/해제

#### Reactions
- `subscribeReactions` / `unsubscribeReactions` - 개별 리액션 구독/해제
- `batchSubscribeReactions` / `batchUnsubscribeReactions` - 배치 리액션 구독/해제

#### Posts (향후 지원)
- `subscribePosts` / `unsubscribePosts` - 스페이스 포스트 구독/해제
- `batchSubscribePosts` / `batchUnsubscribePosts` - 배치 포스트 구독/해제

## 에러 처리

```typescript
// 연결 상태 확인
if (!websocketService.connected) {
  console.warn('WebSocket이 연결되지 않았습니다');
  return;
}

// 구독 실패 시 로그
websocketService.addEventListener('subscription.response', (message) => {
  if (!message.success) {
    console.error('구독 실패:', message.message);
  }
});
```

## 디버깅

### 구독 상태 확인

```typescript
// 전체 구독 정보 출력
websocketService.debugInfo();

// 브라우저 콘솔에서 사용
window.debugWebSocket(); // 전역 디버깅 함수
window.wsService.getSubscribedPostIds(); // 댓글 구독 목록
window.wsService.getSubscribedReactionPostIds(); // 리액션 구독 목록
```

### 로그 모니터링

개발 환경에서는 다음과 같은 로그들을 확인할 수 있습니다:

```bash
[WebSocket] Sending message: { type: 'batchSubscribeReactions', ... }
[WebSocket] Raw message received: {"type":"reaction.added",...}
[WebSocket] Found 1 handlers for message type: reaction.added
```

## 모범 사례

### 1. 생명주기 관리
```typescript
useEffect(() => {
  // 컴포넌트 마운트 시 구독
  if (connected && visiblePostIds.length > 0) {
    websocketService.batchSubscribeToReactions(visiblePostIds);
  }

  // 컴포넌트 언마운트 시 구독 해제
  return () => {
    websocketService.batchUnsubscribeFromReactions(visiblePostIds);
  };
}, [connected, visiblePostIds]);
```

### 2. 조건부 구독
```typescript
// 필요한 경우에만 구독
if (enableRealtimeReactions) {
  websocketService.batchSubscribeToReactions(postIds);
}
```

### 3. 메모리 누수 방지
```typescript
// 컴포넌트 언마운트 시 모든 이벤트 리스너 제거
useEffect(() => {
  return () => {
    websocketService.disconnect(); // 필요한 경우에만
  };
}, []);
```

## 향후 계획

### Posts 구독 백엔드 구현
1. **백엔드 메시지 핸들러 추가**
   - `subscribePosts`, `unsubscribePosts` 핸들러
   - `batchSubscribePosts`, `batchUnsubscribePosts` 핸들러

2. **이벤트 브로드캐스팅**
   - 신규 포스트 생성 시 실시간 알림
   - 포스트 수정/삭제 시 실시간 업데이트

3. **프론트엔드 통합**
   - 자동 포스트 구독 기능
   - 실시간 피드 업데이트 로직

### 추가 기능
- **선택적 구독**: 특정 포스트 타입만 구독 (체크인/체크아웃)
- **사용자별 필터링**: 특정 사용자의 이벤트만 구독
- **우선순위 구독**: 중요도에 따른 구독 우선순위 설정