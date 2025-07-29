# Auth API 명세서

## 개요

Auth API는 사용자 인증과 관련된 기능을 제공하는 RESTful API입니다. Google OAuth 인증, JWT 토큰 관리, 사용자 정보 조회 등을 지원합니다.

## 인증

일부 API는 Bearer 토큰 인증이 필요합니다.

```
Authorization: Bearer {access_token}
```

## 기본 URL

```
{API_BASE_URL}/api/v1
```

---

## API 엔드포인트

### 1. Google OAuth 콜백 (GET)

**엔드포인트**: `GET /auth/google/callback`

**설명**: Google OAuth 인증 콜백을 처리하고 JWT 토큰을 생성합니다.

**헤더**: 없음 (OAuth 프로바이더가 자동으로 처리)

**쿼리 파라미터**: OAuth 프로바이더가 자동으로 전달

**응답**:

- `307 Temporary Redirect`: 성공 시 프론트엔드로 리다이렉트
  - 성공: `{FRONTEND_URL}/auth/callback?access_token={token}&refresh_token={token}&user_id={id}&user_email={email}&user_name={name}`
  - 실패: `{FRONTEND_URL}/auth/callback?error=auth_failed` 또는 `error=server_error`

**참고**: 
- 실제 운영 환경에서는 URL 파라미터로 토큰을 전달하는 것은 보안상 권장하지 않습니다
- 프로덕션에서는 secure cookie나 세션을 사용해야 합니다

---

### 2. 토큰 갱신 (POST)

**엔드포인트**: `POST /auth/refresh`

**설명**: Refresh 토큰을 사용하여 새로운 Access 토큰을 발급받습니다.

**헤더**: 없음

**요청 본문**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 본문
- `401 Unauthorized`: 유효하지 않은 refresh 토큰

---

### 3. 로그아웃 (POST)

**엔드포인트**: `POST /auth/logout`

