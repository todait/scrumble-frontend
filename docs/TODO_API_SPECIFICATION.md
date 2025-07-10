# Todo API 명세서

## 개요
Todo API는 스페이스 내에서 할 일(Todo) 관리를 위한 RESTful API입니다. 계층적 구조(부모-자식 관계), 완료 상태 토글, 부분 업데이트 등을 지원합니다.

## 인증
모든 Todo API는 Bearer 토큰 인증이 필요합니다.
```
Authorization: Bearer {access_token}
```

## 기본 URL
```
{API_BASE_URL}/api/v1/spaces/{spaceSlug}/todos
```

---

## API 엔드포인트

### 1. 할 일 생성 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/todos`

**설명**: 하나 이상의 할 일을 계층적 구조로 생성합니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 식별자

**요청 본문**:
```json
{
  "todos": [
    {
      "name": "프로젝트 계획 수립",
      "description": "Q1 프로젝트 로드맵 작성",
      "scheduled_date": "2024-01-15T00:00:00Z",
      "origin_todo_id": null,
      "thirdparty_url": "https://github.com/project/issue/123",
      "children": [
        {
          "name": "요구사항 분석",
          "description": "사용자 요구사항 문서 작성",
          "scheduled_date": "2024-01-16T00:00:00Z",
          "origin_todo_id": null,
          "thirdparty_url": null,
          "children": []
        }
      ]
    }
  ]
}
```

**응답**:
- `200 OK`: 성공
```json
{
  "message": "Todos created successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 유효성 검사 실패
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 2. 날짜별 할 일 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}/todos?date={date}`

**설명**: 특정 날짜의 할 일을 계층적 트리 구조로 조회합니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 식별자

**쿼리 파라미터**:
- `date` (string, required): 날짜 (YYYY-MM-DD 형식) 예: `2024-01-15`

**응답**:
```json
{
  "todos": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "프로젝트 계획 수립",
      "description": "Q1 프로젝트 로드맵 작성",
      "scheduled_date": "2024-01-15T00:00:00Z",
      "order": 0,
      "thirdparty_url": "https://github.com/project/issue/123",
      "parent_id": null,
      "origin_todo_id": null,
      "depth": 0,
      "completed_at": null,
      "children": [
        {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "name": "요구사항 분석",
          "description": "사용자 요구사항 문서 작성",
          "scheduled_date": "2024-01-15T00:00:00Z",
          "order": 0,
          "thirdparty_url": null,
          "parent_id": "123e4567-e89b-12d3-a456-426614174000",
          "origin_todo_id": null,
          "depth": 1,
          "completed_at": null,
          "children": []
        }
      ]
    }
  ]
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 날짜 형식
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 3. 할 일 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/spaces/{spaceSlug}/todos/{todoId}`

**설명**: 할 일의 특정 필드를 부분적으로 수정합니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 식별자
- `todoId` (string, required): 할 일 UUID

**요청 본문** (모든 필드는 선택사항):
```json
{
  "name": "수정된 할 일 제목",
  "description": "수정된 설명",
  "scheduled_date": "2024-01-20T00:00:00Z",
  "order": 1,
  "thirdparty_url": "https://updated-url.com",
  "parent_id": "789e0123-e89b-12d3-a456-426614174002",
  "origin_todo_id_is_nil": true
}
```

