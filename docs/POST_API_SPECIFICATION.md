# Post API 명세서

## 개요

Post API는 스페이스 내에서 체크인/체크아웃 포스트 관리를 위한 RESTful API입니다. CQRS 패턴을 적용하여 읽기 전용 쿼리 서비스와 명령 서비스가 분리되어 있으며, 타임존 지원, 페이지네이션, 댓글, 리액션, Todo 개수 조회 등을 지원합니다.

## 인증

모든 Post API는 Bearer 토큰 인증이 필요합니다.

```
Authorization: Bearer {access_token}
```

## 타임존 지원

모든 Post API는 사용자의 타임존을 고려한 날짜 처리를 지원합니다.

**타임존 헤더** (선택사항):

```
X-Timezone: Asia/Seoul
```

**지원하는 타임존 형식**: IANA 타임존 데이터베이스 형식 (예: `Asia/Seoul`, `America/New_York`, `UTC`)
**기본값**: `UTC`

**동작 방식**:

- **생성/수정**: 사용자 타임존의 날짜를 서버 내부적으로 UTC 기준으로 변환하여 저장
- **조회**: 사용자 타임존 기준으로 변환된 날짜/시간 반환

## 기본 URL

```
# 스페이스별 포스트 관리
{API_BASE_URL}/api/v1/spaces/{spaceSlug}/posts

# 전체 포스트 조회
{API_BASE_URL}/api/v1/posts
```

---

## API 엔드포인트

### 1. 체크인 포스트 생성 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/posts/checkin`

**설명**: 새로운 체크인 포스트를 생성합니다. 컨디션 점수와 메시지를 포함할 수 있습니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "condition_score": 8,
  "condition_text": "오늘은 컨디션이 좋습니다!",
  "posted_date": "2024-01-15T09:00:00Z",
  "images": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "url": "https://example.com/image1.jpg",
      "key": "images/123.jpg",
      "size": 102400,
      "width": 800,
      "height": 600,
      "format": "jpg",
      "name": "morning_view.jpg"
    }
  ]
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "post_type": "checkin",
  "condition_score": 8,
  "condition_text": "오늘은 컨디션이 좋습니다!",
  "posted_at": "2024-01-15T09:00:00Z",
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-01-15T09:00:00Z"
}
```

---

### 2. 체크아웃 포스트 생성 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/posts/checkout`

**설명**: 새로운 체크아웃 포스트를 생성합니다. 하루를 마무리하는 회고 메시지를 포함할 수 있습니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "reflection_text": "오늘 계획한 작업을 모두 완료했습니다. 내일은 새로운 기능 개발을 시작할 예정입니다.",
  "posted_date": "2024-01-15T18:00:00Z",
  "images": []
}
```

---

### 3. 포스트 목록 조회 (GET)

**엔드포인트**: `GET /api/v1/posts`

**설명**: 포스트 목록을 페이지네이션과 필터링을 통해 조회합니다. 각 포스트에는 해당 사용자와 날짜의 Todo 개수가 포함됩니다.

**쿼리 파라미터**:

- `spaceId` (string, required): 스페이스 ID
- `date` (string, optional): 날짜 필터 (YYYY-MM-DD 형식)
- `type` (string, optional): 포스트 타입 필터 (checkin,checkout)
- `cursor` (string, optional): 페이지네이션 커서
- `limit` (integer, optional): 페이지 크기 (기본값: 20, 최대: 100)

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "posts": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "post_type": "checkin",
      "posted_at": "2024-01-15T09:00:00Z",
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-15T09:00:00Z",
      "user_id": "456e7890-e89b-12d3-a456-426614174001",
      "space_slug": "my-team-space",
      "author": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "email": "user@example.com",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "condition_score": 8,
      "condition_text": "오늘은 컨디션이 좋습니다!",
      "comment_info": {
        "avatar_urls": ["https://example.com/avatar1.jpg", "https://example.com/avatar2.jpg"],
        "count": 5,
        "last_comment_at": "2024-01-15T10:30:00Z"
      },
      "images": [],
      "reactions": [
        {
          "user_id": "789e0123-e89b-12d3-a456-426614174002",
          "emoji": "❤️",
          "created_at": "2024-01-15T09:30:00Z",
          "author": {
            "id": "789e0123-e89b-12d3-a456-426614174002",
            "email": "colleague@example.com",
            "name": "Jane Smith",
            "avatar_url": "https://example.com/avatar2.jpg"
          }
        }
      ],
      "todo_count": 5
    }
  ],
  "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0xNVQwOTowMDowMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9",
  "has_more": true
}
```

**특징**:

- `todo_count`: 해당 포스트의 사용자가 같은 날짜에 가진 Todo 항목의 개수
- 커서 기반 페이지네이션으로 대용량 데이터 효율적 처리
- 작성자 정보, 댓글 요약, 리액션 정보 포함

---

### 4. 포스트 상세 조회 (댓글 포함) (GET)

**엔드포인트**: `GET /api/v1/posts/{postId}/comments`

**설명**: 특정 포스트의 상세 정보를 모든 댓글과 함께 조회합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "post_type": "checkin",
  "posted_at": "2024-01-15T09:00:00Z",
  "author": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "condition_score": 8,
  "condition_text": "오늘은 컨디션이 좋습니다!",
  "comments": [
    {
      "id": "234e5678-e89b-12d3-a456-426614174001",
      "content": "화이팅하세요!",
      "created_at": "2024-01-15T09:15:00Z",
      "updated_at": "2024-01-15T09:15:00Z",
      "user_id": "789e0123-e89b-12d3-a456-426614174002",
      "post_id": "123e4567-e89b-12d3-a456-426614174000",
      "author": {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "email": "colleague@example.com",
        "name": "Jane Smith",
        "avatar_url": "https://example.com/avatar2.jpg"
      },
      "images": [],
      "reactions": []
    }
  ],
  "images": [],
  "reactions": []
}
```

---

### 5. 체크인 존재 여부 확인 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}/posts/checkin/exists`

