# 라우팅 구조 가이드

## 개요

Scrumble 프론트엔드는 RESTful 원칙을 따르는 일관된 라우팅 구조를 사용합니다. 이 문서는 새로운 라우트를 추가하거나 기존 라우트를 수정할 때 따라야 할 가이드라인을 제공합니다.

## RESTful 라우팅 원칙

### 1. 복수형 리소스명 사용

**✅ 올바른 예:**

```
/spaces          # 스페이스 목록
/spaces/new      # 새 스페이스 생성
/spaces/[id]     # 특정 스페이스
```

**❌ 잘못된 예:**

```
/space           # 단수형 사용하지 말것
/space/create    # create 대신 new 사용
```

### 2. 의미있는 액션명 사용

- **생성**: `/new` (create ❌)
- **초대**: `/invite` (invite-team ❌)
- **설정**: `/settings`
- **편집**: `/edit`

### 3. 일관된 중첩 패턴

```
/[resource]/[id]/[action]
/spaces/[spaceSlug]/invite
/spaces/[spaceSlug]/settings
```

## 현재 라우팅 구조

### 인증 관련

```
/auth                    # 로그인 페이지
├── page.tsx            # 인증 메인 페이지
└── callback/           # OAuth 콜백 처리
    └── page.tsx        # 콜백 핸들러
```

### 스페이스 관련

```
/spaces                 # 스페이스 관련 라우트
├── new/               # 스페이스 생성
│   └── page.tsx       # 생성 폼 페이지
├── welcome/           # 환영 페이지
│   └── page.tsx       # 로그인 후 환영 화면
└── [spaceSlug]/         # 동적 스페이스 라우트
    ├── page.tsx       # 스페이스 대시보드 (팀 피드)
    ├── invite/        # 팀원 초대
    │   └── page.tsx   # 초대 폼 페이지
    ├── checkin/       # 체크인 관련
    │   └── page.tsx   # 체크인 작성 페이지
    └── settings/      # 스페이스 설정
        └── page.tsx   # 설정 페이지
```

## 새 라우트 추가 가이드라인

### 1. 파일 구조 생성

```bash
# 새로운 리소스 추가 예시: 프로젝트 관리
mkdir -p src/app/projects/{new,[projectId]/{tasks,settings}}

# 생성된 구조:
# /projects/new              - 프로젝트 생성
# /projects/[projectId]      - 프로젝트 상세
# /projects/[projectId]/tasks - 작업 관리
# /projects/[projectId]/settings - 프로젝트 설정
```

### 2. 페이지 컴포넌트 생성

각 라우트에는 `page.tsx` 파일이 필요합니다:

```typescript
// src/app/projects/new/page.tsx
import { ProjectCreatePage } from '@/features/project';

export default function CreateProjectRoute() {
  return <ProjectCreatePage />;
}
```

```typescript
// src/app/projects/[projectId]/page.tsx
import { ProjectDetailPage } from '@/features/project';

interface ProjectRouteProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectRoute({ params }: ProjectRouteProps) {
  const { projectId } = React.use(params);

  return <ProjectDetailPage projectId={projectId} />;
}
```

### 3. 타입 안전한 라우팅

동적 라우트 파라미터에 대한 타입을 정의합니다:

```typescript
// src/shared/types/routing.ts
export interface SpaceRouteParams {
  spaceSlug: string;
}

export interface ProjectRouteParams {
  projectId: string;
}

// 라우트 파라미터 검증
export const validatespaceSlug = (spaceSlug: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(spaceSlug);
};
```

## 네비게이션 패턴

### 1. router.push 사용법

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// ✅ 올바른 사용
router.push('/spaces/new');
router.push(`/spaces/${spaceSlug}/invite`);
router.push('/spaces/welcome');

// ❌ 잘못된 사용 (구 버전)
router.push('/space/create');
router.push(`/space/${spaceSlug}/invite-team`);
```

### 2. 링크 컴포넌트

```typescript
import Link from 'next/link';

// ✅ 정적 링크
<Link href="/spaces/new">
  새 스페이스 만들기
</Link>

// ✅ 동적 링크
<Link href={`/spaces/${spaceSlug}/settings`}>
  스페이스 설정
</Link>
```

### 3. 조건부 리다이렉트

```typescript
// 인증 상태에 따른 리다이렉트
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/auth');
  } else if (!isLoading && isAuthenticated) {
    router.push('/spaces/welcome');
  }
}, [isAuthenticated, isLoading, router]);
```

## URL 파라미터 처리

### 1. 동적 라우트 파라미터

```typescript
// app/spaces/[spaceSlug]/page.tsx
interface SpacePageProps {
  params: Promise<{
    spaceSlug: string;
  }>;
}

