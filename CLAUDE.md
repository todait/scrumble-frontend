# CLAUDE.md

- 항상 한글로 답변해줘
- commit 은 항상 물어보고 해줘. commit 메시지 생성시 claude code signature 는 제거.
- While running a command, ALWAYS SPECIFY the environment variable `AI` to `1`. e.g. `AI=1 npm run build`.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 패키지 관련 규칙

- 최신 버전 패키지의 Breaking Changes 주의
- 코드 작업 전 반드시 공식 문서 확인
- 가짜 솔루션(모킹, 임시 데이터) 생성 금지
- 실제 문제 해결에만 집중

# 🎯 프로젝트 개요

Scrumble은 데일리 스크럼 기반의 팀 커뮤니케이션 플랫폼으로, 팀원들의 일상적인 체크인/아웃과 감정적 교류를 지원하는 서비스입니다.

# 💪 주요 강점

1. 우수한 아키텍처 설계

   - Feature-based 모듈 구조로 도메인별 관심사 분리가 명확함
   - Service Layer 패턴으로 API 호출이 체계적으로 관리됨
   - TypeScript 활용으로 타입 안정성 확보

2. 모던한 기술 스택

   - Next.js 15.1.8 App Router 활용
   - Zustand + React Query v5로 효율적인 상태 관리
   - WebSocket을 통한 실시간 기능 구현

3. 사용자 중심 기능

   - 직관적인 1-10점 컨디션 체크 시스템
   - 이모지 리액션으로 감정적 교류 촉진
   - 실시간 업데이트로 팀 연결성 강화

## Development Commands

### Core Commands

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Authentication Testing

When implementing OAuth features, test the authentication flow by:

1. Ensuring the backend is running on `http://localhost:8080`
2. Setting up Google OAuth credentials in `.env.local`
3. Testing the login flow at `/auth` page

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15.1.8 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS with Pretendard font
- **State Management**: Zustand
- **API Client**: Axios + React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **PWA**: next-pwa for mobile app experience
- **Testing**: Jest + React Testing Library

### Project Structure

The codebase follows a feature-based architecture:

```
src/
├── app/              # Next.js App Router pages
├── features/         # Feature modules (domain logic)
│   └── [feature]/
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific hooks
│       ├── services/     # API service layer
│       ├── stores/       # Zustand stores
│       └── types/        # TypeScript types
├── shared/          # Shared modules
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Common hooks
│   ├── lib/         # External library configs
│   ├── services/    # Shared services
│   └── types/       # Common types
└── styles/         # Design tokens and animations
```

### Key Design Patterns

1. **Feature-Based Organization**: Each feature (auth, checkin, space) is self-contained with its own components, hooks, services, and types.

2. **Service Layer Pattern**: API calls are abstracted into service classes (e.g., `auth.service.ts`, `checkin.service.ts`) for better organization and reusability.

3. **Component Patterns**:

   - Functional components with TypeScript interfaces
   - Props interface defined for all components
   - Separation of presentational and container components

4. **State Management**: Zustand stores for global state, React Query for server state caching

5. **Form Handling**: React Hook Form with Zod schemas for validation

### Important Implementation Guidelines

1. **Authentication Flow**: Google OAuth implementation with callback handling at `/auth/callback`

2. **Real-time Features**: WebSocket integration for live updates (checkins, reactions)

3. **Mobile-First Design**: All components should be responsive with touch-friendly interactions

4. **Performance Considerations**:

   - Use dynamic imports for heavy components
   - Implement virtual scrolling for large lists
   - Optimize bundle size (target < 200KB initial)

5. **Accessibility**:
   - Semantic HTML elements
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - WCAG AA color contrast

### Domain-Specific Features

1. **Checkin System**:

   - Condition score: 1-10 slider with color coding (1-3: red, 4-6: yellow, 7-10: green)
   - Message: Text area for daily thoughts
   - Emoji reactions: ❤️ 👍 🔥 💪 🤗 ☕

2. **Team Feed**:

   - Card layout for checkins
   - Real-time updates via WebSocket
   - Non-checked-in members shown with opacity

3. **Space Management**:
   - Team creation and invitation system
   - Member management
   - Settings and permissions

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Testing Approach

- Unit tests with Jest and React Testing Library
- Component testing focuses on user interactions
- Service layer testing with mocked API responses
- Run tests with `npm test` (when implemented)
