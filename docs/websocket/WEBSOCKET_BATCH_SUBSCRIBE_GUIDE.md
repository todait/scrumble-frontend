# WebSocket Batch Subscribe 핸들러 구현 가이드

## 개요

현재 실시간 댓글 시스템에서 성능 최적화를 위해 `batchSubscribe` 핸들러가 필요합니다. 
프론트엔드에서는 여러 포스트의 댓글을 한 번에 구독하는 기능을 지원하지만, 백엔드에서 `batchSubscribe` 메시지 타입을 처리하지 않아 개별 구독(`subscribe`)을 사용하는 임시 해결책을 적용한 상태입니다.

## 현재 상황

### 프론트엔드 구현 상태
- ✅ `batchSubscribe`, `batchUnsubscribe` 메시지 타입 정의 완료
- ✅ WebSocket 서비스에서 배치 구독 로직 구현 완료
- ✅ 개별 구독으로 임시 대응 중 (`useWebSocket.ts:171-175`)

### 백엔드 구현 필요 사항
- ❌ `batchSubscribe` 메시지 타입 핸들러 미구현
- ❌ `batchUnsubscribe` 메시지 타입 핸들러 미구현

## 메시지 스펙

### 1. 배치 구독 요청 (Client → Server)

```typescript
interface BatchSubscribeMessage {
  type: 'batchSubscribe';
  spaceSlug: string;
  postIds: string[];
}
```

**예시:**
```json
{
  "type": "batchSubscribe",
  "spaceSlug": "testspace123",
  "postIds": ["post1", "post2", "post3"]
}
```

### 2. 배치 구독 해제 요청 (Client → Server)

```typescript
interface BatchUnsubscribeMessage {
  type: 'batchUnsubscribe';
  spaceSlug: string;
  postIds: string[];
}
```

**예시:**
```json
{
  "type": "batchUnsubscribe",
  "spaceSlug": "testspace123",
  "postIds": ["post1", "post2"]
}
```

### 3. 구독 응답 (Server → Client) - 선택사항

```typescript
interface SubscriptionResponseMessage {
  type: 'subscription.response';
  spaceSlug: string;
  postId: string;
  success: boolean;
  message?: string;
  timestamp: string;
}
```

## 백엔드 구현 가이드

### 1. 메시지 핸들러 추가

현재 개별 `subscribe`/`unsubscribe` 핸들러와 유사하게 배치 처리 핸들러를 추가해야 합니다.

#### Go 구조체 정의 (예시)
```go
type BatchSubscribeMessage struct {
    Type      string   `json:"type"`
    SpaceSlug string   `json:"spaceSlug"`
    PostIds   []string `json:"postIds"`
}

type BatchUnsubscribeMessage struct {
    Type      string   `json:"type"`
    SpaceSlug string   `json:"spaceSlug"`
    PostIds   []string `json:"postIds"`
}
```

#### WebSocket 메시지 라우터에 핸들러 추가
```go
func (h *WebSocketHandler) handleMessage(conn *websocket.Conn, messageType int, data []byte) {
    var baseMsg struct {
        Type string `json:"type"`
    }
    
    if err := json.Unmarshal(data, &baseMsg); err != nil {
        // 에러 처리
        return
    }
    
    switch baseMsg.Type {
    case "subscribe":
        h.handleSubscribe(conn, data)
    case "unsubscribe":
        h.handleUnsubscribe(conn, data)
    case "batchSubscribe":
        h.handleBatchSubscribe(conn, data) // 새로 추가
    case "batchUnsubscribe":
        h.handleBatchUnsubscribe(conn, data) // 새로 추가
    case "ping":
        h.handlePing(conn)
    default:
        // 알 수 없는 메시지 타입
    }
}
```

### 2. 배치 구독 핸들러 구현

