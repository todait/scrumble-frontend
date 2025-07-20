# Notification API 명세서

## 개요

Notification API는 스페이스 내에서 알림 관리를 위한 RESTful API입니다. 알림 읽음 처리, 일괄 읽음 처리, 알림 조회 등의 기능을 제공합니다.

## 인증

모든 Notification API는 Bearer 토큰 인증이 필요합니다.

```
Authorization: Bearer {access_token}
```

## 기본 URL

```
{API_BASE_URL}/api/v1/spaces/{spaceSlug}/notifications
```

---

## API 엔드포인트

### 1. 알림 일괄 읽음 처리 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/notifications/bulk-read`

**설명**: 여러 개의 알림을 한 번에 읽음 처리합니다. 최대 100개까지 지원합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**요청 본문**:

```json
{
  "notification_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**요청 본문 검증**:

- `notification_ids`: 필수, 최소 1개, 최대 100개의 UUID 배열

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Notifications marked as read successfully",
  "processed_ids": ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
  "skipped_ids": ["550e8400-e29b-41d4-a716-446655440003"],
  "processed_count": 2,
  "total_requested": 3
}
```

**응답 필드 설명**:

- `message`: 작업 결과 메시지
- `processed_ids`: 성공적으로 읽음 처리된 알림 ID 목록
- `skipped_ids`: 건너뛴 알림 ID 목록 (이미 읽음, 존재하지 않음, 권한 없음 등)
- `processed_count`: 실제 처리된 알림 개수
- `total_requested`: 요청된 전체 알림 개수

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 (빈 배열, 잘못된 UUID 형식, 100개 초과)
- `401 Unauthorized`: 인증 실패
- `500 Internal Server Error`: 서버 오류

---

### 2. 모든 알림 읽음 처리 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/notifications/mark-all-read`

**설명**: 현재 스페이스 멤버십의 모든 읽지 않은 알림을 읽음 처리합니다. 단일 트랜잭션으로 효율적으로 처리됩니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**요청 본문**: 없음

**응답**:

- `200 OK`: 성공

```json
{
  "message": "All notifications marked as read successfully",
  "processed_count": 47
}
```

**응답 필드 설명**:

- `message`: 작업 결과 메시지
- `processed_count`: 읽음 처리된 알림 개수

**에러 응답**:

- `401 Unauthorized`: 인증 실패
- `500 Internal Server Error`: 서버 오류

---

### 3. 알림 목록 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}/notifications/{memberId}`

**설명**: 특정 스페이스 멤버의 알림을 조회합니다. 페이지네이션, 카테고리 필터, 타입 필터, 읽음 상태 필터를 지원합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `memberId` (string, required): 멤버 ID (UUID)

**쿼리 파라미터**:

- `cursor` (string, optional): 페이지네이션 커서 (base64 인코딩)
- `limit` (int, optional): 조회할 알림 개수 (기본값: 20, 최대: 100)
- `categories` (string, optional): 카테고리 필터 (쉼표로 구분: feed,activity,notice)
- `types` (string, optional): 타입 필터 (쉼표로 구분: comment,emoji_reaction 등)
- `is_read` (string, optional): 읽음 상태 필터 (true/false)

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `200 OK`: 성공

```json
{
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "category": "feed",
      "type": "comment",
      "title": "새로운 댓글",
      "content": "홍길동님이 게시물에 댓글을 남겼습니다: '좋은 글이네요!'",
      "is_read": false,
      "read_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "payload": {
        "comment_id": "123",
        "post_id": "456"
      },
      "related_user": {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "name": "홍길동",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "related_post": {
        "id": "456",
        "type": "checkin"
      },
      "deep_link": "/spaces/my-team/posts/456"
    }
  ],
  "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSJ9",
  "has_more": true,
  "total": 1
}
```

**응답 필드 설명**:

- `notifications`: 알림 목록
  - `id`: 알림 ID
  - `category`: 알림 카테고리 (feed, activity, notice)
  - `type`: 알림 타입 (comment, emoji_reaction 등)
  - `title`: 알림 제목
  - `content`: 알림 내용
  - `is_read`: 읽음 여부
  - `read_at`: 읽은 시간 (읽지 않은 경우 null)
  - `created_at`: 생성 시간
  - `payload`: 추가 데이터 (타입별로 다름)
  - `related_user`: 관련 사용자 정보
  - `related_post`: 관련 게시물 정보
  - `deep_link`: 알림 클릭 시 이동할 경로
