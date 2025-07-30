# Space API 명세서

## 개요

Space API는 팀 스페이스 관리를 위한 RESTful API입니다. 스페이스 생성, 수정, 조회, 삭제 기능을 제공하며, 멤버 관리와 **타임존 지원**을 포함합니다.

## 인증

모든 Space API는 Bearer 토큰 인증이 필요합니다.

```
Authorization: Bearer {access_token}
```

## 타임존 지원

모든 Space API는 사용자의 타임존을 고려한 시간 처리를 지원합니다.

**타임존 헤더** (선택사항):

```
X-Timezone: Asia/Seoul
```

**지원하는 타임존 형식**: IANA 타임존 데이터베이스 형식 (예: `Asia/Seoul`, `America/New_York`, `UTC`)
**기본값**: `UTC`

**동작 방식**:
- **조회**: 타임스탬프(createdAt, updatedAt, joinedAt)가 사용자 타임존으로 변환되어 반환

## 기본 URL

```
{API_BASE_URL}/api/v1/spaces
```

---

## API 엔드포인트

### 1. 스페이스 생성 (POST)

**엔드포인트**: `POST /api/v1/spaces`

**설명**: 새로운 스페이스를 생성합니다. 생성한 사용자는 자동으로 소유자(owner) 권한을 가집니다.

**헤더**:
- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`
- `Content-Type` (string, required): `application/json`

**요청 본문**:

```json
{
  "name": "프로젝트 팀 스페이스"
}
```

**참고**: 스페이스 생성 시 아이콘은 설정할 수 없으며, 생성 후 수정 API를 통해 설정해야 합니다.

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Space created successfully",
  "space": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "project-team-space-abcd1234",
    "name": "프로젝트 팀 스페이스",
    "iconURL": null,
    "members": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "userId": "789e0123-e89b-12d3-a456-426614174002",
        "name": "김개발",
        "avatarURL": "https://example.com/avatar.jpg",
        "role": "owner",
        "joinedAt": "2024-01-15T09:00:00+09:00"
      }
    ],
    "createdAt": "2024-01-15T09:00:00+09:00",
    "updatedAt": "2024-01-15T09:00:00+09:00"
  }
}
```

**에러 응답**:
- `400 Bad Request`: 유효성 검사 실패 (이름 필수, 1-100자)
- `401 Unauthorized`: 인증 실패
- `500 Internal Server Error`: 서버 오류

---

### 2. 스페이스 수정 (PATCH)

**엔드포인트**: `PATCH /api/v1/spaces/{spaceSlug}`

**설명**: 스페이스의 이름과 아이콘 URL을 수정합니다. 부분 업데이트를 지원합니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 슬러그 식별자

**헤더**:
- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`
- `Content-Type` (string, required): `application/json`

**요청 본문** (모든 필드는 선택사항):

```json
{
  "name": "수정된 스페이스 이름",
  "icon_url": "https://example.com/icon.png"
}
```

**응답**:

```json
{
  "message": "Space updated successfully",
  "space": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "project-team-space-abcd1234",
    "name": "수정된 스페이스 이름",
    "iconURL": "https://example.com/icon.png",
    "members": [...],
    "createdAt": "2024-01-15T09:00:00+09:00",
    "updatedAt": "2024-01-16T10:30:00+09:00"
  }
}
```

**에러 응답**:
- `400 Bad Request`: 유효성 검사 실패
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 3. 내 스페이스 목록 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/my-list`

**설명**: 인증된 사용자가 멤버로 속한 모든 스페이스 목록을 조회합니다.

**헤더**:
- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**응답**:

```json
{
  "spaces": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "slug": "project-team-space-abcd1234",
      "name": "프로젝트 팀 스페이스",
      "iconURL": "https://example.com/icon.png",
      "members": [
        {
          "id": "456e7890-e89b-12d3-a456-426614174001",
          "userId": "789e0123-e89b-12d3-a456-426614174002",
          "name": "김개발",
          "avatarURL": "https://example.com/avatar1.jpg",
          "role": "owner",
          "joinedAt": "2024-01-15T09:00:00+09:00"
        },
        {
          "id": "111e2222-e89b-12d3-a456-426614174003",
          "userId": "333e4444-e89b-12d3-a456-426614174004",
          "name": "이디자인",
          "avatarURL": "https://example.com/avatar2.jpg",
          "role": "member",
          "joinedAt": "2024-01-16T10:00:00+09:00"
        }
      ],
      "createdAt": "2024-01-15T09:00:00+09:00",
      "updatedAt": "2024-01-16T10:30:00+09:00"
    }
  ]
}
```

**에러 응답**:
- `401 Unauthorized`: 인증 실패
- `500 Internal Server Error`: 서버 오류

---

### 4. 스페이스 상세 조회 (GET)

**엔드포인트**: `GET /api/v1/spaces/{spaceSlug}`

**설명**: 특정 스페이스의 상세 정보를 조회합니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 슬러그 식별자

**헤더**:
- `Authorization` (string, required): Bearer 토큰
- `X-Timezone` (string, optional): 사용자 타임존 (예: `Asia/Seoul`), 기본값: `UTC`

