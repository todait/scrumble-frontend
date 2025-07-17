# 프로젝트 구조 & 아키텍처

## 전체 아키텍처

Next.js 15 App Router를 기반으로 한 기능별 모듈 아키텍처, RESTful 라우팅 규칙을 따릅니다.

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router (RESTful 구조)
│   ├── [spaceSlug]/       # 동적 스페이스 라우트
│   │   ├── activity/      # 활동 피드
│   │   ├── feed/          # 메인 팀 피드
│   │   ├── posts/         # 포스트 관리
│   │   │   ├── checkins/  # 체크인 포스트
│   │   │   └── checkouts/ # 체크아웃 포스트
│   │   ├── reports/       # 분석/리포트
│   │   └── settings/      # 스페이스 설정
│   ├── auth/              # 인증 페이지
│   ├── spaces/            # 스페이스 관리 (복수형 RESTful)
│   └── api/               # API 라우트
├── features/              # 기능별 모듈
│   ├── auth/              # 인증 기능
│   ├── checkin/           # 체크인 시스템
│   ├── checkout/          # 체크아웃 시스템
│   ├── feed/              # 팀 피드 기능
│   ├── settings/          # 설정 관리
│   ├── space/             # 스페이스 관리
│   └── todo/              # 할일 시스템
└── shared/                # 공유 유틸리티 및 컴포넌트
    ├── components/        # 재사용 가능한 UI 컴포넌트
    ├── contexts/          # React Context
    ├── hooks/             # 커스텀 React 훅
    ├── lib/               # 외부 라이브러리 설정
    ├── services/          # API 및 외부 서비스
    ├── stores/            # Zustand 상태 스토어
    ├── types/             # TypeScript 타입 정의
    └── utils/             # 유틸리티 함수
```

## 기능 모듈 구조

각 기능은 일관된 내부 구조를 따릅니다:

```
features/[기능명]/
├── components/            # 기능별 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   └── ui/               # UI 컴포넌트
├── hooks/                # 기능별 훅
├── pages/                # 페이지 컴포넌트
├── stores/               # 기능별 상태 관리
├── types/                # 기능별 타입 정의
└── utils/                # 기능별 유틸리티
```

## 라우팅 규칙

- **RESTful 패턴**: 복수형 리소스명 사용 (`/spaces`, `/space` 아님)
- **의미있는 액션**: `/new`, `/invite`, `/settings`
- **일관된 구조**: `/resources/[id]/[action]`
- **동적 라우트**: 동적 세그먼트에 `[param]` 사용

### 현재 라우트 구조

```
/auth                    # 로그인 페이지
/auth/callback          # OAuth 콜백 처리

/spaces/new             # 새 스페이스 생성
/spaces/welcome         # 로그인 후 환영 페이지

/[spaceSlug]            # 스페이스 대시보드 (팀 피드)
/[spaceSlug]/feed       # 팀 피드
/[spaceSlug]/activity   # 활동 피드
/[spaceSlug]/posts/checkins/new  # 체크인 작성
/[spaceSlug]/settings   # 스페이스 설정
```

## 컴포넌트 아키텍처

- **합성 컴포넌트**: 복잡한 UI를 작고 집중된 컴포넌트로 분해
- **커스텀 훅**: 로직을 재사용 가능한 훅으로 추출
- **타입 안전성**: 적절한 인터페이스로 완전한 TypeScript 커버리지
- **스타일링**: class-variance-authority를 사용한 Tailwind CSS 변형

## 상태 관리 패턴

- **Zustand**: 복잡한 상태 (인증, 모달, 기능별 상태)
- **React Query**: 서버 상태 및 캐싱
- **React Hook Form**: 폼 상태 관리
- **로컬 상태**: 단순한 컴포넌트 상태는 useState

## Import 규칙

- **절대 경로**: src 디렉토리에 `@/` 접두사 사용
- **기능 Import**: 기능 모듈에 `@/features/[기능]` 사용
- **공유 Import**: 공유 유틸리티에 `@/shared/[모듈]` 사용
- **Index 내보내기**: 깔끔한 import를 위해 index.ts 파일 사용

### Import 예시

```typescript
// 공유 컴포넌트
import { Button } from '@/shared/components/ui';

// 기능별 컴포넌트
import { AuthPage } from '@/features/auth/pages';

// 공유 훅
import { useAuth } from '@/shared/hooks/auth/useAuth';

// 유틸리티
import { cn } from '@/shared/utils';
```

## 파일 명명 규칙

- **컴포넌트**: PascalCase (예: `AuthPage.tsx`)
- **훅**: camelCase + `use` 접두사 (예: `useAuth.ts`)
- **유틸리티**: camelCase (예: `dateUtils.ts`)
- **타입**: camelCase + `.types.ts` 접미사
- **페이지**: 페이지 컴포넌트는 PascalCase + `Page` 접미사

## 코드 구성 원칙

### 컴포넌트 구성

```typescript
// 1. Import 구문 (외부 라이브러리 먼저, 내부 모듈 나중)
import React from 'react';
import { Button } from '@/shared/components/ui';

// 2. 타입 정의
interface ComponentProps {
  title: string;
}

// 3. 메인 컴포넌트
const Component: React.FC<ComponentProps> = ({ title }) => {
  // 훅 호출
  // 상태 정의
  // 이벤트 핸들러
  // 렌더링
};

// 4. 내보내기
export default Component;
```

### 훅 구성

```typescript
// 커스텀 훅은 use로 시작
export const useFeature = () => {
  // 상태 및 로직
  // 반환값은 객체 형태로 구조화
  return {
    data,
    isLoading,
    error,
    actions: {
      create,
      update,
      delete
    }
  };
};
```

## 성능 최적화 패턴

- **코드 분할**: 기능별 동적 import
- **메모이제이션**: React.memo, useMemo, useCallback 적절히 사용
- **번들 최적화**: Next.js의 자동 최적화 활용
- **이미지 최적화**: Next.js Image 컴포넌트 사용
