# Claude Code 프론트엔드 인증 마이그레이션 프롬프트

## 🎯 마이그레이션 목표

Scrumble 프론트엔드의 인증 시스템을 User-centric에서 SpaceMember-centric 아키텍처로 전환합니다.
현재 백엔드에서 유저 기반의 인증 시스템을 User 토큰 인증과 Space 내에서는 Space 토큰 인증으로 마이그레이션 작업을 완료했다.
또한 그에 맞춰서 대부분의 API endpoint 도 변경이 되었다. 대부분의 URL 에서 /spaces/:spaceSlug 제거 등

해당 마이그레이션에서는 UI 구현 없이, 오로지 API 마이그레이션과 인증 시스템 마이그레이션에 초점을 맞춘다.
점진적 마이그레이션이 아닌 서버 다운 후 전환을 바로 진행할 예정이다.
react query 함수는 대부분 거의 그대로 사용할 수 있게, api 의 핵심 부분과 몇 개의 파라미터 변경만을 진행해라.

### 핵심 변경사항

- ✅ 이중 토큰 시스템 구현 (User + SpaceMember)
- ✅ localStorage 기반 토큰 관리
- ✅ JWT에서 컨텍스트 자동 추출 (추가 헤더 불필요)

## 📚 참조 문서

마이그레이션을 시작하기 전에 다음 문서들을 순서대로 읽어주세요:

1. **[AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md](./AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md)**

   - AuthContext의 전체적인 마이그레이션 가이드
   - SpaceMember 상태 관리 방법
   - 단계별 구현 가이드

2. **[frontend-auth-migration-guide.md](./frontend-auth-migration-guide.md)**

   - API 엔드포인트별 토큰 사용 가이드
   - 토큰 타입 및 TTL 정보
   - 구체적인 구현 예시

3. **[refresh-intercept-migration-guide.md](./refresh-intercept-migration-guide.md)**
   - 토큰 갱신 인터셉터 구현
   - 대기열 방식의 토큰 갱신 처리
   - 에러 처리 및 재시도 로직

### API 명세 문서

각 리소스별 API 상세 명세는 다음 문서들을 참조하세요:

1. **[AUTH_API_SPECIFICATION.md](./API_SPEC/AUTH_API_SPECIFICATION.md)**

   - 인증 관련 API 엔드포인트
   - Google OAuth 흐름
   - 토큰 갱신 및 로그아웃

2. **[SPACE_API_SPECIFICATION.md](./API_SPEC/SPACE_API_SPECIFICATION.md)**

   - Space 관리 API
   - SpaceMember 로그인
   - Space 초대 관리

3. **[POST_API_SPECIFICATION.md](./API_SPEC/POST_API_SPECIFICATION.md)**

   - 체크인/체크아웃 포스트 API
   - 포스트 조회 및 필터링
   - 댓글 관리

4. **[TODO_API_SPECIFICATION.md](./API_SPEC/TODO_API_SPECIFICATION.md)**

   - 할일 CRUD 작업
   - 상태 토글 및 정렬

5. **[REACTION_API_SPECIFICATION.md](./API_SPEC/REACTION_API_SPECIFICATION.md)**

   - 이모지 반응 시스템
   - 반응 타겟 타입별 처리

6. **[NOTIFICATION_API_SPECIFICATION.md](./API_SPEC/NOTIFICATION_API_SPECIFICATION.md)**
   - 알림 조회 및 관리
   - 읽음 처리 및 일괄 작업

### 올바른 API 엔드포인트

```typescript
// ✅ 정확한 엔드포인트 (Auth - /api/v1 접두사 없음)
POST /auth/refresh                    // User 토큰 갱신
POST /auth/logout                     // User 로그아웃
POST /auth/spaces/:spaceSlug/login   // Space 로그인
POST /auth/space-member/refresh       // SpaceMember 토큰 갱신
POST /auth/space-member/logout        // SpaceMember 로그아웃

// ✅ 정확한 엔드포인트 (API - /api/v1 접두사 있음)
GET  /api/v1/users/me
GET  /api/v1/space-members/me
// ... 기타 모든 리소스 API
```

### 헤더 사용 규칙

```typescript
// ✅ 올바른 방법
config.headers.Authorization = `Bearer ${token}`;

// ❌ 잘못된 방법 (사용하지 마세요)
config.headers['X-Space-Id'] = spaceId;
config.headers['X-Space-Slug'] = spaceSlug;
```

