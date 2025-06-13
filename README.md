# 🌟 Scrumble Frontend

> AI 시대에 잃어가는 인간적 연결을 업무 환경에서 되찾자

**Scrumble**은 팀원 간의 감정적 유대와 상호 지지를 형성하는 daily scrum 기반 팀 커뮤니케이션 플랫폼입니다.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 제품 비전

단순한 업무 공유를 넘어 팀원들이 서로의 컨디션을 이해하고, 따뜻한 소통을 통해 팀의 정서적 건강도를 향상시키는 것이 목표입니다.

### 핵심 가치 (Core Values)

- **🤝 Human Connection**: 사람 중심의 따뜻한 소통
- **✨ Seamless Experience**: 부담 없이 매일 사용할 수 있는 직관적 UX
- **💚 Team Wellness**: 팀의 정서적 건강도 향상

## 🚀 주요 기능

### MVP (Phase 1)

- **체크인 시스템**: 컨디션 점수(1-10) + 오늘의 한마디
- **팀 피드**: 카드형 레이아웃으로 팀원들의 일일 체크인 확인
- **이모지 리액션**: 6개 기본 이모지(❤️ 👍 🔥 💪 🤗 ☕)로 즉각적인 소통
- **스페이스**: 팀 생성/관리 및 초대 링크 시스템
- **실시간 동기화**: WebSocket 기반 실시간 업데이트
- **모바일 최적화**: PWA 지원으로 앱처럼 사용 가능

### Phase 2 (예정)

- **투두 시스템**: 일일 목표 설정 및 관리
- **실시간 댓글**: 체크인에 대한 텍스트 댓글
- **체크아웃**: 하루 마무리 회고

### Phase 3 (예정)

- **AI 인사이트**: 팀 무드 분석 및 개선 제안
- **통계 대시보드**: 개인/팀 무드 트렌드 분석

## 🛠 기술 스택

### Frontend Stack

- **Framework**: Next.js 15.1.8 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + Pretendard Font
- **State Management**: Zustand 5.0.5
- **API Client**: Axios 1.9.0 + React Query 5.77.0
- **Real-time**: WebSocket (native) - _planned_
- **Animations**: Framer Motion 12.12.2
- **Forms**: React Hook Form 7.56.4 + Zod 3.25.28
- **Icons**: Lucide React + React Icons
- **PWA**: next-pwa 5.6.0 - _configured_
- **Testing**: Jest 29.7.0 + React Testing Library 16.3.0 - _setup required_

### Backend (별도 레포지토리)

- **Framework**: Fiber v2 (Golang)
- **Database**: PostgreSQL + EntGo ORM
- **Cache**: Redis
- **WebSocket**: Fiber Websocket
- **Auth**: goth (Google OAuth)

## 🏗 프로젝트 구조

```
scrumble-frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router (RESTful 구조)
│   │   ├── auth/              # 인증 관련 페이지
│   │   │   ├── callback/      # OAuth 콜백 처리
│   │   │   └── page.tsx       # 로그인 페이지
│   │   ├── spaces/            # 스페이스 페이지 (복수형 RESTful)
│   │   │   ├── new/           # 스페이스 생성
│   │   │   ├── welcome/       # 환영 페이지
│   │   │   └── [spaceSlug]/     # 동적 스페이스 라우트
│   │   │       ├── invite/    # 팀원 초대
│   │   │       ├── checkin/   # 체크인 작성
│   │   │       └── settings/  # 스페이스 설정
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 랜딩 페이지
│   │   └── globals.css        # 전역 스타일
│   ├── features/              # Feature-based 모듈
│   │   ├── auth/             # 인증 기능
│   │   │   ├── components/   # 인증 컴포넌트
│   │   │   └── AuthPage.tsx  # 메인 인증 페이지
│   │   ├── checkin/          # 체크인 기능 (예정)
│   │   └── space/             # 스페이스 기능 (예정)
│   └── shared/               # 공통 모듈
│       ├── components/       # 재사용 컴포넌트
│       │   └── feedback/     # 토스트, 로딩 등
│       ├── hooks/           # 공통 훅
│       ├── lib/             # 외부 라이브러리 설정
│       ├── stores/          # Zustand 스토어
│       └── types/           # 공통 타입 정의
├── public/                   # 정적 파일
├── docs/                     # 프로젝트 문서
└── CLAUDE.md                # Claude Code 가이드
```

## 🚀 시작하기

### 요구사항

