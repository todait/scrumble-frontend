# 🌟 Scrumble

> AI 시대에 잃어가는 인간적 연결을 업무 환경에서 되찾자

**Scrumble**은 팀원 간의 감정적 유대와 상호 지지를 형성하는 daily scrum 기반 팀 커뮤니케이션 플랫폼입니다.

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
- **워크스페이스**: 팀 생성/관리 및 초대 링크 시스템
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

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios + React Query (TanStack Query)
- **Real-time**: WebSocket (native)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **PWA**: next-pwa
- **Testing**: Jest + React Testing Library

### Backend (별도 레포지토리)

- **Framework**: Fiber v2 (Golang)
- **Database**: PostgreSQL + EntGo ORM
- **Cache**: Redis
- **WebSocket**: Fiber Websocket
- **Auth**: goth (Google OAuth)

## 🏗 프로젝트 구조

```
scrumble-frontend/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── features/               # Feature-based 아키텍처
│   ├── auth/              # 인증 관련
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── checkin/           # 체크인 관련
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── workspace/         # 워크스페이스 관련
├── shared/                # 공통 모듈
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── hooks/            # 공통 훅
│   ├── lib/              # 라이브러리 설정
│   ├── types/            # 공통 타입
│   └── utils/            # 유틸리티 함수
├── public/               # 정적 파일
└── docs/                 # 문서
```

## 🚀 시작하기

### 요구사항

- Node.js 18.17 이상
- npm, yarn, pnpm 또는 bun

### 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/your-username/scrumble-frontend.git
cd scrumble-frontend

# 의존성 설치
npm install
# 또는
yarn install
# 또는
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 환경 변수 수정

# 개발 서버 실행
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

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

```bash
# 단위 테스트 실행
npm run test

# 테스트 커버리지 확인
npm run test:coverage

# E2E 테스트 실행 (예정)
npm run test:e2e
```

## 🔧 개발 도구

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 타입 체크
npm run type-check

# 코드 포맷팅
npm run format
```

## 📊 성능 목표

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Cumulative Layout Shift**: < 0.1
- **Bundle size**: < 200KB (initial)

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary**: Blue-500 (#3B82F6)
- **Success**: Green-500 (#10B981)
- **Warning**: Yellow-500 (#F59E0B)
- **Error**: Red-500 (#EF4444)

### 타이포그래피

- **Font Family**: Inter (웹폰트)
- **Base Size**: 16px
- **Scale**: 12px, 14px, 16px, 18px, 20px, 24px, 32px

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
