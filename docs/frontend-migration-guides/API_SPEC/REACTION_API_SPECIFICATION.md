# Reaction API 명세서

## 개요

Reaction API는 스페이스 내에서 포스트 및 댓글에 대한 이모지 리액션 관리를 위한 RESTful API입니다. 사용자는 포스트나 댓글에 이모지 리액션을 추가하거나 제거할 수 있으며, 특정 대상의 모든 리액션을 조회할 수 있습니다. 실시간 WebSocket 이벤트를 통해 리액션 변경사항이 즉시 반영됩니다.

### 주요 기능
- 포스트/댓글에 이모지 리액션 추가
- 기존 리액션 제거
- 특정 대상의 모든 리액션 조회
- 실시간 리액션 업데이트 (WebSocket)
- 유니코드 이모지 지원 (복합 이모지 포함)

## 인증

Reaction API는 SpaceMember 인증을 요구합니다:

### SpaceMember 인증
특정 Space에 대한 권한 확인을 위한 인증입니다.

**Authorization 헤더**:
```
Authorization: Bearer {space_member_access_token}
```

SpaceMember 토큰에는 다음 정보가 포함되어 있습니다:
- `userID`: 사용자 ID
- `email`: 사용자 이메일  
- `spaceSlug`: Space 식별자
- `spaceMemberID`: Space 멤버 ID
- `role`: Space 내 역할

## 기본 URL

```
{API_BASE_URL}/api/v1/{targetType}/{targetId}/reactions
```

### URL 파라미터
- `targetType`: 리액션 대상 타입
  - `posts`: 포스트에 대한 리액션
  - `comments`: 댓글에 대한 리액션
- `targetId`: 대상의 UUID

---

## API 엔드포인트

### 1. 리액션 추가 (POST)

**엔드포인트**: `POST /api/v1/{targetType}/{targetId}/reactions`

**설명**: 특정 포스트 또는 댓글에 이모지 리액션을 추가합니다. 동일한 사용자가 동일한 대상에 같은 이모지로 중복 리액션을 추가할 수 없습니다.

**경로 파라미터**:
- `targetType` (string, required): 대상 타입 (`posts` 또는 `comments`)
- `targetId` (string, required): 대상 ID (UUID 형식)

**헤더**:
- `Authorization` (string, required): Bearer {space_member_access_token}
- `Content-Type`: application/json

**요청 본문**:
```json
{
  "emoji": "❤️"
}
```

**요청 필드 설명**:
- `emoji` (string, required): 추가할 이모지 (유효한 유니코드 이모지)

**응답**:
- `200 OK`: 성공
```json
{
  "message": "Reaction added successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 요청
  - 유효하지 않은 이모지
  - 잘못된 UUID 형식
  - 잘못된 target type
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 대상을 찾을 수 없음
- `409 Conflict`: 이미 동일한 리액션이 존재함
- `500 Internal Server Error`: 서버 오류

---

### 2. 리액션 제거 (DELETE)

**엔드포인트**: `DELETE /api/v1/{targetType}/{targetId}/reactions`

**설명**: 특정 포스트 또는 댓글에서 사용자의 이모지 리액션을 제거합니다.

**경로 파라미터**:
- `targetType` (string, required): 대상 타입 (`posts` 또는 `comments`)
- `targetId` (string, required): 대상 ID (UUID 형식)

**헤더**:
- `Authorization` (string, required): Bearer {space_member_access_token}

**쿼리 파라미터**:
- `emoji` (string, required): 제거할 이모지 (URL 인코딩 필요)

**응답**:
- `200 OK`: 성공
```json
{
  "message": "Reaction removed successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 리액션을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 3. 리액션 조회 (GET)

**엔드포인트**: `GET /api/v1/{targetType}/{targetId}/reactions`

**설명**: 특정 포스트 또는 댓글의 모든 리액션을 조회합니다. 인증 없이도 조회 가능합니다.

**경로 파라미터**:
- `targetType` (string, required): 대상 타입 (`posts` 또는 `comments`)
- `targetId` (string, required): 대상 ID (UUID 형식)

**헤더**:
- `Authorization` (string, required): Bearer {space_member_access_token}

**응답**:
- `200 OK`: 성공
```json
{
  "message": "Reactions fetched successfully",
  "summary": {
    "target_id": "123e4567-e89b-12d3-a456-426614174000",
    "target_type": "post",
    "reactions": [
      {
        "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
        "emoji": "❤️",
        "created_at": "2024-01-15T09:30:00Z",
        "author": {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "name": "Jane Smith",
          "avatar_url": ""
        }
      },
      {
        "space_member_id": "890e1234-e89b-12d3-a456-426614174003",
        "emoji": "👍",
        "created_at": "2024-01-15T10:15:00Z",
        "author": {
          "id": "890e1234-e89b-12d3-a456-426614174003",
          "name": "Bob Johnson",
          "avatar_url": ""
        }
      }
    ],
    "total_count": 2
  }
}
```

**응답 필드 설명**:
- `summary.target_id`: 리액션 대상의 ID
- `summary.target_type`: 리액션 대상의 타입 (`post` 또는 `comment`)
- `summary.reactions`: 리액션 목록
  - `space_member_id`: 리액션을 추가한 Space 멤버 ID
  - `emoji`: 이모지
  - `created_at`: 리액션 추가 시간
  - `author`: 리액션 추가자 정보
    - `id`: Space 멤버 ID
    - `name`: 멤버 이름
    - `avatar_url`: 아바타 URL (현재 미구현)
- `summary.total_count`: 전체 리액션 수

**에러 응답**:
- `400 Bad Request`: 잘못된 요청
- `404 Not Found`: 대상을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## Request/Response 스키마

### AddReactionRequest
```json
{
  "emoji": "string" // required, 유효한 유니코드 이모지
}
```

### RemoveReactionRequest
DELETE 메서드는 쿼리 파라미터를 사용하므로 Request Body가 없습니다.
쿼리 파라미터: `?emoji={URL_ENCODED_EMOJI}`

참고: 코드에 RemoveReactionRequest 구조체가 정의되어 있으나 실제로는 사용되지 않습니다.

### ReactionDTO
```json
{
  "space_member_id": "string",
  "emoji": "string",
  "created_at": "string (ISO 8601)",
  "author": {
    "id": "string",
    "name": "string", 
    "avatar_url": "string"
  }
}
```

### ReactionSummaryDTO
```json
{
  "target_id": "string",
  "target_type": "string",
  "reactions": [ReactionDTO],
  "total_count": "integer"
}
```

---

## 에러 응답 형식

모든 API는 다음과 같은 표준 에러 응답을 반환합니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "field_name",
      "constraint": "constraint description"
    }
  },
  "meta": {
    "request_id": "req-123456",
    "timestamp": "1234567890"
  }
}
```

### 주요 에러 코드
- `VALIDATION_ERROR`: 요청 데이터 검증 실패
- `TOKEN_INVALID`: 인증 토큰 무효
- `REACTION_NOT_FOUND`: 리액션을 찾을 수 없음
- `REACTION_ALREADY_EXISTS`: 동일한 리액션이 이미 존재
- `INTERNAL_ERROR`: 서버 내부 오류

---

## 사용 예시 시나리오

### 시나리오 1: 포스트에 하트 리액션 추가
```bash
curl -X POST "${API_BASE_URL}/api/v1/posts/123e4567-e89b-12d3-a456-426614174000/reactions" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "❤️"
  }'