```go
func (h *WebSocketHandler) handleBatchSubscribe(conn *websocket.Conn, data []byte) {
    var msg BatchSubscribeMessage
    if err := json.Unmarshal(data, &msg); err != nil {
        h.sendError(conn, "Invalid batchSubscribe message format")
        return
    }
    
    // 권한 검증
    if !h.hasSpaceAccess(conn, msg.SpaceSlug) {
        h.sendError(conn, "Access denied to space")
        return
    }
    
    // 각 포스트에 대해 구독 처리
    for _, postId := range msg.PostIds {
        // 포스트 존재 여부 확인
        if !h.postExists(msg.SpaceSlug, postId) {
            continue // 존재하지 않는 포스트는 스킵
        }
        
        // Redis 채널 구독
        channel := fmt.Sprintf("space:%s:post:%s:comments", msg.SpaceSlug, postId)
        h.subscribeToChannel(conn, channel)
        
        // 연결 상태에 구독 정보 저장
        h.addSubscription(conn, channel, msg.SpaceSlug, postId)
    }
    
    // 선택사항: 구독 성공 응답 전송
    // h.sendSubscriptionResponse(conn, msg.SpaceSlug, "batch", true, "Batch subscription successful")
}
```

### 3. 배치 구독 해제 핸들러 구현

```go
func (h *WebSocketHandler) handleBatchUnsubscribe(conn *websocket.Conn, data []byte) {
    var msg BatchUnsubscribeMessage
    if err := json.Unmarshal(data, &msg); err != nil {
        h.sendError(conn, "Invalid batchUnsubscribe message format")
        return
    }
    
    // 각 포스트에 대해 구독 해제 처리
    for _, postId := range msg.PostIds {
        channel := fmt.Sprintf("space:%s:post:%s:comments", msg.SpaceSlug, postId)
        h.unsubscribeFromChannel(conn, channel)
        
        // 연결 상태에서 구독 정보 제거
        h.removeSubscription(conn, channel)
    }
}
```

### 4. 헬퍼 함수들

```go
// 포스트 존재 여부 확인
func (h *WebSocketHandler) postExists(spaceSlug, postId string) bool {
    // 데이터베이스에서 포스트 존재 여부 확인
    // return h.postRepository.Exists(spaceSlug, postId)
}

// 스페이스 접근 권한 확인
func (h *WebSocketHandler) hasSpaceAccess(conn *websocket.Conn, spaceSlug string) bool {
    // JWT 토큰 검증 및 스페이스 멤버십 확인
    // userID := h.getUserIDFromConnection(conn)
    // return h.spaceService.IsMember(userID, spaceSlug)
}

// Redis 채널 구독
func (h *WebSocketHandler) subscribeToChannel(conn *websocket.Conn, channel string) {
    // Redis pub/sub 구독 로직
    // h.redisPubSub.Subscribe(conn, channel)
}

// 구독 정보 저장
func (h *WebSocketHandler) addSubscription(conn *websocket.Conn, channel, spaceSlug, postId string) {
    // 연결별 구독 정보를 메모리에 저장
    // h.connectionManager.AddSubscription(conn, channel, spaceSlug, postId)
}
```

## 성능 고려사항

### 1. 동시 처리 최적화
- 여러 포스트의 구독을 병렬로 처리
- Redis Pipeline 사용으로 네트워크 호출 최소화

```go
func (h *WebSocketHandler) handleBatchSubscribe(conn *websocket.Conn, data []byte) {
    // ... 메시지 파싱 및 검증
    
    // Redis Pipeline 사용
    pipe := h.redisClient.Pipeline()
    channels := make([]string, 0, len(msg.PostIds))
    
    for _, postId := range msg.PostIds {
        if h.postExists(msg.SpaceSlug, postId) {
            channel := fmt.Sprintf("space:%s:post:%s:comments", msg.SpaceSlug, postId)
            channels = append(channels, channel)
            pipe.Subscribe(ctx, channel)
        }
    }
    
    // 일괄 실행
    _, err := pipe.Exec(ctx)
    if err != nil {
        h.sendError(conn, "Batch subscription failed")
        return
    }
    
    // 구독 정보 저장
    for _, channel := range channels {
        h.addSubscription(conn, channel, msg.SpaceSlug, extractPostId(channel))
    }
}
```