**설명**: 사용자를 로그아웃 처리합니다 (클라이언트는 토큰을 삭제해야 함).

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**요청 본문**: 없음

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Successfully logged out"
}
```

---

### 4. 현재 사용자 정보 조회 (GET)

**엔드포인트**: `GET /api/v1/users/me`

**설명**: 현재 인증된 사용자의 정보를 조회합니다.

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `200 OK`: 성공

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar_url": "https://example.com/avatar.jpg",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 응답**:

- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 사용자를 찾을 수 없음

---

### 5. 현재 사용자 정보와 최신 스페이스 조회 (GET)

**엔드포인트**: `GET /api/v1/users/me/latest-space`

**설명**: 현재 인증된 사용자의 정보와 가장 최근에 가입한 스페이스 정보를 함께 조회합니다. 스페이스 멤버 ID도 포함하여 반환합니다.

**헤더**:

- `Authorization` (string, required): Bearer 토큰

**응답**:

- `200 OK`: 성공

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar_url": "https://example.com/avatar.jpg",
  "space_slug": "my-team",
  "space_name": "우리 팀",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 응답**:

- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 사용자를 찾을 수 없거나 가입한 스페이스가 없음
- `500 Internal Server Error`: 서버 오류

---

### 6. 개발용 토큰 생성 (POST) - DEV ONLY

**엔드포인트**: `POST /auth/dev-token`

**설명**: 개발/테스트 목적으로 이메일과 스페이스 slug를 사용하여 사용자 토큰과 SpaceMember 토큰을 동시에 생성합니다.

**주의**: 이 API는 `ENVIRONMENT` 환경 변수가 설정되지 않았거나 "development"로 설정된 경우에만 사용 가능합니다.

**헤더**: 없음

**요청 본문**:

```json
{
  "email": "dev@example.com",
  "space_slug": "my-team"
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "dev@example.com",
    "name": "개발자",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "user_tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "space_member": {
    "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
    "space_slug": "my-team",
    "role": "member",
    "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 본문
- `500 Internal Server Error`: 서버 오류

---

### 7. 스페이스 로그인 (POST)

**엔드포인트**: `POST /auth/spaces/:spaceSlug/login`

**설명**: 특정 스페이스에 로그인하여 SpaceMember 전용 JWT 토큰을 생성합니다. 일반 사용자 토큰과 별도로 관리되며, 스페이스별 권한 관리를 위해 사용됩니다.

**헤더**:

- `Authorization` (string, required): Bearer 토큰 (일반 사용자 토큰)

**경로 파라미터**:

- `spaceSlug` (string, required): 스페이스 식별자

**요청 본문**: 없음

**응답**:

- `200 OK`: 성공

```json
{
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "space_slug": "my-team",
  "role": "member",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**에러 응답**:

- `401 Unauthorized`: 인증 실패
- `404 Not Found`: 스페이스를 찾을 수 없거나 스페이스 멤버가 아님

---

### 8. SpaceMember 토큰 갱신 (POST)

**엔드포인트**: `POST /auth/space-member/refresh`

**설명**: SpaceMember refresh 토큰을 사용하여 새로운 SpaceMember access 토큰을 발급받습니다.

**헤더**: 없음

**요청 본문**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답**:

- `200 OK`: 성공

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 응답**:

- `400 Bad Request`: 잘못된 요청 본문
- `401 Unauthorized`: 유효하지 않은 refresh 토큰

---

### 9. 스페이스 로그아웃 (POST)

**엔드포인트**: `POST /auth/space-member/logout`

**설명**: 특정 스페이스에서 로그아웃합니다 (클라이언트는 토큰을 삭제해야 함).

**헤더**:

- `Authorization` (string, required): Bearer 토큰 (SpaceMember 토큰)
- `X-Space-Slug` (string, required): 스페이스 식별자

**요청 본문**: 없음

**응답**:

- `200 OK`: 성공

```json
{
  "message": "Successfully logged out from space"
}
```

**에러 응답**:

- `401 Unauthorized`: 인증 실패
- `400 Bad Request`: 스페이스 식별자 누락

---

### 10. 현재 스페이스 멤버 정보 조회 (GET)

**엔드포인트**: `GET /api/v1/space-members/me`

**설명**: 현재 인증된 SpaceMember의 정보와 스페이스 상세 정보를 조회합니다.

**헤더**:

- `Authorization` (string, required): Bearer 토큰 (SpaceMember 토큰)
- `X-Space-Slug` (string, required): 스페이스 식별자

**응답**:

- `200 OK`: 성공

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar_url": "https://example.com/avatar.jpg",
  "space_slug": "my-team",
  "space_name": "우리 팀",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**에러 응답**:

- `401 Unauthorized`: 인증 실패 - SpaceMember 토큰이 없거나 유효하지 않음
- `404 Not Found`: SpaceMember를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 데이터 모델

### RefreshTokenRequest

```typescript
interface RefreshTokenRequest {
  refresh_token: string;
}
```

### TokenPairDTO

```typescript
interface TokenPairDTO {
  access_token: string;
  refresh_token: string;
}
```

### UserDTO

```typescript
interface UserDTO {
  id: string; // UUID
  email: string;
  name: string;
  avatar_url?: string;
  centrifugo_token?: string; // Centrifugo WebSocket 연결용 토큰
}
```

### SpaceMemberDTO

```typescript
interface SpaceMemberDTO {
  id: string; // 사용자 UUID
  space_member_id: string; // 스페이스 멤버 UUID
  email: string;
  name: string; // 스페이스 멤버 이름
  avatar_url?: string;
  space_slug?: string;
  space_name?: string;
  centrifugo_token?: string; // Centrifugo WebSocket 연결용 토큰
}
```

### DevTokenRequest

```typescript
interface DevTokenRequest {
  email: string;
  space_slug: string;
}
```

### DevTokenResponse

```typescript
interface DevTokenResponse {
  user: UserDTO;
  user_tokens: TokenPairDTO;
  space_member?: SpaceMemberLoginResponse;
}
```

### LoginResponse

```typescript
interface LoginResponse {
  user: UserDTO;
  tokens: TokenPairDTO;
}
```

### SpaceMemberLoginResponse

```typescript
interface SpaceMemberLoginResponse {
  space_member_id: string; // SpaceMember UUID
  space_slug: string;
  role: string; // "owner" | "admin" | "member" | "viewer"
  centrifugo_token?: string; // Centrifugo WebSocket 연결용 토큰
  tokens: TokenPairDTO;
}
```

---

## 인증 흐름

### 1. Google OAuth 로그인 흐름

```
1. 클라이언트 → Google OAuth 로그인 페이지로 리다이렉트
2. 사용자가 Google 계정으로 로그인
3. Google → 백엔드 콜백 URL로 리다이렉트 (/auth/google/callback)
4. 백엔드에서 사용자 정보 처리 및 JWT 토큰 생성
5. 백엔드 → 프론트엔드로 토큰과 함께 리다이렉트
6. 프론트엔드에서 토큰 저장 및 인증 완료
```

### 2. 토큰 갱신 흐름

```
1. Access 토큰 만료 감지
2. Refresh 토큰으로 /auth/refresh 호출
3. 새로운 Access/Refresh 토큰 쌍 수신
4. 토큰 업데이트 및 재요청
```

### 3. SpaceMember 인증 흐름

```
1. 일반 사용자 토큰으로 인증된 상태에서 /auth/spaces/{spaceSlug}/login 호출
2. 백엔드에서 사용자의 스페이스 멤버십 확인
3. SpaceMember 전용 JWT 토큰 생성 및 반환
4. 이후 스페이스 관련 API 호출 시 SpaceMember 토큰 사용
5. SpaceMember 토큰 만료 시 /auth/space-member/refresh로 갱신
```

---

## 보안 고려사항

### JWT 토큰

- Access 토큰 만료 시간: 15분 (사용자 토큰), 15분 (SpaceMember 토큰)
- Refresh 토큰 만료 시간: 7일
- Refresh 토큰은 안전하게 저장해야 함
- 토큰은 HTTPS를 통해서만 전송되어야 함

### OAuth 콜백

- 현재는 URL 파라미터로 토큰을 전달하지만, 프로덕션에서는 다음 방법 권장:
  - Secure HTTP-only 쿠키
  - 서버 세션
  - 임시 토큰 교환 방식 (단기간 유효한 일회용 코드를 URL로 전달하고, 이를 실제 토큰과 교환)

### Centrifugo 토큰

- WebSocket 연결을 위한 별도 토큰
- 사용자별, 스페이스별로 격리된 채널 접근 제어
- 선택적 기능 (Centrifugo가 활성화된 경우에만 생성)

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `VALIDATION_ERROR` | 입력 데이터 유효성 검사 실패 |
| `UNAUTHORIZED` | 인증 실패 또는 토큰 만료 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `USER_NOT_FOUND` | 사용자를 찾을 수 없음 |
| `NO_SPACES_JOINED` | 가입한 스페이스가 없음 |
| `INVALID_REFRESH_TOKEN` | 유효하지 않은 Refresh 토큰 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 예제 시나리오

### 시나리오 1: 신규 사용자 로그인

```bash
# 1. Google OAuth로 로그인 (브라우저에서 진행)
# 사용자가 Google 로그인 버튼 클릭
# → Google OAuth 페이지로 리다이렉트
# → 로그인 후 백엔드 콜백으로 리다이렉트
# → 프론트엔드로 토큰과 함께 리다이렉트

# 2. 받은 토큰으로 사용자 정보 조회
GET /users/me
Headers:
  Authorization: Bearer {access_token}

# 응답
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "newuser@example.com",
  "name": "신규 사용자",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "centrifugo_token": null
}
```

### 시나리오 2: 기존 사용자 로그인 및 스페이스 정보 조회

```bash
# 1. Google OAuth로 로그인 완료 후

