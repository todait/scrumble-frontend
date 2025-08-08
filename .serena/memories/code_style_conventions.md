# Scrumble Frontend 코드 스타일 및 규칙

## TypeScript 설정
- **Strict Mode**: 활성화 (`"strict": true`)
- **Target**: ES2017
- **Module**: ESNext
- **Path Aliases**: 
  - `@/*` → `./src/*`
  - `@/shared/*` → `./src/shared/*`
  - `@/features/*` → `./src/features/*`

## 코딩 컨벤션

### 컴포넌트 패턴
- Functional Components 사용
- TypeScript interface로 Props 정의
- Presentational/Container 컴포넌트 분리

```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // ...
}
```

### Feature-based 구조
각 feature는 독립적인 모듈로 구성:
```
feature/
├── components/   # Feature 전용 컴포넌트
├── hooks/        # Feature 전용 hooks
├── services/     # API 서비스 레이어
├── stores/       # Zustand 스토어
└── types/        # TypeScript 타입
```

### Service Layer 패턴
API 호출은 service 클래스로 추상화:
```typescript
// auth.service.ts
class AuthService {
  async login(credentials: LoginDto) {
    // API 호출 로직
  }
}
```

### Form Validation
React Hook Form + Zod 조합 사용:
```typescript
const schema = z.object({
  field: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;
```

## 스타일링
- Tailwind CSS 사용
- clsx/tailwind-merge로 조건부 클래스 처리
- Pretendard 폰트 사용

## 성능 고려사항
- Dynamic imports로 코드 스플리팅
- Virtual scrolling (react-window) 사용
- 초기 번들 크기 < 200KB 목표

## 접근성
- Semantic HTML 사용
- ARIA labels 적용
- 키보드 네비게이션 지원
- WCAG AA 색상 대비

## 프로젝트 특별 규칙
- **한글 답변**: Claude Code 응답은 항상 한글로
- **커밋 확인**: 커밋 전 항상 사용자 확인 필요
- **No Mocking**: 가짜 솔루션이나 임시 데이터 생성 금지
- **공식 문서 확인**: 최신 패키지 사용 시 Breaking Changes 확인 필수