### 2. 에러 처리 및 부분 성공
- 일부 포스트 구독이 실패해도 성공한 구독은 유지
- 실패한 포스트 목록을 응답에 포함

### 3. 리소스 제한
- 한 번에 구독할 수 있는 포스트 수 제한 (예: 100개)
- 사용자별 총 구독 수 제한

```go
const (
    MaxBatchSubscriptionSize = 100
    MaxTotalSubscriptions   = 500
)

func (h *WebSocketHandler) handleBatchSubscribe(conn *websocket.Conn, data []byte) {
    var msg BatchSubscribeMessage
    if err := json.Unmarshal(data, &msg); err != nil {
        h.sendError(conn, "Invalid message format")
        return
    }
    
    // 배치 크기 제한
    if len(msg.PostIds) > MaxBatchSubscriptionSize {
        h.sendError(conn, fmt.Sprintf("Too many posts in batch. Maximum: %d", MaxBatchSubscriptionSize))
        return
    }
    
    // 현재 구독 수 확인
    currentSubscriptions := h.getSubscriptionCount(conn)
    if currentSubscriptions+len(msg.PostIds) > MaxTotalSubscriptions {
        h.sendError(conn, "Subscription limit exceeded")
        return
    }
    
    // ... 구독 처리
}
```

## 테스트 가이드

### 1. 단위 테스트
- 유효한 `batchSubscribe` 메시지 처리 테스트
- 잘못된 메시지 형식 처리 테스트
- 권한 없는 사용자의 구독 시도 테스트
- 존재하지 않는 포스트 구독 시도 테스트

### 2. 통합 테스트
- 여러 클라이언트에서 동시 배치 구독 테스트
- 구독 후 실제 댓글 이벤트 수신 확인
- 배치 구독 해제 후 이벤트 수신 안됨 확인

### 3. 성능 테스트
- 대량 포스트 배치 구독 성능 측정
- 메모리 사용량 모니터링
- Redis 연결 및 메모리 사용량 확인

## 프론트엔드 변경사항

백엔드에서 `batchSubscribe` 핸들러 구현 완료 후, 프론트엔드에서 다음 변경이 필요합니다:

### useWebSocket.ts 수정
```typescript
// 현재 임시 코드 (개별 구독)
newlyVisible.forEach(postId => {
  subscribeToComments(postId);
});

// 변경될 코드 (배치 구독)
if (newlyVisible.length > 0) {
  batchSubscribeToComments(newlyVisible);
}
```

## 마이그레이션 계획

1. **Phase 1**: 백엔드에서 `batchSubscribe`/`batchUnsubscribe` 핸들러 구현
2. **Phase 2**: 백엔드 테스트 및 검증
3. **Phase 3**: 프론트엔드에서 개별 구독 → 배치 구독 전환
4. **Phase 4**: 성능 모니터링 및 최적화

## 추가 개선사항

### 1. 지능형 구독 관리
- 사용자의 스크롤 패턴 학습
- 사전 구독(pre-subscription) 기능

### 2. 구독 상태 동기화
- 페이지 새로고침 시 구독 상태 복원
- 다중 탭 환경에서 구독 상태 공유

### 3. 모니터링 및 알람
- 구독 실패율 모니터링
- 구독 수 임계값 알람
- WebSocket 연결 상태 대시보드

## 문의사항

이 가이드에 대한 질문이나 구현 과정에서 도움이 필요한 경우:
- 프론트엔드 팀: WebSocket 클라이언트 로직 관련
- 백엔드 팀: WebSocket 서버 핸들러 구현 관련
- DevOps 팀: Redis 및 인프라 관련