**설명**: 특정 날짜에 사용자의 체크인 포스트가 존재하는지 확인합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**쿼리 파라미터**:

- `date` (string, required): 확인할 날짜 (YYYY-MM-DD 형식)

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "exists": true,
  "post_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### 6. 피드 요약 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}/posts/summary`

**설명**: 특정 날짜의 스페이스 전체 활동 요약을 조회합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**쿼리 파라미터**:

- `date` (string, required): 요약할 날짜 (YYYY-MM-DD 형식)

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "date": "2024-01-15",
  "space_slug": "my-team-space",
  "check_in_count": 8,
  "check_out_count": 6,
  "total_workday_member_count": 10,
  "average_condition_score": 7.5
}
```

---

### 7. 체크인 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/spaces/{spaceSlug}/posts/checkin/{postId}`

**설명**: 기존 체크인 포스트를 수정합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**요청 본문**:

```json
{
  "condition_score": 9,
  "condition_text": "컨디션이 더 좋아졌습니다!",
  "images": []
}
```

---

### 8. 체크아웃 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/spaces/{spaceSlug}/posts/checkout/{postId}`

**설명**: 기존 체크아웃 포스트를 수정합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존

**요청 본문**:

```json
{
  "reflection_text": "오늘 하루를 되돌아보니 많은 것을 배웠습니다.",
  "images": []
}
```

---

### 9. 체크인 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/spaces/{spaceSlug}/posts/checkin/{postId}`

**설명**: 체크인 포스트를 삭제합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `204 No Content`: 성공적으로 삭제됨

---

### 10. 체크아웃 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/spaces/{spaceSlug}/posts/checkout/{postId}`

**설명**: 체크아웃 포스트를 삭제합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자
- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `204 No Content`: 성공적으로 삭제됨

---

## 에러 응답

모든 API는 다음과 같은 표준 에러 응답을 반환합니다:

**400 Bad Request**:

```json
{
  "error": "Invalid request body",
  "details": "condition_score must be between 1 and 10"
}
```

**401 Unauthorized**:

```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}
```

**404 Not Found**:

```json
{
  "error": "Not found",
  "details": "Post not found"
}
```

**500 Internal Server Error**:

```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

---

## 사용 예시

### 시나리오 1: 아침 체크인 생성

```bash
curl -X POST "${API_BASE_URL}/api/v1/spaces/my-team-space/posts/checkin" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Asia/Seoul" \
  -d '{
    "condition_score": 8,
    "condition_text": "오늘은 컨디션이 좋습니다! 프로젝트 마무리 작업 진행 예정입니다.",
    "posted_date": "2024-01-15T09:00:00+09:00"
  }'
```

### 시나리오 2: 오늘의 포스트 목록 조회 (Todo 개수 포함)

```bash
curl -X GET "${API_BASE_URL}/api/v1/posts?spaceId=789e0123-e89b-12d3-a456-426614174002&date=2024-01-15&limit=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "X-Timezone: Asia/Seoul"
```

응답에는 각 포스트마다 `todo_count` 필드가 포함되어, 해당 사용자가 같은 날짜에 가진 Todo 항목 개수를 확인할 수 있습니다.

### 시나리오 3: 저녁 체크아웃 생성

```bash
curl -X POST "${API_BASE_URL}/api/v1/spaces/my-team-space/posts/checkout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Asia/Seoul" \
  -d '{
    "reflection_text": "오늘 계획했던 작업을 모두 완료했습니다. 팀원들과의 협업도 원활했고, 새로운 기능 구현도 성공적으로 마쳤습니다.",
    "posted_date": "2024-01-15T18:30:00+09:00"
  }'
```

### 시나리오 4: 피드 요약 조회

```bash
curl -X GET "${API_BASE_URL}/api/v1/spaces/my-team-space/posts/summary?date=2024-01-15" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "X-Timezone: Asia/Seoul"
```

---

## 주요 특징

1. **CQRS 패턴**: 읽기와 쓰기 작업이 분리되어 있어 성능 최적화가 가능합니다.
2. **타임존 지원**: 모든 날짜/시간 데이터는 사용자의 타임존을 고려하여 처리됩니다.
3. **계층적 데이터**: 포스트에는 댓글과 리액션이 계층적으로 포함될 수 있습니다.
4. **Todo 연동**: 각 포스트는 같은 날짜의 Todo 개수를 표시하여 업무 진행 상황을 한눈에 파악할 수 있습니다.
5. **미디어 지원**: 이미지 등의 미디어 파일을 포스트에 첨부할 수 있습니다.
6. **실시간성**: WebSocket을 통한 실시간 업데이트를 지원합니다 (별도 문서 참조).

---

## 버전 히스토리

### v1.0.0 (2024-01-15)

- 초기 릴리즈
- 체크인/체크아웃 CRUD 기능
- 댓글 및 리액션 기능
- 타임존 지원

### v1.1.0 (2024-01-20)

- Todo 개수 조회 기능 추가
- 피드 요약 API 추가
- 성능 최적화 (병렬 쿼리 처리)