> 💡 **TIP**: 각 API의 상세 명세는 위의 [API 명세 문서](#api-명세-문서) 섹션을 참조하세요.

## 📋 마이그레이션 체크리스트

### Task 1: 준비 작업

- [x] 현재 코드 백업
- [x] 기존 인증 및 API 코드 분석

### Task 2: 토큰 관리 구현

- [x] `SpaceMemberTokenManager` 클래스 구현 ([AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md](./AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md#spacemembertokenmanager-클래스) 참조)
- [x] localStorage 기반 토큰 저장 구현

### Task 3: API 클라이언트 수정

- [x] Request 인터셉터 수정 ([refresh-intercept-migration-guide.md](./refresh-intercept-migration-guide.md#2단계-인터셉터-수정) 참조)
- [x] Response 인터셉터 토큰 갱신 로직 구현
- [x] 토큰 타입별 갱신 상태 관리 추가

### Task 4: AuthContext 마이그레이션

- [x] AuthContext 인터페이스 확장 ([AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md](./AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md#1단계-authcontext-인터페이스-확장) 참조)
- [x] SpaceMember 상태 관리 훅 구현
- [x] Space 전환 로직 구현

### Task 5. API Spec 변경

- [x] ./API_SPEC/ 문서 참고.
- [x] AUTH_API 변경 및 추가
- [x] SPACE_API 변경 및 추가
- [x] POST_API 변경
- [x] REACTION_API 변경
- [x] TODO_API 변경
- [x] NOTIFICATION_API 변경

### Task 6: 마지막 접속 Space 자동 연결 기능

- [x] Zustand Store 구현

  - lastAccessedSpaceStore 생성
  - 마지막 접속한 Space 목록을 시간순으로 저장 (최대 10개)
  - localStorage에 persist하여 브라우저를 닫아도 유지

- [x] 자동 연결 로직

  - 로그인 후 SpaceMember 상태가 없을 때 자동 실행
  - 마지막 접속 Space에 로그인 시도
  - 실패 시 다음 최근 접속 Space로 순차 시도
  - 모두 실패하면 사용자가 속한 첫 번째 Space로 연결

- [x] 접속 기록 관리
  - Space 전환 시 자동으로 접속 시간 업데이트
  - Space 탈퇴 시 해당 기록 제거
  - 로그아웃 시 선택적으로 기록 초기화 옵션 제공

Task 7: 테스트 전략

- [ ] 단위 테스트

  - SpaceMemberTokenManager 클래스의 모든 메서드 테스트
  - 토큰 저장/조회/삭제 기능 검증
  - 토큰 만료 시간 계산 로직 테스트

- [ ] 통합 테스트

  - API 인터셉터의 토큰 갱신 플로우 테스트
  - User 토큰과 SpaceMember 토큰 독립적 갱신 확인
  - 동시 다발적 API 호출 시 토큰 갱신 대기열 처리 검증

## 🔧 구현 순서

1. **토큰 매니저 구현**

   - [frontend-auth-migration-guide.md](./frontend-auth-migration-guide.md#32-토큰-관리-서비스)의 `TokenService` 참조
   - User/SpaceMember 토큰 분리 관리

2. **API 클라이언트 업데이트**

   - [refresh-intercept-migration-guide.md](./refresh-intercept-migration-guide.md#3단계-refresh-로직-개선) 참조
   - 토큰 타입별 독립적인 갱신 로직

3. **AuthContext 확장**

   - [AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md](./AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md#4-구현-예시-코드) 참조
   - 기존 기능 유지하면서 SpaceMember 기능 추가

4. **컴포넌트 업데이트**

   - HOC 사용 컴포넌트 마이그레이션

5. **API 수정 및 구현**

   - API 수정 및 구현

6. **API 통합 테스트**
   - 각 리소스별 API 명세 문서 참조하여 검증
   - 토큰 타입별 정상 동작 확인

## ⚡ Quick Start

### 1. 현재 브랜치에서 진행

feat/spacemember-migrate

### 2. 마이그레이션 가이드 문서 참조

- AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md 부터 시작

### 3. 단계별로 구현하면서 자주 커밋

- feat: SpaceMemberTokenManager 구현
- feat: API 클라이언트 인터셉터 수정
- feat: AuthContext SpaceMember 상태 추가

## 🐛 트러블슈팅

### 토큰 갱신 실패

- [refresh-intercept-migration-guide.md](./refresh-intercept-migration-guide.md#4단계-에러-처리-개선) 참조

### Space 전환 시 문제

- WebSocket 재연결 필요
- [AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md](./AUTH_CONTEXT_HOC_MIGRATION_GUIDE.md#space-전환-함수) 참조

### 401 에러 처리

- 에러 코드로 토큰 타입 구분 필요
- `USER_TOKEN_EXPIRED` vs `SPACE_MEMBER_TOKEN_EXPIRED`

## 🎉 완료 기준

- [x] 모든 API 호출이 정상 작동
- [x] 토큰 자동 갱신 정상 작동
- [x] Space 전환 기능 정상 작동
- [x] 기존 기능 영향 없음

---

## 📖 API 명세 활용 가이드

마이그레이션 중 API 호출을 구현할 때:

1. **먼저 API 명세 문서 확인**: 각 리소스별 API 명세 문서에서 정확한 엔드포인트, 요청/응답 형식을 확인
2. **토큰 타입 확인**: API 명세에서 해당 엔드포인트가 User 토큰인지 SpaceMember 토큰인지 확인
3. **에러 코드 참조**: API 명세의 에러 코드를 확인하여 적절한 에러 처리 구현
4. **예제 코드 활용**: 각 가이드 문서의 예제 코드를 참고하여 구현

> 🔍 **예시**: 체크인 API를 구현하려면 → [POST_API_SPECIFICATION.md](./API_SPEC/POST_API_SPECIFICATION.md) 확인 → SpaceMember 토큰 필요 → [frontend-auth-migration-guide.md](./frontend-auth-migration-guide.md) 예제 참조
