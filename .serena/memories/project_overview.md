# Scrumble Frontend 프로젝트 개요

## 프로젝트 목적
Scrumble은 데일리 스크럼 기반의 팀 커뮤니케이션 플랫폼입니다. 팀원들의 일상적인 체크인/아웃과 감정적 교류를 지원하는 서비스로, 1-10점 컨디션 체크 시스템과 이모지 리액션을 통해 팀의 연결성을 강화합니다.

## 기술 스택
- **Framework**: Next.js 15.1.8 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query v5 (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Real-time**: WebSocket (Centrifuge)
- **UI Components**: Lucide React, React Icons
- **Animations**: Framer Motion
- **PWA**: next-pwa
- **Testing**: Jest + React Testing Library
- **Development**: Turbopack

## 프로젝트 구조
Feature-based 아키텍처를 채택하여 도메인별 관심사를 명확히 분리:

```
src/
├── app/              # Next.js App Router 페이지
├── features/         # 도메인별 기능 모듈
│   ├── auth/        # 인증 (Google OAuth)
│   ├── checkin/     # 체크인 시스템
│   ├── checkout/    # 체크아웃
│   ├── dashboard/   # 대시보드
│   ├── feed/        # 팀 피드
│   ├── notifications/ # 알림
│   ├── settings/    # 설정
│   ├── space/       # 스페이스 관리
│   └── todo/        # Todo 기능
├── shared/          # 공통 모듈
│   ├── components/  # 재사용 UI 컴포넌트
│   ├── hooks/       # 공통 hooks
│   ├── lib/         # 외부 라이브러리 설정
│   ├── services/    # 공통 서비스
│   └── types/       # 공통 타입
├── schemas/         # Validation 스키마
└── styles/          # 디자인 토큰과 애니메이션
```

## 주요 기능
1. **체크인 시스템**: 1-10점 컨디션 점수 (색상 코딩: 1-3 빨강, 4-6 노랑, 7-10 초록)
2. **이모지 리액션**: ❤️ 👍 🔥 💪 🤗 ☕
3. **실시간 업데이트**: WebSocket을 통한 실시간 체크인/리액션 업데이트
4. **스페이스 관리**: 팀 생성, 초대, 멤버 관리
5. **Google OAuth**: 구글 계정으로 간편 로그인

## 환경 변수
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```