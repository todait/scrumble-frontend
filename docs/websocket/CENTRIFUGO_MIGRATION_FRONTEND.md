# Centrifugo WebSocket 마이그레이션 가이드 (Frontend)

## 개요

Scrumble 프론트엔드의 WebSocket 인프라를 기존 자체 구현에서 Centrifugo로 마이그레이션했습니다.

## 주요 변경사항

### 1. 새로운 파일 추가

- **`src/shared/services/centrifugo.service.ts`**: Centrifugo WebSocket 서비스
- **`src/shared/hooks/useCentrifugo.ts`**: Centrifugo React 훅

### 2. 수정된 파일

#### 타입 정의
- **`src/shared/types/user.ts`**: 
  - `UserWithCentrifugoToken` 인터페이스 추가
  
- **`src/shared/types/auth.ts`**: 
  - `LoginResponse`와 `AuthState`에 centrifugo_token 포함

- **`src/shared/types/api.ts`**:
  - `GetUserWithLatestSpaceApiResponse`에 centrifugo_token 필드 추가

#### API 및 서비스
- **`src/shared/lib/api/auth.ts`**:
  - `getCurrentUserWithLatestSpace()`가 centrifugo_token 반환

- **`src/shared/hooks/useWebSocket.ts`**:
  - Centrifugo 훅을 사용하도록 래핑

- **`src/shared/utils/subscriptionManager.ts`**:
  - websocketService → centrifugoService로 변경

#### 환경 변수
- **`.env`** 및 **`.env.local`**:
  - `NEXT_PUBLIC_CENTRIFUGO_URL=ws://localhost:8000/connection/websocket` 추가

### 3. 아키텍처 변경사항

#### 기존 아키텍처
```
WebSocket Service → 직접 WebSocket 연결 → 백엔드 WebSocket 핸들러
```

#### 새로운 아키텍처
```
Centrifugo Service → Centrifuge SDK → Centrifugo Server → 백엔드 HTTP API
```

### 4. 주요 기능

#### 연결 관리
```typescript
// 사용자 로그인 시 자동으로 Centrifugo 토큰 포함
const { user } = useAuth(); // user.centrifugoToken 포함

// useWebSocket 훅은 내부적으로 Centrifugo 사용
const ws = useWebSocket({ 
  spaceSlug: 'team-a',
  autoConnect: true 
});
```

#### 채널 구독
```typescript
// 댓글 구독
ws.subscribeToComments(postId);
ws.batchSubscribeToComments([postId1, postId2]);

// 리액션 구독  
ws.subscribeToReactions(postId);
ws.batchSubscribeToReactions([postId1, postId2]);

// 스페이스 구독
ws.subscribeToPosts(spaceSlug);
```

#### 이벤트 핸들링
```typescript
// 타입 안전한 이벤트 리스너
ws.addEventListener('comment.created', (message) => {
  console.log('New comment:', message.data);
});

ws.addEventListener('reaction.added', (message) => {
  console.log('New reaction:', message.data);
});
```

### 5. 하위 호환성

기존 `useWebSocket` 훅의 인터페이스를 유지하여 하위 호환성 보장:
- 기존 컴포넌트 수정 불필요
- 동일한 API로 Centrifugo 기능 사용

### 6. 디버깅

개발 환경에서 사용 가능한 디버깅 도구:

```javascript
// 브라우저 콘솔에서
debugCentrifugo(); // Centrifugo 상태 정보 출력
centrifugoService.debugInfo(); // 상세 디버그 정보
```

### 7. 성능 개선사항

- **자동 재연결**: Centrifugo가 자동으로 재연결 처리
- **배치 구독**: 여러 채널을 한 번에 구독 가능
- **메시지 히스토리**: 채널별 최근 메시지 자동 보관
- **Presence**: 채널별 접속자 정보 제공

### 8. 마이그레이션 체크리스트

- [x] Centrifuge JavaScript SDK 설치
- [x] Centrifugo 서비스 구현
- [x] React 훅 구현
- [x] 타입 정의 업데이트
- [x] API 응답 처리 업데이트
- [x] 환경 변수 설정
- [x] 기존 WebSocket 훅 래핑
- [x] subscriptionManager 업데이트

### 9. 주의사항

1. **토큰 관리**: Centrifugo 토큰은 백엔드에서 제공되며, 24시간 유효
2. **채널 네이밍**: 백엔드와 동일한 채널 네이밍 규칙 사용
   - 스페이스: `space:{spaceSlug}`
   - 포스트: `space:{spaceSlug}:post:{postId}`
   - 리액션: `space:{spaceSlug}:post:{postId}:reactions`
3. **에러 처리**: Centrifugo는 자동 재연결을 시도하므로 일시적 연결 끊김은 자동 복구

### 10. 테스트 방법

1. 백엔드와 Centrifugo 서버가 실행 중인지 확인
2. 프론트엔드 개발 서버 시작: `npm run dev`
3. 로그인 후 피드 페이지 접속
4. 브라우저 개발자 도구에서 WebSocket 연결 확인
5. 댓글/리액션 추가 시 실시간 업데이트 확인

## 향후 계획

- [ ] 개인 알림 채널 구현
- [ ] 타이핑 인디케이터 구현
- [ ] 온라인 상태 표시 구현
- [ ] 메시지 읽음 확인 기능