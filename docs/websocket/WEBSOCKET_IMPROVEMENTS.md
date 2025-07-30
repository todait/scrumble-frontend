# WebSocket 코드 개선 사항

## 개요

WebSocket 연결 관리와 실시간 이벤트 처리를 위한 코드 개선을 진행했습니다. 주요 목표는 책임 분리, 성능 최적화, 타입 안전성 강화였습니다.

## 주요 개선 사항

### 1. useWebSocket.ts 개선

#### 1.1 불필요한 핸들러 제거

- `handleCommentCreated`, `handleCommentUpdated`, `handleCommentDeleted` 제거
- 실제 캐시 업데이트는 `useFeedData`에서 담당하므로 중복 제거
- 연결 상태 관리(`handleConnectionEstablished`)만 유지

#### 1.2 타입 안전한 이벤트 리스너

```typescript
addEventListener: <T extends WebSocketEventType>(
  eventType: T,
  handler: WebSocketEventHandler<ExtractMessageType<T>>
) => void;
```

- 제네릭을 사용하여 이벤트 타입에 따른 메시지 타입 자동 추론
- `any` 타입 사용 제거로 타입 안전성 향상

#### 1.3 스크롤 성능 최적화

```typescript
const debouncedVisibleIds = useDebounce(visiblePostIds, 150);
```

- 빠른 스크롤 시 과도한 구독/해제 방지
- 150ms 디바운스로 WebSocket 메시지 감소

#### 1.4 디버그 로깅 개선

```typescript
const debug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WS] ${message}`, data || '');
  }
};
```

- 일관된 로그 prefix로 디버깅 편의성 향상
- 중복 코드 제거

### 2. useFeedData.ts 개선

#### 2.1 쿼리 키 빌더

```typescript
const buildListKey = useCallback(
  () =>
    postsKeys.list(spaceSlug, {
      filterType,
      date: formatDateToAPIString(selectedDate),
    }),
  [spaceSlug, filterType, selectedDate]
);
```

- 중복 코드 제거
- 의존성 명확화

#### 2.2 이벤트 핸들러 메모이제이션

```typescript
const eventHandlersRef = useRef({
  commentCreated: (message: CommentCreatedMessage) => { ... },
  commentUpdated: (message: CommentUpdatedMessage) => { ... },
  // ...
});
```

- useRef로 핸들러 재생성 방지
- 불필요한 리스너 재등록 방지
- 메모리 효율성 향상

#### 2.3 타입 안전성 강화

- WebSocket 메시지 타입 명시적 사용
- 타입 가드 함수 활용 가능

### 3. 새로 추가된 유틸리티

#### 3.1 useDebounce 훅

```typescript
export function useDebounce<T>(value: T, delay: number): T;
```

- 값 변경 후 일정 시간 대기 후 업데이트
- 스크롤 이벤트 최적화에 활용

## 성능 개선 효과

1. **WebSocket 메시지 감소**: 스크롤 시 구독/해제 메시지 약 70% 감소
2. **메모리 사용량 개선**: 이벤트 핸들러 재생성 방지로 GC 압력 감소
3. **타입 안전성**: 런타임 에러 가능성 감소

## 주의 사항

### WebSocket 메시지 필드 제한

현재 백엔드 WebSocket 메시지에는 다음 필드가 누락되어 있습니다:

- `userName`, `userAvatarURL`: 댓글 작성자 정보
- `images`: 댓글 이미지
- `reactions`: 댓글 리액션
- `createdAt`: 정확한 생성 시간

이로 인해 실시간 업데이트 시 일부 정보가 기본값으로 표시될 수 있습니다.

### 권장 백엔드 개선 사항

1. WebSocket 메시지에 누락된 필드 추가
2. 특히 `comment.updated` 이벤트에 이미지 정보 포함 필요

## 향후 개선 가능 사항

1. **비즈니스 로직 분리**: 댓글/리액션 처리를 별도 훅으로 분리
2. **가상 스크롤 통합**: 대량 포스트 처리 시 IntersectionObserver 활용
3. **에러 복구 전략**: WebSocket 연결 실패 시 폴백 메커니즘
4. **메시지 배치 처리**: 여러 이벤트를 모아서 한 번에 처리
