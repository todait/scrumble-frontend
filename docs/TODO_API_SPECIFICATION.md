# Todo API 명세서

## 개요

Todo API는 스페이스 내에서 할 일(Todo) 관리를 위한 RESTful API입니다. 계층적 구조(부모-자식 관계), 완료 상태 토글, 부분 업데이트, **타임존 지원** 등을 지원합니다.

## 인증

모든 Todo API는 Bearer 토큰 인증이 필요합니다.

```
Authorization: Bearer {access_token}
```

## 타임존 지원

모든 Todo API는 사용자의 타임존을 고려한 날짜 처리를 지원합니다.

**타임존 헤더** (선택사항):

```
X-Timezone: Asia/Seoul
```

**지원하는 타임존 형식**: IANA 타임존 데이터베이스 형식 (예: `Asia/Seoul`, `America/New_York`, `UTC`)
**기본값**: `UTC`

**동작 방식**:

- **생성/수정**: 사용자 타임존의 날짜를 서버 내부적으로 UTC 기준으로 변환하여 저장
- **조회**: 사용자 타임존 기준으로 해당 날짜의 할 일들을 조회

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

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "todos": [
    {
      "name": "프로젝트 계획 수립",
      "description": "Q1 프로젝트 로드맵 작성",
      "scheduled_date": "2024-01-15",
      "origin_todo_id": null,
      "thirdparty_url": "https://github.com/project/issue/123",
      "children": [
        {
          "name": "요구사항 분석",
          "description": "사용자 요구사항 문서 작성",
          "scheduled_date": "2024-01-16",
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

**설명**: 특정 날짜의 할 일을 계층적 트리 구조로 조회합니다. 사용자의 타임존을 고려하여 해당 날짜의 할 일들을 반환합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**쿼리 파라미터**:

- `date` (string, required): 날짜 (YYYY-MM-DD 형식) 예: `2024-01-15`
- `userId` (string, optional): 조회할 사용자 ID (UUID 형식). 예: `123e4567-e89b-12d3-a456-426614174000`. 미제공 시 현재 사용자의 Todo 조회

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

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

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문** (모든 필드는 선택사항):

```json
{
  "name": "수정된 할 일 제목",
  "description": "수정된 설명",
  "scheduled_date": "2024-01-20",
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

**헤더**:

- `Authorization` (string, required): Bearer 토큰

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

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**요청 본문**: 없음

**응답**:

- `204 No Content`: 성공적으로 삭제됨

**에러 응답**:

- `400 Bad Request`: 잘못된 파라미터
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 할 일을 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 6. 할 일 일괄 업데이트 (POST)

**엔드포인트**: `POST /api/v1/spaces/{spaceSlug}/todos`

**설명**: 여러 할 일을 한 번에 일괄 업데이트합니다. 효율적인 diff 알고리즘을 사용하여 생성/수정/삭제를 단일 트랜잭션으로 처리합니다.

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**헤더**:

- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**요청 본문**:

```json
{
  "scheduled_date": "2024-01-20",
  "todos": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "수정된 할 일",
      "description": "수정된 설명",
      "scheduled_date": "2024-01-20",
      "order": 1,
      "thirdparty_url": null,
      "parent_id": null,
      "origin_todo_id_is_nil": true
    },
    {
      "name": "새로운 할 일",
      "description": "새로 추가할 할 일",
      "scheduled_date": "2024-01-21",
      "order": 0
    }
  ]
}
```

**응답**:

```json
{
  "message": "Todos bulk updated successfully",
  "result": {
    "created": 1,
    "updated": 1,
    "deleted": 3
  }
}
```

**에러 응답**:

- `400 Bad Request`: 유효성 검사 실패
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

**동작 방식**:

- **ID가 없는 항목**: 새로 생성
- **ID가 있고 기존에 존재하는 항목**: 업데이트
- **요청에 포함되지 않은 기존 항목**: 소프트 삭제
- **유효하지 않은 ID**: 무시됨

---

## 데이터 모델

### TodoItemInput (생성 시 사용)

```typescript
interface TodoItemInput {
  name: string;
  description?: string;
  scheduled_date: string; // YYYY-MM-DD 형식 (예: "2024-01-15")
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
  scheduled_date: string; // ISO 8601 형식 (UTC, 예: "2024-01-15T00:00:00Z")
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
  scheduled_date?: string; // YYYY-MM-DD 형식 (예: "2024-01-15")
  order?: number;
  thirdparty_url?: string;
  parent_id?: string; // UUID
  origin_todo_id_is_nil?: boolean; // true 시 origin_todo_id를 null로 설정
}
```

### BulkUpdateTodosRequest (일괄 업데이트 시 사용)

```typescript
interface BulkUpdateTodosRequest {
  scheduled_date: string; // YYYY-MM-DD 형식 (필수, 예: "2024-01-15")
  todos: UpdateTodoItem[];
}

interface UpdateTodoItem {
  id?: string; // UUID, 없으면 새로 생성
  name?: string;
  description?: string;
  scheduled_date?: string; // YYYY-MM-DD 형식 (예: "2024-01-15")
  order?: number;
  thirdparty_url?: string;
  parent_id?: string; // UUID
  origin_todo_id_is_nil?: boolean; // true 시 origin_todo_id를 null로 설정
}
```

### BulkUpdateResult (일괄 업데이트 응답)

```typescript
interface BulkUpdateResult {
  created: number; // 생성된 할 일 개수
  updated: number; // 수정된 할 일 개수
  deleted: number; // 삭제된 할 일 개수
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
- `scheduled_date`: YYYY-MM-DD 형식 (필수) - 사용자 타임존을 고려하여 처리
- `thirdparty_url`: 유효한 URL 형식 (선택)

### 6. 타임존 처리

- **입력 시**: `X-Timezone` 헤더의 타임존 기준으로 날짜를 해석하여 UTC로 변환 저장
- **조회 시**: `X-Timezone` 헤더의 타임존 기준으로 해당 날짜의 할 일들을 필터링하여 반환
- **예시**:
  - 서울 사용자가 "2024-01-15" 입력 → UTC "2024-01-14"에 저장 (UTC+9)
  - 뉴욕 사용자가 "2024-01-15" 입력 → UTC "2024-01-15"에 저장 (UTC-5)

---

## 에러 코드

| 코드                        | 설명                           |
| --------------------------- | ------------------------------ |
| `VALIDATION_ERROR`          | 입력 데이터 유효성 검사 실패   |
| `NOT_FOUND`                 | 리소스를 찾을 수 없음          |
| `SPACE_NOT_FOUND`           | 스페이스를 찾을 수 없음        |
| `SPACE_MEMBER_NOT_FOUND`    | 스페이스 멤버십을 찾을 수 없음 |
| `TODO_NAME_REQUIRED`        | 할 일 이름이 필요함            |
| `TODO_NAME_TOO_LONG`        | 할 일 이름이 너무 김           |
| `TODO_DESCRIPTION_TOO_LONG` | 할 일 설명이 너무 김           |
| `TODO_DEPTH_EXCEEDED`       | 최대 깊이 초과                 |
| `INVALID_TODO_URL`          | 잘못된 URL 형식                |

---

## 예제 시나리오

### 시나리오 1: 새로운 프로젝트 할 일 생성 (타임존 고려)

```bash
# 1. 서울 타임존 사용자가 메인 할 일과 하위 할 일들을 한 번에 생성
POST /api/v1/spaces/my-team/todos
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
  Content-Type: application/json

{
  "todos": [
    {
      "name": "웹사이트 리뉴얼",
      "description": "회사 웹사이트 전면 리뉴얼",
      "scheduled_date": "2024-03-01",
      "children": [
        {
          "name": "디자인 시안 작성",
          "scheduled_date": "2024-03-05",
          "children": []
        },
        {
          "name": "개발 환경 구축",
          "scheduled_date": "2024-03-10",
          "children": []
        }
      ]
    }
  ]
}
```

### 시나리오 2: 특정 날짜 할 일 조회 및 완료 처리 (타임존 고려)

```bash
# 1. 서울 타임존 기준으로 오늘 할 일 목록 조회
GET /api/v1/spaces/my-team/todos?date=2024-03-05
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul

# 2. 특정 할 일 완료 처리
PATCH /api/v1/spaces/my-team/todos/123e4567-e89b-12d3-a456-426614174000/toggle
Headers:
  Authorization: Bearer {token}
```

### 시나리오 3: 할 일 수정 (타임존 고려)

```bash
# 할 일의 이름, 설명, 날짜 수정
PATCH /api/v1/spaces/my-team/todos/123e4567-e89b-12d3-a456-426614174000
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
  Content-Type: application/json

{
  "name": "수정된 할 일 제목",
  "description": "더 자세한 설명 추가",
  "scheduled_date": "2024-03-15"
}
```

### 시나리오 4: 일괄 업데이트로 효율적인 할 일 관리

```bash
# 여러 할 일을 한 번에 업데이트 (생성, 수정, 삭제)
POST /api/v1/spaces/my-team/todos
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
  Content-Type: application/json

{
  "scheduled_date": "2024-03-10",
  "todos": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "수정된 프로젝트 계획",
      "description": "업데이트된 프로젝트 설명",
      "scheduled_date": "2024-03-10"
    },
    {
      "name": "새로운 할 일",
      "description": "새로 추가할 작업",
      "scheduled_date": "2024-03-11",
      "order": 1
    },
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "완료된 작업",
      "order": 2
    }
  ]
}

# 응답: 생성, 수정, 삭제 결과
{
  "message": "Todos bulk updated successfully",
  "result": {
    "created": 1,
    "updated": 2,
    "deleted": 0
  }
}
```

### 시나리오 5: 특정 사용자의 Todo 조회

```bash
# 다른 사용자의 Todo 목록 조회 (권한이 있는 경우)
GET /api/v1/spaces/my-team/todos?date=2024-03-05&userId=456e7890-e89b-12d3-a456-426614174001
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul

# 본인의 Todo 목록 조회 (userId 파라미터 생략)
GET /api/v1/spaces/my-team/todos?date=2024-03-05
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
```

### 시나리오 6: 다중 타임존 환경에서의 사용법

```bash
# 뉴욕 사용자가 같은 날짜로 할 일 생성
POST /api/v1/spaces/my-team/todos
Headers:
  Authorization: Bearer {token}
  X-Timezone: America/New_York
  Content-Type: application/json

{
  "todos": [
    {
      "name": "미팅 준비",
      "scheduled_date": "2024-03-01"
    }
  ]
}

# 서울 사용자가 2024-03-01 조회 (서울 시간 기준)
GET /api/v1/spaces/my-team/todos?date=2024-03-01
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul

# 뉴욕 사용자가 2024-03-01 조회 (뉴욕 시간 기준)
GET /api/v1/spaces/my-team/todos?date=2024-03-01
Headers:
  Authorization: Bearer {token}
  X-Timezone: America/New_York
```

---

## 타임존 처리 FAQ

### Q1: 타임존을 지정하지 않으면 어떻게 되나요?

**A**: `X-Timezone` 헤더를 제공하지 않으면 기본값인 `UTC`로 처리됩니다.

### Q2: 서로 다른 타임존의 사용자들이 같은 스페이스를 사용할 때는 어떻게 되나요?

**A**: 각 사용자는 자신의 타임존을 기준으로 할 일을 생성하고 조회할 수 있습니다. 서버는 내부적으로 UTC로 저장하되, 조회 시에는 사용자의 타임존을 고려하여 필터링합니다.

### Q3: scheduled_date가 ISO 8601 형식으로 반환되는 이유는 무엇인가요?

**A**: 조회 응답에서는 정확한 UTC 시간 정보를 제공하기 위해 ISO 8601 형식(`2024-01-15T00:00:00Z`)으로 반환합니다. 클라이언트에서 필요에 따라 사용자의 로컬 타임존으로 변환할 수 있습니다.

### Q4: 일광절약시간제(DST)는 어떻게 처리되나요?

**A**: IANA 타임존 데이터베이스를 사용하므로 일광절약시간제가 자동으로 처리됩니다. 예를 들어 `America/New_York` 타임존을 사용하면 DST 기간에는 UTC-4, 그 외에는 UTC-5로 자동 계산됩니다.

### Q5: 잘못된 타임존을 제공하면 어떻게 되나요?

**A**: 유효하지 않은 타임존을 제공하면 자동으로 `UTC`로 폴백되어 처리됩니다.

---

## 변경 이력

### v2.1.2 (2025-01-12)

- ✨ **날짜별 Todo 조회 API 개선**: `GET /api/v1/spaces/{spaceSlug}/todos`에 `userId` 쿼리 파라미터 추가
- 🔧 **다른 사용자 Todo 조회 가능**: userId 파라미터로 특정 사용자의 Todo 조회 가능 (권한 검증 유지)
- 📝 **문서 업데이트**: API 스펙 및 시나리오 예제 추가

### v2.1.1 (2025-01-11)

- 🔄 **일괄 업데이트 API 변경**: 엔드포인트를 `POST /api/v1/spaces/{spaceSlug}/todos`로 변경
- ✨ **필수 필드 추가**: `scheduled_date` 필드를 요청 본문에 필수로 추가
- 📝 **문서 업데이트**: API 스펙 및 예제 코드 수정

### v2.1.0 (2025-01-10)

- ✨ **일괄 업데이트 API 추가**: `POST /api/v1/spaces/{spaceSlug}/todos` 엔드포인트 추가
- 🚀 **성능 최적화**: diff 알고리즘으로 효율적인 생성/수정/삭제 처리
- 🔧 **단일 트랜잭션**: 모든 변경사항을 원자적으로 처리
- 📝 **문서 개선**: 일괄 업데이트 사용 가이드 및 예제 추가

### v2.0.0 (2025-01-10)

- ✨ **타임존 지원 추가**: `X-Timezone` 헤더를 통한 다중 타임존 지원
- 🔄 **API 변경**: `scheduled_date` 입력 형식을 YYYY-MM-DD로 변경 (출력은 ISO 8601 유지)
- 📝 **문서 개선**: 타임존 처리 가이드 및 예제 추가

### v1.0.0 (이전 버전)

- 🎯 기본 Todo CRUD 기능
- 🌳 계층적 구조 지원
- ✅ 완료 상태 토글
- 🔧 부분 업데이트
