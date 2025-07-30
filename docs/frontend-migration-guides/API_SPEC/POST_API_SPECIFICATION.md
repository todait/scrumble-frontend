# Post API 명세서

## 개요

Post API는 스페이스 내에서 체크인/체크아웃 포스트 관리를 위한 RESTful API입니다. CQRS 패턴을 적용하여 읽기 전용 쿼리 서비스와 명령 서비스가 분리되어 있으며, 타임존 지원, 페이지네이션, 댓글, 리액션, Todo 개수 조회 등을 지원합니다.

### 인증

Notification API는 SpaceMember 인증을 사용합니다:

### SpaceMember 토큰 (Authorization 헤더)

특정 Space에 대한 권한 확인을 위한 JWT 토큰입니다. Space 로그인 후 발급받은 SpaceMember JWT 토큰을 Authorization 헤더에 포함합니다.

```
Authorization: Bearer {space_member_jwt_token}
```

SpaceMember JWT 토큰에는 다음 정보가 포함되어 있습니다:

- `userID`: 사용자 ID
- `email`: 사용자 이메일
- `spaceSlug`: Space 식별자
- `spaceMemberID`: Space 멤버 ID
- `role`: Space 내 역할

따라서 별도의 space 식별자나 멤버 ID를 전달할 필요가 없습니다.

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
# 포스트 관리 (모든 Post API는 SpaceMember 인증 필요)
{API_BASE_URL}/api/v1/posts

# 댓글 관리 (포스트 하위 경로, SpaceMember 인증 필요)
{API_BASE_URL}/api/v1/posts/{postId}/comments
```

---

## API 엔드포인트

### 1. 체크인 포스트 생성 (POST)

**엔드포인트**: `POST /api/v1/posts/checkin`

**설명**: 새로운 체크인 포스트를 생성합니다. 컨디션 점수와 메시지를 포함할 수 있습니다.

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "condition_score": 8,
  "condition_text": "오늘은 컨디션이 좋습니다!",
  "posted_date": "2024-01-15",
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

**요청 필드 설명**:

- `condition_score` (integer, required): 컨디션 점수 (1-10)
- `condition_text` (string, required): 컨디션 설명
- `posted_date` (string, optional): 포스트 작성 날짜 (YYYY-MM-DD 형식), 기본값: 오늘 날짜
- `images` (array, optional): 첨부 이미지 정보

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-in post created successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "condition_score": 8,
    "condition_text": "오늘은 컨디션이 좋습니다!",
    "posted_at": "2024-01-15T09:00:00Z",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z"
  }
}
```

---

### 2. 체크아웃 포스트 생성 (POST)

**엔드포인트**: `POST /api/v1/posts/checkout`

**설명**: 새로운 체크아웃 포스트를 생성합니다. 하루를 마무리하는 회고 메시지를 포함할 수 있습니다.

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "reflection_text": "오늘 계획한 작업을 모두 완료했습니다. 내일은 새로운 기능 개발을 시작할 예정입니다.",
  "posted_date": "2024-01-15",
  "images": []
}
```

**요청 필드 설명**:

- `reflection_text` (string, required): 하루 회고 내용
- `posted_date` (string, optional): 포스트 작성 날짜 (YYYY-MM-DD 형식), 기본값: 오늘 날짜
- `images` (array, optional): 첨부 이미지 정보

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-out post created successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "reflection_text": "오늘 계획한 작업을 모두 완료했습니다. 내일은 새로운 기능 개발을 시작할 예정입니다.",
    "posted_at": "2024-01-15T18:00:00Z",
    "created_at": "2024-01-15T18:00:00Z",
    "updated_at": "2024-01-15T18:00:00Z"
  }
}
```

---

### 3. 포스트 목록 조회 - CQRS Query Service (GET)

**엔드포인트**: `GET /api/v1/posts/query`

**설명**: CQRS Query Service를 사용하여 포스트 목록을 페이지네이션과 필터링을 통해 조회합니다. 각 포스트에는 해당 사용자와 날짜의 Todo 개수가 포함됩니다.

**쿼리 파라미터**:

- `space_slug` (string, required): 스페이스 식별자
- `date` (string, optional): 날짜 필터 (YYYY-MM-DD 형식)
- `types` (string, optional): 포스트 타입 필터 (쉼표로 구분: checkin,checkout)
- `cursor` (string, optional): 페이지네이션 커서 (base64 인코딩)
- `limit` (integer, optional): 페이지 크기 (기본값: 20, 최소: 1, 최대: 100)

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존 (IANA 타임존)

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
      "space_member_id": "456e7890-e89b-12d3-a456-426614174001",
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
        "avatar_urls": [
          "https://example.com/avatar1.jpg",
          "https://example.com/avatar2.jpg"
        ],
        "count": 5,
        "last_comment_at": "2024-01-15T10:30:00Z"
      },
      "images": [],
      "reactions": [
        {
          "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
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

---

### 4. 포스트 목록 조회 - Legacy (GET)

**엔드포인트**: `GET /api/v1/posts`

**설명**: 레거시 PostService를 사용하여 포스트 목록을 조회합니다. 하위 호환성을 위해 유지되고 있으며, 새로운 구현에서는 `/api/v1/posts/query` 사용을 권장합니다.

**쿼리 파라미터**:

- `space_slug` (string, required): 스페이스 식별자
- `date` (string, optional): 날짜 필터 (YYYY-MM-DD 형식)
- `types` (string, optional): 포스트 타입 필터 (쉼표로 구분: checkin,checkout)
- `cursor` (string, optional): 페이지네이션 커서 (base64 인코딩)
- `limit` (integer, optional): 페이지 크기 (기본값: 20, 최소: 1, 최대: 100)

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
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
      "space_member_id": "456e7890-e89b-12d3-a456-426614174001",
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
        "avatar_urls": [
          "https://example.com/avatar1.jpg",
          "https://example.com/avatar2.jpg"
        ],
        "count": 5,
        "last_comment_at": "2024-01-15T10:30:00Z"
      },
      "images": [],
      "reactions": [
        {
          "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
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

### 5. 포스트 상세 조회 (댓글 포함) (GET)

**엔드포인트**: `GET /api/v1/posts/{postId}/comments`

**설명**: 특정 포스트의 상세 정보를 모든 댓글과 함께 조회합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "message": "Post with comments retrieved successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "post_type": "checkin",
    "posted_at": "2024-01-15T09:00:00Z",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z",
    "space_member_id": "456e7890-e89b-12d3-a456-426614174001",
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
      "count": 1,
      "avatar_urls": ["https://example.com/avatar2.jpg"],
      "last_comment_at": "2024-01-15T09:15:00Z"
    },
    "comments": [
      {
        "id": "234e5678-e89b-12d3-a456-426614174001",
        "content": "화이팅하세요!",
        "created_at": "2024-01-15T09:15:00Z",
        "updated_at": "2024-01-15T09:15:00Z",
        "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
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
    "reactions": [],
    "todo_count": 5
  }
}
```

---

### 6. 체크인 존재 여부 확인 (GET)

**엔드포인트**: `GET /api/v1/posts/checkin/exists`

**설명**: 특정 날짜에 사용자의 체크인 포스트가 존재하는지 확인합니다.

**쿼리 파라미터**:

- `date` (string, optional): 확인할 날짜 (YYYY-MM-DD 형식), 기본값: 오늘 날짜

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "exists": true
}
```

---

### 7. 피드 요약 조회 (GET)

**엔드포인트**: `GET /api/v1/posts/summary`

**설명**: 특정 날짜의 스페이스 전체 활동 요약을 조회합니다.

**쿼리 파라미터**:

- `date` (string, optional): 요약할 날짜 (YYYY-MM-DD 형식), 기본값: 오늘 날짜

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존

**응답**:

```json
{
  "message": "Feed summary retrieved successfully",
  "summary": {
    "date": "2024-01-15",
    "space_slug": "my-team-space",
    "check_in_count": 8,
    "check_out_count": 6,
    "total_workday_member_count": 10,
    "average_condition_score": 7.5,
    "next_checkin_order": 9
  }
}
```

**응답 필드 설명**:

- `date`: 요약 날짜
- `space_slug`: 스페이스 식별자
- `check_in_count`: 체크인 포스트 수
- `check_out_count`: 체크아웃 포스트 수
- `total_workday_member_count`: 해당 날짜에 근무일인 전체 멤버 수
- `average_condition_score`: 평균 컨디션 점수
- `next_checkin_order`: 다음 체크인 순서 번호

---

### 8. 체크인 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/posts/checkin/{postId}`

**설명**: 기존 체크인 포스트를 수정합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존

**요청 본문**:

```json
{
  "condition_score": 9,
  "condition_text": "컨디션이 더 좋아졌습니다!",
  "images": []
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-in post updated successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "condition_score": 9,
    "condition_text": "컨디션이 더 좋아졌습니다!",
    "posted_at": "2024-01-15T09:00:00Z",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:30:00Z"
  }
}
```

---

### 9. 체크아웃 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/posts/checkout/{postId}`

**설명**: 기존 체크아웃 포스트를 수정합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존

**요청 본문**:

```json
{
  "reflection_text": "오늘 하루를 되돌아보니 많은 것을 배웠습니다.",
  "images": []
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-out post updated successfully",
  "post": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "reflection_text": "오늘 하루를 되돌아보니 많은 것을 배웠습니다.",
    "posted_at": "2024-01-15T18:00:00Z",
    "created_at": "2024-01-15T18:00:00Z",
    "updated_at": "2024-01-15T18:30:00Z"
  }
}
```

---

### 10. 체크인 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/posts/checkin/{postId}`

**설명**: 체크인 포스트를 삭제합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-in post deleted successfully"
}
```

---

### 11. 체크아웃 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/posts/checkout/{postId}`

**설명**: 체크아웃 포스트를 삭제합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Check-out post deleted successfully"
}
```

---

### 12. 포스트 작성 날짜 조회 (GET)

**엔드포인트**: `GET /api/v1/posts/{postId}/date`

**설명**: 특정 포스트가 작성된 날짜를 조회합니다. 타임존을 고려한 날짜를 YYYY-MM-DD 형식으로 반환합니다.

**경로 파라미터**:

- `postId` (string, required): 포스트 ID

**헤더**:

- `Authorization` (string, required): Bearer {space_member_access_token}
- `X-Timezone` (string, optional): 사용자 타임존 (IANA 타임존), 기본값: `UTC`

**응답**:

```json
{
  "date": "2024-01-15"
}
```

**응답 코드**:

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 포스트 ID 형식
- `401 Unauthorized`: 인증되지 않은 요청
- `404 Not Found`: 포스트를 찾을 수 없거나 스페이스 멤버가 아님
- `500 Internal Server Error`: 서버 오류

---

## 에러 응답

모든 API는 다음과 같은 표준 에러 응답을 반환합니다:

**400 Bad Request**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "condition_score",
      "constraint": "must be between 1 and 10"
    }
  },
  "meta": {
    "request_id": "req-123456",
    "timestamp": "1234567890"
  }
}
```

