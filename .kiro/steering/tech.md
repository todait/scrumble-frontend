# 프론트엔드 기술 스택 & 개발 가이드

## 핵심 기술 스택

- **프레임워크**: Next.js 15.1.8 (App Router)
- **언어**: TypeScript 5.x
- **스타일링**: Tailwind CSS 3.4 + Pretendard 폰트
- **상태 관리**: Zustand 5.0.5
- **API 클라이언트**: Axios 1.9.0 + React Query 5.80.6
- **폼 관리**: React Hook Form 7.56.4 + Zod 3.25.28
- **애니메이션**: Framer Motion 12.12.2
- **아이콘**: Lucide React + React Icons + Remix Icons
- **PWA**: next-pwa 5.6.0
- **테스팅**: Jest 29.7.0 + React Testing Library 16.3.0

## 개발 명령어

```bash
# 개발 환경
npm run dev              # Turbopack으로 개발 서버 시작
npm run build           # 프로덕션 빌드
npm run start           # 프로덕션 서버 실행

# 코드 품질
npm run lint            # ESLint 검사
npm run lint:fix        # ESLint 자동 수정
npm run format          # Prettier 포맷팅
npm run format:check    # Prettier 검사
npm run type-check      # TypeScript 타입 검사

# 테스팅 (설정 필요)
npm test               # 테스트 실행
npm run test:coverage  # 테스트 커버리지
```

## 주요 라이브러리 & 도구

### UI 및 스타일링

- **컴포넌트 시스템**: class-variance-authority로 변형 관리
- **스타일링**: Tailwind CSS + tailwind-merge로 클래스 병합
- **폰트**: Pretendard (한국어 최적화)
- **애니메이션**: Framer Motion으로 부드러운 전환 효과

### 상태 관리 및 데이터

- **전역 상태**: Zustand (인증, 모달, 기능별 상태)
- **서버 상태**: React Query (캐싱, 동기화)
- **폼 상태**: React Hook Form + Zod 스키마 검증
- **로컬 상태**: React useState (단순한 컴포넌트 상태)

### 특수 기능

- **드래그 앤 드롭**: @atlaskit/pragmatic-drag-and-drop
- **이미지 처리**: heic-convert, heic2any (HEIC 지원)
- **날짜 처리**: date-fns 4.1.0
- **이모지**: @emoji-mart/react
- **파일 업로드**: AWS SDK S3 (presigned URL)
- **실시간 통신**: Centrifuge 5.3.5 (WebSocket 클라이언트)

## 개발 환경 설정

```bash
# 필수 요구사항
Node.js 18.17+ (권장: 20.x)

# 환경 변수 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 성능 목표

- **First Contentful Paint**: < 1.8초
- **Time to Interactive**: < 3.9초
- **Cumulative Layout Shift**: < 0.1
- **초기 번들 크기**: < 200KB

## 브라우저 지원

- **모던 브라우저**: Chrome 90+, Firefox 88+, Safari 14+
- **모바일**: iOS Safari 14+, Chrome Mobile 90+
- **PWA 지원**: 모든 주요 브라우저에서 설치 가능

## 개발 도구 설정

### ESLint 설정

- Next.js 권장 설정
- TypeScript 지원
- Import 정렬 및 미사용 import 제거
- Prettier와 통합

### TypeScript 설정

- Strict 모드 활성화
- Path mapping (@/ 별칭)
- Next.js 플러그인 포함

### Tailwind CSS 설정

- 커스텀 색상 팔레트
- Pretendard 폰트 설정
- 반응형 브레이크포인트
- 커스텀 spacing 값

## 코드 품질 기준

- **TypeScript**: 모든 파일에서 타입 안전성 보장
- **ESLint**: 코드 스타일 일관성 유지
- **Prettier**: 자동 코드 포맷팅
- **테스트**: 주요 기능에 대한 단위 테스트 작성