export default function SpacePage({ params }: SpacePageProps) {
  const { spaceSlug } = React.use(params);

  // spaceSlug 검증
  if (!validatespaceSlug(spaceSlug)) {
    notFound();
  }

  return <SpaceDetailPage spaceSlug={spaceSlug} />;
}
```

### 2. 쿼리 파라미터

```typescript
// 성공/에러 상태 전달
const searchParams = useSearchParams();
const authStatus = searchParams.get('auth');

if (authStatus === 'success') {
  // 성공 처리
} else if (authStatus === 'error') {
  // 에러 처리
}
```

## 메타데이터 설정

각 페이지에는 적절한 메타데이터를 설정합니다:

```typescript
// app/spaces/[spaceSlug]/page.tsx
import { Metadata } from 'next';

interface Props {
  params: Promise<{ spaceSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { spaceSlug } = await params;

  return {
    title: `스페이스 대시보드 - Scrumble`,
    description: '팀원들의 일일 체크인을 확인하고 소통하세요',
  };
}
```

## 라우트 보호 (Route Protection)

### 1. 인증이 필요한 라우트

```typescript
// shared/components/layout/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 2. 스페이스 멤버십 확인

```typescript
// 스페이스 접근 권한 확인
export function useSpaceAccess(spaceSlug: string) {
  const { user } = useAuth();

  const { data: hasAccess, isLoading } = useQuery({
    queryKey: ['space-access', spaceSlug, user?.id],
    queryFn: () => spaceService.checkAccess(spaceSlug),
    enabled: !!user?.id && !!spaceSlug,
  });

  return { hasAccess, isLoading };
}
```

## 에러 처리

### 1. 404 페이지

```typescript
// app/spaces/[spaceSlug]/not-found.tsx
export default function SpaceNotFound() {
  return (
    <div className="text-center">
      <h1>스페이스를 찾을 수 없습니다</h1>
      <Link href="/spaces/welcome">
        돌아가기
      </Link>
    </div>
  );
}
```

### 2. 에러 바운더리

```typescript
// app/spaces/[spaceSlug]/error.tsx
'use client';

export default function SpaceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center">
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

## 성능 최적화

### 1. 코드 분할

```typescript
// 무거운 컴포넌트 lazy 로딩
const HeavyChart = dynamic(
  () => import('@/features/analytics/components/Chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
```

### 2. 프리로딩

```typescript
// 중요한 라우트 프리로딩
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleHover = () => {
  router.prefetch('/spaces/new');
};
```

## 검색 엔진 최적화 (SEO)

### 1. 동적 사이트맵

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://scrumble.io',
      lastModified: new Date(),
    },
    {
      url: 'https://scrumble.io/auth',
      lastModified: new Date(),
    },
    // 동적 라우트는 제외 (로그인 필요)
  ];
}
```

### 2. 로봇 설정

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: ['/auth'],
      disallow: ['/spaces/'],
    },
    sitemap: 'https://scrumble.io/sitemap.xml',
  };
}
```

## 마이그레이션 체크리스트

기존 라우트를 새로운 RESTful 구조로 마이그레이션할 때:

- [ ] 디렉토리 구조 변경
- [ ] 파일 경로 업데이트
- [ ] `router.push()` 호출 모두 업데이트
- [ ] `Link` 컴포넌트 href 업데이트
- [ ] 리다이렉트 로직 업데이트
- [ ] 북마크/외부 링크 고려한 리다이렉트 설정
- [ ] 테스트 케이스 업데이트

## 자주 하는 실수

### ❌ 단수형 리소스명

```typescript
router.push('/space/create'); // 잘못됨
```

### ❌ 불일치한 액션명

```typescript
router.push('/spaces/create'); // create 사용
router.push('/spaces/invite-team'); // kebab-case 사용
```

### ❌ 중첩되지 않은 관련 액션

```typescript
router.push('/invite-team/space-id'); // 잘못된 구조
```

### ✅ 올바른 사용

```typescript
router.push('/spaces/new'); // 복수형 + new
router.push('/spaces/[id]/invite'); // 일관된 패턴
router.push('/spaces/[id]/settings'); // 명확한 의미
```

## 참고 자료

- [Next.js App Router 공식 문서](https://nextjs.org/docs/app)
- [RESTful API 설계 원칙](https://restfulapi.net/)
- [URL 설계 Best Practices](https://restfulapi.net/resource-naming/)