**응답**:

```json
{
  "space": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "project-team-space-abcd1234",
    "name": "프로젝트 팀 스페이스",
    "iconURL": "https://example.com/icon.png",
    "members": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "userId": "789e0123-e89b-12d3-a456-426614174002",
        "name": "김개발",
        "avatarURL": "https://example.com/avatar1.jpg",
        "role": "owner",
        "joinedAt": "2024-01-15T09:00:00+09:00"
      }
    ],
    "createdAt": "2024-01-15T09:00:00+09:00",
    "updatedAt": "2024-01-16T10:30:00+09:00"
  }
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 파라미터
- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 5. 스페이스 삭제 (DELETE)

**엔드포인트**: `DELETE /api/v1/spaces/{spaceSlug}`

**설명**: 스페이스를 삭제합니다. 스페이스 소유자(owner)만 삭제할 수 있습니다.

**경로 파라미터**:
- `spaceSlug` (string, required): 스페이스 슬러그 식별자

**헤더**:
- `Authorization` (string, required): Bearer 토큰

**응답**:

```json
{
  "message": "Space deleted successfully"
}
```

**에러 응답**:
- `400 Bad Request`: 잘못된 파라미터
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족 (소유자가 아님)
- `404 Not Found`: 스페이스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 데이터 모델

### CreateSpaceRequest (생성 시 사용)

```typescript
interface CreateSpaceRequest {
  name: string; // 1-100자, 필수
}
```

### UpdateSpaceRequest (수정 시 사용)

```typescript
interface UpdateSpaceRequest {
  name?: string;     // 1-100자
  icon_url?: string; // 유효한 URL 형식
}
```

### SpaceDTO (응답 시 반환)

```typescript
interface SpaceDTO {
  id: string;        // UUID
  slug: string;      // 유니크한 스페이스 식별자
  name: string;      // 스페이스 이름
  iconURL?: string;  // 아이콘 URL (선택)
  members: SpaceMemberInfoDTO[]; // 멤버 목록
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
}
```

### SpaceMemberInfoDTO (멤버 정보)

```typescript
interface SpaceMemberInfoDTO {
  id: string;        // 멤버십 ID (UUID)
  userId: string;    // 사용자 ID (UUID)
  name: string;      // 사용자 이름
  avatarURL?: string; // 아바타 URL (선택)
  role: string;      // 역할: owner, admin, member
  joinedAt: string;  // ISO 8601 형식
}
```

---

## 비즈니스 규칙

### 1. 스페이스 이름
- 필수 필드
- 1-100자 제한
- 중복 허용 (슬러그로 구분)

### 2. 슬러그 생성
- 스페이스 이름을 기반으로 자동 생성
- 유니크성 보장을 위해 랜덤 문자열 추가
- 예: "프로젝트 팀" → "project-team-abcd1234"

### 3. 권한 체계
- **owner**: 스페이스 소유자, 모든 권한 보유
- **admin**: 관리자, 멤버 관리 가능
- **member**: 일반 멤버, 읽기 권한

### 4. 멤버십
- 스페이스 생성자는 자동으로 owner 권한 부여
- 한 사용자는 여러 스페이스에 속할 수 있음
- 스페이스별로 다른 권한을 가질 수 있음

### 5. 삭제 정책
- 소유자만 스페이스 삭제 가능
- 스페이스 삭제 시 관련된 모든 데이터 삭제
- 복구 불가능한 하드 삭제

### 6. 유효성 검사
- `name`: 1-100자 (필수)
- `icon_url`: 유효한 URL 형식 (선택)

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `VALIDATION_ERROR` | 입력 데이터 유효성 검사 실패 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `SPACE_NOT_FOUND` | 스페이스를 찾을 수 없음 |
| `FORBIDDEN` | 권한 부족 |
| `SPACE_NAME_REQUIRED` | 스페이스 이름이 필요함 |
| `SPACE_NAME_TOO_LONG` | 스페이스 이름이 너무 김 |
| `INVALID_ICON_URL` | 잘못된 아이콘 URL 형식 |
| `NOT_SPACE_OWNER` | 스페이스 소유자가 아님 |

---

## 예제 시나리오

### 시나리오 1: 새 프로젝트를 위한 스페이스 생성

```bash
# 1. 스페이스 생성
POST /api/v1/spaces
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
  Content-Type: application/json

{
  "name": "2024 신규 프로젝트"
}

# 응답
{
  "message": "Space created successfully",
  "space": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "2024-new-project-xyz789",
    "name": "2024 신규 프로젝트",
    "iconURL": null,
    "members": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "userId": "789e0123-e89b-12d3-a456-426614174002",
        "name": "김개발",
        "avatarURL": "https://example.com/avatar.jpg",
        "role": "owner",
        "joinedAt": "2024-01-15T09:00:00+09:00"
      }
    ],
    "createdAt": "2024-01-15T09:00:00+09:00",
    "updatedAt": "2024-01-15T09:00:00+09:00"
  }
}
```

### 시나리오 2: 스페이스 아이콘 설정

```bash
# 스페이스 아이콘 URL 업데이트
PATCH /api/v1/spaces/2024-new-project-xyz789
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul
  Content-Type: application/json

