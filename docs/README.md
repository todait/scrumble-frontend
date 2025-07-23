# 📚 Scrumble 프론트엔드 문서

> Scrumble 프론트엔드 프로젝트의 기술 문서 모음입니다.
>
> 최종 업데이트: 2025-07-21

## 🎯 프로젝트 개요

Scrumble은 데일리 스크럼 기반의 팀 커뮤니케이션 플랫폼으로, 팀원들의 일상적인 체크인과 감정적 교류를 지원하는 서비스입니다.

### 기술 스택
- **Framework**: Next.js 15.1.8 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Real-time**: WebSocket
- **Auth**: Google OAuth

---

## 📖 문서 목록

### 🚀 프로덕션 준비
- **[PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)** - 프로덕션 배포를 위한 체크리스트와 준비사항
- **[SECURITY_AND_PERFORMANCE_GUIDE.md](./SECURITY_AND_PERFORMANCE_GUIDE.md)** - 보안 취약점 분석 및 성능 최적화 가이드
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Vercel 배포 프로세스 및 CI/CD 설정

### 🏗️ 아키텍처 및 개발
- **[NEXTJS_GUIDE.md](./NEXTJS_GUIDE.md)** - Next.js 프로젝트 구조 및 개발 가이드
- **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - App Router 라우팅 가이드
- **[FOLDER_TREE.md](./FOLDER_TREE.md)** - 프로젝트 폴더 구조

### 🔄 실시간 통신
- **[WEBSOCKET_SUBSCRIPTION_GUIDE.md](./WEBSOCKET_SUBSCRIPTION_GUIDE.md)** - WebSocket 구독 가이드
- **[WEBSOCKET_BATCH_SUBSCRIBE_GUIDE.md](./WEBSOCKET_BATCH_SUBSCRIBE_GUIDE.md)** - 배치 구독 최적화
- **[WEBSOCKET_IMPROVEMENTS.md](./WEBSOCKET_IMPROVEMENTS.md)** - WebSocket 개선사항
- **[REALTIME_PERFORMANCE_OPTIMIZATION.md](./REALTIME_PERFORMANCE_OPTIMIZATION.md)** - 실시간 성능 최적화

### 📡 API 명세
- **[SPACE_API_SPECIFICATION.md](./SPACE_API_SPECIFICATION.md)** - 스페이스 API 명세
- **[POST_API_SPECIFICATION.md](./POST_API_SPECIFICATION.md)** - 게시물 API 명세
- **[REACTIONS_API_GUIDE.md](./REACTIONS_API_GUIDE.md)** - 리액션 API 가이드
- **[TODO_API_SPECIFICATION.md](./TODO_API_SPECIFICATION.md)** - 할일 API 명세

### 🔔 알림 시스템
- **[notification-system/](./notification-system/)** - 알림 시스템 설계 및 구현
  - [design.md](./notification-system/design.md) - 시스템 설계
  - [requirements.md](./notification-system/requirements.md) - 요구사항
  - [tasks.md](./notification-system/tasks.md) - 구현 태스크
  - [NOTIFICATION_API_SPECIFICATION.md](./notification-system/NOTIFICATION_API_SPECIFICATION.md) - API 명세

### 🛠️ 기능별 문서
- **[PRD_v1.md](./PRD_v1.md)** - 제품 요구사항 문서
- **[TIMEZONE_SETUP.md](./TIMEZONE_SETUP.md)** - 타임존 설정 가이드
- **[TEXTAREA_LINK.md](./TEXTAREA_LINK.md)** - 텍스트 영역 링크 처리
- **[TODO/](./TODO/)** - 할일 기능 구현 가이드

### 🔄 마이그레이션
- **[CENTRIFUGO_MIGRATION_FRONTEND.md](./CENTRIFUGO_MIGRATION_FRONTEND.md)** - Centrifugo 마이그레이션
- **[CENTRIFUGO_EVENT_SPEC.md](./CENTRIFUGO_EVENT_SPEC.md)** - Centrifugo 이벤트 명세
- **[NOTIFICATION_TYPE_CONVERSION.md](./NOTIFICATION_TYPE_CONVERSION.md)** - 알림 타입 변환

### 📝 개선사항
- **[개선_v1.md](./개선_v1.md)** - 개선사항 목록
- **[TODO_INTEGRATION_PROMPT.md](./TODO_INTEGRATION_PROMPT.md)** - 할일 통합 프롬프트

---

## 🚦 우선순위별 액션 아이템

### 🔴 긴급 (1-2일 내)
1. **보안 취약점 수정**
   - JWT 토큰 저장 방식 변경 (localStorage → httpOnly 쿠키)
   - 환경변수 보안 강화
   - WebSocket 토큰 전달 방식 개선

2. **성능 최적화**
   - 이미지 최적화 활성화
   - 메모리 누수 해결

### 🟡 중요 (1주일 내)
1. **모니터링 설정**
   - Sentry 에러 트래킹 구현
   - Vercel Analytics 설정

2. **테스트 강화**
   - E2E 테스트 작성
   - 스모크 테스트 자동화

### 🟢 개선 (2주일 내)
1. **번들 최적화**
   - 동적 임포트 확대
   - Tree-shaking 개선

2. **접근성 개선**
   - ARIA 레이블 추가
   - 키보드 네비게이션 지원

---

## 📞 문의

기술 관련 문의사항은 아래 채널로 연락주세요:
- Slack: #scrumble-frontend
- GitHub Issues: [프로젝트 저장소]

---

## 🔄 문서 업데이트 정책

1. 주요 기능 변경 시 관련 문서 즉시 업데이트
2. 보안/성능 이슈 발견 시 가이드 문서 업데이트
3. 매주 금요일 문서 리뷰 및 정리

---

*이 문서는 지속적으로 업데이트됩니다.*