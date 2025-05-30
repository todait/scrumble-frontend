scrumble-frontend/
├── src/
│ ├── app/ # Next.js 14 App Router
│ │ ├── (auth)/ # Route Group - 인증 관련
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── layout.tsx
│ │ ├── (space)/ # Route Group - 스페이스
│ │ │ ├── [spaceId]/
│ │ │ │ ├── page.tsx # 팀 피드
│ │ │ │ ├── checkin/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── settings/
│ │ │ │ └── page.tsx
│ │ │ └── layout.tsx
│ │ ├── layout.tsx # Root layout
│ │ ├── page.tsx # Landing page
│ │ └── globals.css
│ │
│ ├── features/ # 기능별 모듈 (핵심)
│ │ ├── auth/
│ │ │ ├── components/ # 기능별 컴포넌트
│ │ │ │ ├── LoginButton.tsx
│ │ │ │ └── GoogleAuthButton.tsx
│ │ │ ├── hooks/ # 기능별 훅
│ │ │ │ ├── useAuth.ts
│ │ │ │ └── useGoogleLogin.ts
│ │ │ ├── services/ # API 통신
│ │ │ │ └── auth.service.ts
│ │ │ ├── stores/ # 상태 관리
│ │ │ │ └── auth.store.ts
│ │ │ └── types/ # 타입 정의
│ │ │ └── auth.types.ts
│ │ │
│ │ ├── checkin/
│ │ │ ├── components/
│ │ │ │ ├── CheckinCard.tsx
│ │ │ │ ├── CheckinForm.tsx
│ │ │ │ ├── ConditionSlider.tsx
│ │ │ │ └── ReactionPicker.tsx
│ │ │ ├── hooks/
│ │ │ │ ├── useCheckin.ts
│ │ │ │ ├── useReactions.ts
│ │ │ │ └── useWebSocket.ts
│ │ │ ├── services/
│ │ │ │ └── checkin.service.ts
│ │ │ ├── stores/
│ │ │ │ └── checkin.store.ts
│ │ │ └── types/
│ │ │
│ │ └── space/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── services/
│ │ └── types/
│ │
│ ├── shared/ # 공통 모듈
│ │ ├── components/ # 공통 컴포넌트
│ │ │ ├── ui/ # 기본 UI 컴포넌트
│ │ │ │ ├── Button.tsx
│ │ │ │ ├── Card.tsx
│ │ │ │ ├── Input.tsx
│ │ │ │ └── Modal.tsx
│ │ │ ├── layout/ # 레이아웃 컴포넌트
│ │ │ │ ├── Header.tsx
│ │ │ │ ├── Sidebar.tsx
│ │ │ │ └── MobileNav.tsx
│ │ │ └── feedback/ # 피드백 컴포넌트
│ │ │ ├── Loading.tsx
│ │ │ ├── ErrorBoundary.tsx
│ │ │ └── Toast.tsx
│ │ │
│ │ ├── hooks/ # 공통 훅
│ │ │ ├── useMediaQuery.ts
│ │ │ ├── useDebounce.ts
│ │ │ └── useLocalStorage.ts
│ │ │
│ │ ├── lib/ # 외부 라이브러리 설정
│ │ │ ├── axios.ts
│ │ │ ├── react-query.ts
│ │ │ └── websocket.ts
│ │ │
│ │ ├── utils/ # 유틸리티 함수
│ │ │ ├── date.ts
│ │ │ ├── format.ts
│ │ │ └── validation.ts
│ │ │
│ │ └── types/ # 공통 타입
│ │ ├── api.types.ts
│ │ └── global.types.ts
│ │
│ └── styles/ # 스타일 관련
│ ├── tokens/ # 디자인 토큰
│ │ ├── colors.ts
│ │ ├── typography.ts
│ │ └── spacing.ts
│ └── animations/ # 애니메이션
│ └── transitions.ts
│
├── public/ # 정적 파일
│ ├── images/
│ ├── fonts/
│ └── manifest.json # PWA
│
├── tests/ # 테스트
│ ├── unit/
│ ├── integration/
│ └── e2e/
│
├── .cursorrules # Cursor 규칙
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