```

### 시나리오 2: 댓글에서 엄지척 리액션 제거
```bash
curl -X DELETE "${API_BASE_URL}/api/v1/comments/234e5678-e89b-12d3-a456-426614174001/reactions?emoji=%F0%9F%91%8D" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}"
```

### 시나리오 3: 포스트의 모든 리액션 조회
```bash
curl -X GET "${API_BASE_URL}/api/v1/posts/123e4567-e89b-12d3-a456-426614174000/reactions" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}"
```

### 시나리오 4: 복합 이모지 리액션 추가
```bash
# 피부톤이 적용된 이모지
curl -X POST "${API_BASE_URL}/api/v1/posts/123e4567-e89b-12d3-a456-426614174000/reactions" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "👍🏾"
  }'

# 가족 이모지 (ZWJ 시퀀스)
curl -X POST "${API_BASE_URL}/api/v1/posts/123e4567-e89b-12d3-a456-426614174000/reactions" \
  -H "Authorization: Bearer ${SPACE_MEMBER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji": "👨‍👩‍👧‍👦"
  }'
```

---

## 데이터 모델

### Reaction Entity
```go
type Reaction struct {
    ID            uuid.UUID
    CreatedAt     time.Time
    SpaceMemberID uuid.UUID
    TargetID      uuid.UUID
    TargetType    ReactionTargetType // "post" or "comment"
    Emoji         string
}
```

### ReactionTargetType
```go
type ReactionTargetType string

const (
    ReactionTargetTypePost    ReactionTargetType = "post"
    ReactionTargetTypeComment ReactionTargetType = "comment"
)
```

---

## 주의사항 및 제약사항

### 1. 이모지 검증
- 유효한 유니코드 이모지만 허용됩니다
- 복합 이모지(ZWJ 시퀀스, 피부톤 수정자 등) 지원
- 텍스트나 일반 문자는 거부됩니다

### 2. 중복 리액션 방지
- 동일한 사용자가 동일한 대상에 같은 이모지로 중복 리액션 불가
- 409 Conflict 응답 반환

### 3. 권한 확인
- 모든 리액션 API는 SpaceMember 인증 필요
- 자신이 추가한 리액션만 제거 가능

### 4. 성능 고려사항
- 리액션 조회 시 모든 리액션 정보 반환 (페이징 없음)
- 대량의 리액션이 있는 경우 응답 크기가 클 수 있음

### 5. 실시간 업데이트
- WebSocket을 통해 리액션 추가/제거 이벤트 전송
- 이벤트 타입:
  - `reaction.added`: 리액션 추가 시
  - `reaction.removed`: 리액션 제거 시
- 채널: `space:{spaceSlug}:reactions:{targetId}`

### 6. 데이터 일관성
- 포스트/댓글 삭제 시 관련 리액션도 자동 삭제
- 트랜잭션으로 데이터 일관성 보장

---

## 버전 히스토리

### v1.0.1 (2025-07-28)
- 인증 방식 업데이트: Cookie 인증 제거, Authorization 헤더만 사용
- 모든 엔드포인트에 SpaceMember 인증 필요 (GET 포함)
- RemoveReactionRequest 구조체 사용 안내 추가

### v1.0.0 (2024-01-15)
- 초기 릴리즈
- 리액션 추가/제거/조회 기능
- WebSocket 실시간 업데이트
- 유니코드 이모지 지원