- Node.js 18.17 이상 (권장: 20.x)
- npm, yarn, pnpm 또는 bun
- Git

### 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/your-username/scrumble-frontend.git
cd scrumble-frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집하여 환경 변수 설정

# 개발 서버 실행 (Turbopack 사용)
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 백엔드 연동

백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.

- [Scrumble Backend Repository](https://github.com/your-username/scrumble-backend)

### 환경 변수

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📱 PWA 설치

Scrumble은 PWA로 개발되어 모바일 기기에서 앱처럼 사용할 수 있습니다.

### iOS (Safari)

1. 사이트 접속 후 하단 공유 버튼 탭
2. "홈 화면에 추가" 선택

### Android (Chrome)

1. 사이트 접속 후 브라우저 메뉴 버튼 탭
2. "홈 화면에 추가" 선택

## 🧪 테스트

> ⚠️ **Note**: 테스트 환경 설정이 필요합니다. Jest와 React Testing Library는 설치되어 있으나 설정 파일이 없습니다.

```bash
# 단위 테스트 실행 (설정 필요)
npm run test

# 테스트 커버리지 확인 (설정 필요)
npm run test:coverage

# E2E 테스트 실행 (미구현)
npm run test:e2e
```

## 🛣 라우팅 구조

Scrumble은 RESTful 원칙을 따르는 라우팅 구조를 사용합니다:

### 라우팅 규칙

1. **복수형 리소스명**: `/spaces` (단수형 `/space` ❌)
2. **의미있는 액션명**: `/new` (생성), `/invite` (초대)
3. **일관된 패턴**: `/spaces/[id]/[action]`

### 현재 라우트 구조

```
/auth                    # 로그인 페이지
/auth/callback          # OAuth 콜백 처리

/spaces/new             # 새 스페이스 생성
/spaces/welcome         # 로그인 후 환영 페이지

/spaces/[id]            # 스페이스 대시보드 (팀 피드)
/spaces/[id]/invite     # 팀원 초대
/spaces/[id]/checkin    # 체크인 작성
/spaces/[id]/settings   # 스페이스 설정
```

### 라우팅 가이드라인

- **생성 페이지**: `/resources/new` 패턴 사용
- **특정 리소스 액션**: `/resources/[id]/action` 패턴 사용
- **의미 명확성**: URL만 봐도 기능을 알 수 있도록 구성

## 🔧 개발 도구

```bash
# 개발 서버 실행 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 타입 체크 (스크립트 추가 필요)
npm run type-check

# 코드 포맷팅 (Prettier 설정 필요)
npm run format
```

### 현재 알려진 이슈

- ESLint 경고/에러 7개 존재 (사용하지 않는 변수 등)
- Jest 설정 파일 없음
- Prettier 설정 파일 없음
- 환경 변수 예시 파일(.env.example) 업데이트 필요

## 📊 성능 목표

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Cumulative Layout Shift**: < 0.1
- **Bundle size**: < 200KB (initial)

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary**: Orange (#FF7800)
- **Primary Dark**: #FF5829
- **Background**: #FBFBFB
- **Text Primary**: #181818
- **Success**: Green-500 (#10B981)
- **Warning**: Yellow-500 (#F59E0B)
- **Error**: Red-500 (#EF4444)

### 타이포그래피

- **Font Family**: Pretendard (한국어 최적화)
- **Base Size**: 16px
- **Scale**: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 56px

## 🤝 기여하기

1. 이 레포지토리를 Fork합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 관련 파일 수정
```

## 🚧 개발 현황

### ✅ 완료된 기능

- Google OAuth 인증 플로우
- 로그인/로그아웃 기능
- 토스트 알림 시스템
- 스페이스 생성 페이지 UI
- 반응형 로그인 페이지
- 토큰 관리 시스템
- Pretendard 폰트 적용

### 🔄 진행 중

- 스페이스 관리 기능
- 팀 초대 시스템
- 백엔드 API 연동

### 📋 예정된 기능

- 체크인 시스템
- 팀 피드
- 실시간 WebSocket 연동
- PWA 설정
- 테스트 환경 구축
- 이모지 리액션
- 사용자 대시보드

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **이메일**: support@scrumble.io
- **GitHub Issues**: [이슈 생성](https://github.com/your-username/scrumble-frontend/issues)

---

<div align="center">
  <p>❤️ Made with love for better team communication</p>
  <p>🚀 Built with Next.js, TypeScript, and Tailwind CSS</p>
</div>