# 2. 사용자 정보와 최신 스페이스 조회
GET /api/v1/users/me/latest-space
Headers:
  Authorization: Bearer {access_token}

# 응답 (스페이스가 있는 경우)
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "space_slug": "my-team",
  "space_name": "우리 팀",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 응답 (스페이스가 없는 경우)
404 Not Found
{
  "error": {
    "code": "NO_SPACES_JOINED",
    "message": "User has not joined any spaces"
  }
}
```

### 시나리오 3: 토큰 갱신

```bash
# Access 토큰이 만료되었을 때
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 응답
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 시나리오 4: 개발 환경에서 빠른 로그인

```bash
# 개발 환경에서만 사용 가능 - 사용자 토큰과 SpaceMember 토큰 동시 생성
POST /auth/dev-token
Content-Type: application/json

{
  "email": "dev@example.com",
  "space_slug": "my-team"
}

# 응답
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "dev@example.com",
    "name": "개발자",
    "avatar_url": ""
  },
  "user_tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "space_member": {
    "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
    "space_slug": "my-team",
    "role": "member",
    "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 시나리오 5: SpaceMember 로그인 및 토큰 갱신

```bash
# 1. 일반 사용자 토큰으로 특정 스페이스에 로그인
POST /auth/spaces/my-team/login
Headers:
  Authorization: Bearer {user_access_token}