- `next_cursor`: 다음 페이지를 위한 커서 (base64 인코딩)
- `has_more`: 추가 데이터 존재 여부
- `total`: 현재 페이지의 알림 개수

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 파라미터
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 다른 사용자의 알림 접근 시도
- `404 Not Found`: 스페이스 멤버를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 4. 읽지 않은 알림 개수 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}/notifications/{memberId}/unreadCount`

**설명**: 특정 스페이스 멤버의 읽지 않은 알림 개수를 카테고리별로 조회합니다. 사용자는 자신의 알림 개수만 조회할 수 있습니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `memberId` (string, required): 멤버 ID (UUID)

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `200 OK`: 성공

```json
{
  "total_unread_count": 15,
  "categories": {
    "feed": 5,
    "activity": 8,
    "notice": 2
  }
}
```

**응답 필드 설명**:

- `total_unread_count`: 전체 읽지 않은 알림 개수
- `categories`: 카테고리별 읽지 않은 알림 개수
  - `feed`: 피드 관련 알림 (체크인/체크아웃 포스트)
  - `activity`: 활동 관련 알림 (댓글/반응/멘션)
  - `notice`: 공지사항 알림 (공지/역할변경/멤버변경)

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 파라미터 (잘못된 UUID 형식)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 다른 사용자의 알림 개수 접근 시도
- `404 Not Found`: 스페이스 멤버를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 데이터 모델

### NotificationDTO (조회 시 반환)

```typescript
interface NotificationDTO {
  id: string; // UUID
  category: string; // "feed" | "activity" | "notice"
  type: string; // "comment" | "emoji_reaction" | ...
  title: string;
  content: string;
  is_read: boolean;
  read_at?: string; // ISO 8601 형식 (UTC)
  created_at: string; // ISO 8601 형식 (UTC)
  payload?: Record<string, any>;
  related_user?: {
    id: string;
    name: string;
    avatar_url: string;
  };
  related_post?: {
    id: string;
    type: string;
  };
  deep_link: string;
}
```

### BulkMarkAsReadRequest (일괄 읽음 요청)

```typescript
interface BulkMarkAsReadRequest {
  notification_ids: string[]; // UUID 배열 (최소 1개, 최대 100개)
}
```

### BulkMarkAsReadResponse (일괄 읽음 응답)

```typescript
interface BulkMarkAsReadResponse {
  message: string;
  processed_ids: string[]; // 성공적으로 처리된 ID들
  skipped_ids: string[]; // 건너뛴 ID들
  processed_count: number; // 처리된 개수
  total_requested: number; // 요청된 전체 개수
}
```

### MarkAllAsReadResponse (전체 읽음 응답)

```typescript
interface MarkAllAsReadResponse {
  message: string;
  processed_count: number; // 처리된 알림 개수
}
```

### GetNotificationsResponse (알림 목록 응답)

```typescript
interface GetNotificationsResponse {
  notifications: NotificationDTO[];
  next_cursor?: string; // base64 인코딩된 커서
  has_more: boolean;
  total: number;
}
```

### GetUnreadCountResponse (읽지 않은 알림 개수 응답)

```typescript
interface GetUnreadCountResponse {
  total_unread_count: number;
  categories: UnreadCountByCategory;
}

interface UnreadCountByCategory {
  feed: number; // 피드 관련 알림 (체크인/체크아웃 포스트)
  activity: number; // 활동 관련 알림 (댓글/반응/멘션)
  notice: number; // 공지사항 알림 (공지/역할변경/멤버변경)
}
```

---

## 비즈니스 규칙

### 1. 권한

- 사용자는 자신의 알림만 조회하고 읽음 처리할 수 있음
- 다른 사용자의 알림에는 접근 불가

### 2. 일괄 처리

- 일괄 읽음 처리는 최대 100개까지 지원
- 이미 읽은 알림, 존재하지 않는 알림, 권한이 없는 알림은 skipped_ids에 포함
- 일괄 처리는 트랜잭션으로 원자적 처리

### 3. 페이지네이션

- 커서 기반 페이지네이션 사용
- 커서는 base64로 인코딩된 JSON (createdAt, id 포함)
- 기본 limit은 20, 최대 100

### 4. 필터링

- 카테고리 필터: feed (피드 관련), activity (활동 관련), notice (공지사항)
- 타입 필터: comment, emoji_reaction 등 세부 알림 타입
- 읽음 상태 필터: true (읽음), false (읽지 않음), 미지정 (전체)

### 5. 알림 카테고리 및 타입

**카테고리별 타입**:

- `feed`: 피드 관련 알림

  - `check_in_post`: 체크인 포스트 알림
  - `check_out_post`: 체크아웃 포스트 알림

- `activity`: 활동 관련 알림

  - `comment`: 댓글 알림
  - `emoji_reaction`: 이모지 반응 알림
  - `mention`: 멘션 알림

- `notice`: 공지사항 알림
  - `space_notice`: 스페이스 공지
  - `role_update`: 역할 변경 알림
  - `space_info_update`: 스페이스 정보 업데이트
  - `member_join_leave`: 멤버 가입/탈퇴 알림

---

## 에러 코드

| 코드               | 설명                         |
| ------------------ | ---------------------------- |
| `VALIDATION_ERROR` | 입력 데이터 유효성 검사 실패 |
| `NOT_FOUND`        | 리소스를 찾을 수 없음        |
| `UNAUTHORIZED`     | 인증되지 않은 요청           |
| `FORBIDDEN`        | 권한이 없는 리소스 접근      |
| `INVALID_CURSOR`   | 잘못된 페이지네이션 커서     |
| `INVALID_UUID`     | 잘못된 UUID 형식             |
| `LIMIT_EXCEEDED`   | 요청 제한 초과 (100개 초과)  |

---

## 예제 시나리오

### 시나리오 1: 알림 목록 조회 및 읽음 처리

```bash
# 1. 읽지 않은 피드 알림 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000?categories=feed&is_read=false&limit=10
Headers:
  Authorization: Bearer {token}