**응답**:
```json
{
  "message": "Todo updated successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 유효성 검사 실패
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 할 일을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 4. 할 일 완료 상태 토글 (PATCH)

**엔드포인트**: `PATCH /api/v1/spaces/{spaceSlug}/todos/{todoId}/toggle`

**설명**: 할 일의 완료 상태를 토글합니다 (완료 ↔ 미완료).

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 식별자
- `todoId` (string, required): 할 일 UUID

**요청 본문**: 없음

**응답**:
```json
{
  "message": "Todo completion toggled successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 파라미터
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 할 일을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 5. 할 일 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/spaces/{spaceSlug}/todos/{todoId}`

**설명**: 할 일을 소프트 삭제합니다 (영구 삭제가 아닌 삭제 마킹).

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 식별자
- `todoId` (string, required): 할 일 UUID

**요청 본문**: 없음

**응답**: 
- `204 No Content`: 성공적으로 삭제됨

**에러 응답**:
- `400 Bad Request`: 잘못된 파라미터
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 할 일을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 데이터 모델

### TodoItemInput (생성 시 사용)
```typescript
interface TodoItemInput {
  name: string;
  description?: string;
  scheduled_date: string; // ISO 8601 형식
  origin_todo_id?: string; // UUID
  thirdparty_url?: string;
  children: TodoItemInput[];
}
```

### TodoReadModel (조회 시 반환)
```typescript
interface TodoReadModel {
  id: string; // UUID
  name: string;
  description?: string;
  scheduled_date: string; // ISO 8601 형식
  order: number;
  thirdparty_url?: string;
  parent_id?: string; // UUID
  origin_todo_id?: string; // UUID
  depth: number;
  completed_at?: string; // ISO 8601 형식
  children: TodoReadModel[];
}
```

### UpdateTodoRequest (수정 시 사용)
```typescript
interface UpdateTodoRequest {
  name?: string;
  description?: string;
  scheduled_date?: string; // ISO 8601 형식
  order?: number;
  thirdparty_url?: string;
  parent_id?: string; // UUID
  origin_todo_id_is_nil?: boolean; // true 시 origin_todo_id를 null로 설정
}
```

---

## 비즈니스 규칙

### 1. 계층 구조
- 최대 3단계 깊이까지 지원 (depth: 0, 1, 2, 3)
- 부모-자식 관계는 `parent_id`로 관리
- 트리 구조로 응답 시 `children` 배열에 하위 할 일들이 포함

### 2. 권한
- 사용자는 자신이 속한 스페이스의 할 일만 접근 가능
- 다른 사용자의 할 일은 조회/수정/삭제 불가

### 3. 삭제 정책
- 소프트 삭제 방식 사용 (`deleted_at` 필드)
- 삭제된 할 일은 조회 결과에서 제외
- 자식 할 일들은 개별적으로 삭제 처리

### 4. 완료 상태
- `completed_at` 필드로 완료 상태 관리
- `null`: 미완료, `timestamp`: 완료 시각
- 토글 시 현재 상태에 따라 자동 전환

### 5. 유효성 검사
- `name`: 1-100자 (필수)
- `description`: 최대 500자 (선택)
- `scheduled_date`: ISO 8601 형식 (필수)
- `thirdparty_url`: 유효한 URL 형식 (선택)

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `VALIDATION_ERROR` | 입력 데이터 유효성 검사 실패 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `SPACE_NOT_FOUND` | 스페이스를 찾을 수 없음 |
| `SPACE_MEMBER_NOT_FOUND` | 스페이스 멤버십을 찾을 수 없음 |
| `TODO_NAME_REQUIRED` | 할 일 이름이 필요함 |
| `TODO_NAME_TOO_LONG` | 할 일 이름이 너무 김 |
| `TODO_DESCRIPTION_TOO_LONG` | 할 일 설명이 너무 김 |
| `TODO_DEPTH_EXCEEDED` | 최대 깊이 초과 |
| `INVALID_TODO_URL` | 잘못된 URL 형식 |

---

## 예제 시나리오

### 시나리오 1: 새로운 프로젝트 할 일 생성
```bash
# 1. 메인 할 일과 하위 할 일들을 한 번에 생성
POST /api/v1/spaces/my-team/todos
{
  "todos": [
    {
      "name": "웹사이트 리뉴얼",
      "description": "회사 웹사이트 전면 리뉴얼",
      "scheduled_date": "2024-03-01T00:00:00Z",
      "children": [
        {
          "name": "디자인 시안 작성",
          "scheduled_date": "2024-03-05T00:00:00Z",
          "children": []
        },
        {
          "name": "개발 환경 구축",
          "scheduled_date": "2024-03-10T00:00:00Z",
          "children": []
        }
      ]
    }
  ]
}
```

### 시나리오 2: 특정 날짜 할 일 조회 및 완료 처리
```bash
# 1. 오늘 할 일 목록 조회
GET /api/v1/spaces/my-team/todos?date=2024-03-05

# 2. 특정 할 일 완료 처리
PATCH /api/v1/spaces/my-team/todos/123e4567-e89b-12d3-a456-426614174000/toggle
```

### 시나리오 3: 할 일 수정
```bash
# 할 일의 이름과 설명 수정
PATCH /api/v1/spaces/my-team/todos/123e4567-e89b-12d3-a456-426614174000
{
  "name": "수정된 할 일 제목",
  "description": "더 자세한 설명 추가"
}
```