# 응답
{
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "space_slug": "my-team",
  "role": "member",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 2. SpaceMember 토큰으로 스페이스 관련 API 호출
GET /api/v1/spaces/my-team/posts
Headers:
  Authorization: Bearer {space_member_access_token}
  X-Space-Slug: my-team

# 3. SpaceMember 토큰 갱신
POST /auth/space-member/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 4. 스페이스에서 로그아웃
POST /auth/space-member/logout
Headers:
  Authorization: Bearer {space_member_access_token}
  X-Space-Slug: my-team
```

### 시나리오 6: SpaceMember 정보 조회

```bash
# SpaceMember 토큰으로 현재 SpaceMember 정보 조회
GET /api/v1/space-members/me
Headers:
  Authorization: Bearer {space_member_access_token}
  X-Space-Slug: my-team

# 응답
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "space_member_id": "789e0123-e89b-12d3-a456-426614174002",
  "email": "user@example.com",
  "name": "홍길동",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "space_slug": "my-team",
  "space_name": "우리 팀",
  "centrifugo_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## FAQ

### Q1: Google OAuth 외에 다른 로그인 방법은 없나요?

**A**: 현재는 Google OAuth만 지원합니다. 개발 환경에서는 `/auth/dev-token` API를 사용할 수 있습니다.

### Q2: Access 토큰과 Refresh 토큰의 차이는 무엇인가요?

**A**: 
- Access 토큰: API 요청 시 사용하는 단기 토큰 (15분)
- Refresh 토큰: Access 토큰을 갱신할 때 사용하는 장기 토큰 (7일)

### Q3: Centrifugo 토큰은 무엇인가요?

**A**: WebSocket을 통한 실시간 통신을 위한 별도의 인증 토큰입니다. 사용자별, 스페이스별로 채널 접근을 제어합니다.

### Q4: 스페이스가 없는 사용자는 어떻게 처리되나요?

**A**: `/users/me` API는 정상적으로 사용자 정보를 반환하지만, `/users/me/latest-space` API는 404 에러를 반환합니다.

### Q5: space_member_id와 user id의 차이는 무엇인가요?

**A**: 
- `id` (user ID): 전체 시스템에서 사용자를 식별하는 고유 ID
- `space_member_id`: 특정 스페이스 내에서 멤버를 식별하는 고유 ID

### Q6: 사용자 토큰과 SpaceMember 토큰의 차이는 무엇인가요?

**A**: 
- **사용자 토큰**: Google OAuth로 로그인 시 발급되는 전체 시스템용 토큰. 사용자 정보 조회, 스페이스 목록 조회 등에 사용
- **SpaceMember 토큰**: 특정 스페이스에 로그인 시 발급되는 스페이스 전용 토큰. 해당 스페이스의 포스트, 댓글, 할일 등 스페이스 관련 API에 사용

### Q7: 왜 스페이스별로 별도의 토큰을 사용하나요?

**A**: 
- **보안 강화**: 스페이스별로 독립적인 권한 관리
- **세션 관리**: 여러 스페이스에 동시 로그인 가능
- **권한 분리**: 스페이스 A의 토큰으로 스페이스 B에 접근 불가

---

## 변경 이력

### v1.3.0 (2025-01-27)

- ✨ **SpaceMember 전용 API 추가**: GET `/api/v1/space-members/me` - 현재 SpaceMember 정보 조회
- 🔧 **개발용 토큰 API 개선**: `/auth/dev-token`에 `space_slug` 필드 추가로 SpaceMember 토큰 동시 생성 지원
- 📝 **DevTokenResponse 추가**: 사용자 토큰과 SpaceMember 토큰을 함께 반환하는 응답 DTO

### v1.2.0 (2025-01-27)

- 🚀 **SpaceMember 인증 추가**: 스페이스별 독립적인 인증 토큰 관리
  - POST `/auth/spaces/:spaceSlug/login`: 특정 스페이스 로그인
  - POST `/auth/space-member/refresh`: SpaceMember 토큰 갱신
  - POST `/auth/space-member/logout`: 스페이스 로그아웃
- 📝 **SpaceMemberLoginResponse 추가**: SpaceMember 로그인 응답 DTO
- 🔧 **API 경로 수정**: `/users/me/with-space` → `/users/me/latest-space`

### v1.1.0 (2025-01-17)

- ✨ **GetMeWithLatestSpace API 개선**: spaceMemberId 필드 추가로 스페이스 멤버 식별 가능
- 📝 **SpaceMemberDTO 추가**: 사용자 정보와 스페이스 멤버 정보를 함께 반환하는 DTO
- 🔧 **에러 처리 개선**: 스페이스가 없는 경우 명확한 에러 메시지 반환

### v1.0.0 (초기 버전)

- 🎯 Google OAuth 인증
- 🔑 JWT 기반 토큰 관리
- 👤 사용자 정보 조회
- 🚀 개발용 토큰 생성