**401 Unauthorized**:

```json
{
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Unauthorized",
    "details": {
      "reason": "Invalid or expired token"
    }
  },
  "meta": {
    "request_id": "req-123456",
    "timestamp": "1234567890"
  }
}
```

**404 Not Found**:

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Not found",
    "details": {
      "resource": "Post not found"
    }
  },
  "meta": {
    "request_id": "req-123456",
    "timestamp": "1234567890"
  }
}
```

**500 Internal Server Error**:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "details": {
      "description": "An unexpected error occurred"
    }
  },
  "meta": {
    "request_id": "req-123456",
    "timestamp": "1234567890"
  }
}
```

---

## 사용 예시

### 시나리오 1: 아침 체크인 생성

```bash
curl -X POST "${API_BASE_URL}/api/v1/posts/checkin" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Asia/Seoul" \
  -d '{
    "condition_score": 8,
    "condition_text": "오늘은 컨디션이 좋습니다! 프로젝트 마무리 작업 진행 예정입니다.",
    "posted_date": "2024-01-15"
  }'
```

### 시나리오 2: 오늘의 포스트 목록 조회 (CQRS Query Service)

```bash
curl -X GET "${API_BASE_URL}/api/v1/posts/query?space_slug=my-team-space&date=2024-01-15&types=checkin,checkout&limit=20" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "X-Timezone: Asia/Seoul"
```

응답에는 각 포스트마다 `todo_count` 필드가 포함되어, 해당 사용자가 같은 날짜에 가진 Todo 항목 개수를 확인할 수 있습니다.

### 시나리오 3: 저녁 체크아웃 생성

```bash
curl -X POST "${API_BASE_URL}/api/v1/posts/checkout" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Asia/Seoul" \
  -d '{
    "reflection_text": "오늘 계획했던 작업을 모두 완료했습니다. 팀원들과의 협업도 원활했고, 새로운 기능 구현도 성공적으로 마쳤습니다.",
    "posted_date": "2024-01-15"
  }'
```

### 시나리오 4: 피드 요약 조회

```bash
curl -X GET "${API_BASE_URL}/api/v1/posts/summary?date=2024-01-15" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "X-Timezone: Asia/Seoul"
```

### 시나리오 5: 포스트 작성 날짜 조회

```bash
curl -X GET "${API_BASE_URL}/api/v1/posts/123e4567-e89b-12d3-a456-426614174000/date" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "X-Timezone: Asia/Seoul"
```

응답:

```json
{
  "date": "2024-01-15"
}
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

### v1.2.0 (2025-01-15)

- CQRS Query Service 기반 포스트 조회 API 추가 (`/api/v1/posts/query`)
- 포스트 작성 날짜 조회 API 추가 (`/api/v1/posts/{postId}/date`)
- 기존 포스트 조회 API를 Legacy로 마킹
- API 응답에 `space_slug` 필드 추가