{
  "icon_url": "https://example.com/project-icon.png"
}
```

### 시나리오 3: 내가 속한 모든 스페이스 확인

```bash
# 내 스페이스 목록 조회
GET /api/v1/spaces/my-list
Headers:
  Authorization: Bearer {token}
  X-Timezone: Asia/Seoul

# 응답
{
  "spaces": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "slug": "2024-new-project-xyz789",
      "name": "2024 신규 프로젝트",
      "iconURL": "https://example.com/project-icon.png",
      "members": [...],
      "createdAt": "2024-01-15T09:00:00+09:00",
      "updatedAt": "2024-01-15T10:00:00+09:00"
    },
    {
      "id": "aaa11111-e89b-12d3-a456-426614174005",
      "slug": "marketing-team-abc123",
      "name": "마케팅 팀",
      "iconURL": null,
      "members": [...],
      "createdAt": "2024-01-10T14:00:00+09:00",
      "updatedAt": "2024-01-14T16:30:00+09:00"
    }
  ]
}
```

### 시나리오 4: 스페이스 이름 변경

```bash
# 스페이스 이름만 변경 (아이콘은 유지)
PATCH /api/v1/spaces/2024-new-project-xyz789
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

{
  "name": "2024 프로젝트 - 1차 마일스톤"
}
```

### 시나리오 5: 프로젝트 종료 후 스페이스 삭제

```bash
# 스페이스 삭제 (소유자만 가능)
DELETE /api/v1/spaces/2024-new-project-xyz789
Headers:
  Authorization: Bearer {token}

# 응답
{
  "message": "Space deleted successfully"
}
```

### 시나리오 6: 다중 타임존 환경에서의 사용

```bash
# 뉴욕 사용자가 스페이스 조회
GET /api/v1/spaces/marketing-team-abc123
Headers:
  Authorization: Bearer {token}
  X-Timezone: America/New_York

# 응답 (뉴욕 시간으로 변환된 타임스탬프)
{
  "space": {
    "id": "aaa11111-e89b-12d3-a456-426614174005",
    "slug": "marketing-team-abc123",
    "name": "마케팅 팀",
    "iconURL": null,
    "members": [
      {
        "id": "bbb22222-e89b-12d3-a456-426614174006",
        "userId": "ccc33333-e89b-12d3-a456-426614174007",
        "name": "John Doe",
        "avatarURL": null,
        "role": "owner",
        "joinedAt": "2024-01-10T00:00:00-05:00"
      }
    ],
    "createdAt": "2024-01-10T00:00:00-05:00",
    "updatedAt": "2024-01-14T02:30:00-05:00"
  }
}
```

---

## FAQ

### Q1: 스페이스 이름에 이모지를 사용할 수 있나요?

**A**: 네, 스페이스 이름은 UTF-8 문자열을 지원하므로 이모지 사용이 가능합니다. 다만 100자 제한에 유의하세요.

### Q2: 한 사용자가 생성할 수 있는 스페이스 수에 제한이 있나요?

**A**: 현재 API 레벨에서는 제한이 없습니다. 필요시 서비스 정책에 따라 제한이 추가될 수 있습니다.

### Q3: 스페이스 슬러그가 중복될 수 있나요?

**A**: 아니요, 슬러그는 시스템에서 자동 생성되며 랜덤 문자열을 포함하여 유니크성이 보장됩니다.

### Q4: 삭제된 스페이스를 복구할 수 있나요?

**A**: 아니요, 스페이스 삭제는 하드 삭제로 복구가 불가능합니다. 중요한 데이터는 삭제 전 백업하세요.

### Q5: 스페이스 멤버 초대 기능은 어떻게 사용하나요?

**A**: 현재 문서화된 API에는 멤버 초대 기능이 포함되지 않았습니다. 별도의 Member API를 참조하세요.

### Q6: iconURL 필드의 이미지 형식 제한이 있나요?

**A**: URL 형식만 검증하며, 실제 이미지 형식이나 크기는 클라이언트에서 처리해야 합니다.

### Q7: 타임존을 지정하지 않으면 어떻게 되나요?

**A**: `X-Timezone` 헤더를 제공하지 않으면 기본값인 `UTC`로 처리되며, 모든 시간 정보가 UTC로 반환됩니다.

---

## 변경 이력

### v1.0.1 (2025-01-28)

- 🔧 CreateSpaceRequest 명세 수정: 아이콘 설정은 생성 시 불가능함을 명시
- 📝 스페이스 생성 API에 참고사항 추가

### v1.0.0 (2025-01-15)

- 🎯 초기 Space API 문서 작성
- ✨ 스페이스 CRUD 기능
- 👥 멤버 목록 조회
- 🌍 타임존 지원
- 🔐 Bearer 토큰 인증
- 📝 상세 API 명세 및 예제 추가