# 2. 특정 알림들을 읽음 처리
POST /api/v1/spaces/my-team/notifications/bulk-read
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

{
  "notification_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

### 시나리오 2: 페이지네이션을 이용한 알림 조회

```bash
# 1. 첫 페이지 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000?limit=20
Headers:
  Authorization: Bearer {token}

# 응답에서 next_cursor 획득
# "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSJ9"

# 2. 다음 페이지 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000?cursor=eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSJ9&limit=20
Headers:
  Authorization: Bearer {token}
```

### 시나리오 3: 모든 알림 읽음 처리

```bash
# 현재 스페이스의 모든 읽지 않은 알림을 한 번에 읽음 처리
POST /api/v1/spaces/my-team/notifications/mark-all-read
Headers:
  Authorization: Bearer {token}

# 응답
{
  "message": "All notifications marked as read successfully",
  "processed_count": 23
}
```

### 시나리오 4: 필터를 조합한 알림 조회

```bash
# 댓글과 이모지 반응 알림 중 읽지 않은 것만 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000?types=comment,emoji_reaction&is_read=false&limit=30
Headers:
  Authorization: Bearer {token}

# 활동 카테고리의 모든 알림 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000?categories=activity
Headers:
  Authorization: Bearer {token}
```

### 시나리오 5: 읽지 않은 알림 개수 조회

```bash
# 카테고리별 읽지 않은 알림 개수 조회
GET /api/v1/spaces/my-team/notifications/123e4567-e89b-12d3-a456-426614174000/unreadCount
Headers:
  Authorization: Bearer {token}

# 응답
{
  "total_unread_count": 15,
  "categories": {
    "feed": 5,
    "activity": 8,
    "notice": 2
  }
}
```

**활용 예시**:

- 알림 아이콘에 총 개수 표시: `total_unread_count` 사용
- 카테고리별 탭에 개수 표시: `categories` 각 값 사용
- 우선순위 높은 카테고리 식별: `notice` > `activity` > `feed` 순으로 처리

---

## FAQ

### Q1: 커서는 얼마나 오래 유효한가요?

**A**: 커서는 데이터가 변경되어도 유효합니다. 다만, 매우 오래된 커서를 사용하면 건너뛴 데이터가 많아질 수 있습니다.

### Q2: 일괄 읽음 처리에서 일부만 성공하면 어떻게 되나요?

**A**: 성공한 항목은 processed_ids에, 실패한 항목은 skipped_ids에 포함됩니다. 부분 성공이 가능합니다.

### Q3: 알림을 다시 읽지 않음 상태로 변경할 수 있나요?

**A**: 현재는 읽음 처리만 가능하며, 읽지 않음 상태로 되돌리는 기능은 제공하지 않습니다.

### Q4: 삭제된 알림은 어떻게 처리되나요?

**A**: 삭제된 알림은 조회 결과에서 제외되며, 일괄 읽음 처리 시 skipped_ids에 포함됩니다.

### Q5: 실시간 알림은 어떻게 받나요?

**A**: WebSocket을 통해 실시간 알림을 수신할 수 있습니다. 자세한 내용은 WebSocket API 문서를 참조하세요.

### Q6: 읽지 않은 알림 개수는 실시간으로 업데이트되나요?

**A**: 읽지 않은 알림 개수는 API 호출 시점의 정확한 개수를 반환합니다. 실시간 업데이트가 필요한 경우 WebSocket 이벤트와 함께 주기적으로 API를 호출하세요.

### Q7: 카테고리별 개수가 0인 경우에도 응답에 포함되나요?

**A**: 네, 모든 카테고리는 개수가 0이어도 응답에 포함됩니다. 이를 통해 클라이언트에서 일관된 데이터 구조를 유지할 수 있습니다.

### Q8: 다른 사용자의 읽지 않은 알림 개수를 조회할 수 있나요?

**A**: 아니요, 보안상의 이유로 사용자는 자신의 알림 개수만 조회할 수 있습니다. 다른 사용자의 개수에 접근하면 403 Forbidden 오류가 발생합니다.

---

## 변경 이력

### v1.1.0 (2025-07-20)

- 📊 **[NEW]** 읽지 않은 알림 개수 조회 API (카테고리별 세분화)
  - 전체 개수와 카테고리별 개수를 한 번에 제공
  - feed, activity, notice 카테고리별 분석 지원
  - 클라이언트 UI에서 카테고리별 배지 표시 가능

### v1.0.0 (2025-01-16)

- 🎯 알림 일괄 읽음 처리 API
- ✅ 모든 알림 읽음 처리 API
- 📋 알림 목록 조회 API (페이지네이션, 필터링 지원)
- 🔍 커서 기반 페이지네이션
- 🏷️ 카테고리 및 타입 필터링
