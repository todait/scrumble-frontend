# Project Instructions

## Overview
- The implementation follows `docs/specs/project-setup/1. project-setup.md`; consult that document for background and requirements that drive the current structure.
- `README.md` captures the product vision, tech stack, and high-level setup. Use it for a quick refresher, then rely on these instructions for day-to-day work.
- The frontend lives under `src/` as a Next.js 15 App Router application written in TypeScript. Feature folders encapsulate UI, application, and domain logic; shared cross-cutting utilities stay in `src/shared`.

## Architecture Guidelines
- 현재 프론트엔드는 페이지 컴포넌트와 커스텀 훅을 축으로 기능을 나눈다. 새로운 기능 역시 `page → hook → UI 컴포넌트` 흐름을 유지하고, 훅에서 서버 통신/실시간 제어를 집중시킨다.
- DDD 계층을 강제하지 않지만, 도메인 로직이 복잡해진다면 훅 내부에서 별도 모듈(서비스/유틸)로 분리해 테스트 가능하도록 만든다.
- 인프라 의존성(REST, WebSocket 등)은 훅 또는 shared 서비스에서 캡슐화하고, UI는 비즈니스 의사결정을 직접 호출하지 않는다.

## Development Workflow
- When adding a feature, start from the feature directory (`src/features/<feature-name>`). Create folders for components, hooks, and services as needed, but route domain rules through the shared domain layer.
- Keep UI components dumb whenever possible. Push state transitions into hooks/services so they can be reused by both cards (`PostCard`) and detail views (`PostDetail`) without duplicating logic.
- Real-time behaviour is orchestrated through Centrifugo (`src/shared/services/centrifugo.service.ts`) and the hooks in `src/shared/hooks`. Extend those primitives instead of opening new socket clients per component.
- Any shared utility that is reused across features (formatters, stores, hooks) belongs in `src/shared`. Avoid feature modules depending on each other directly; rely on the shared layer for cross-feature contracts.
- 커밋 전에는 반드시 `npm run build`를 실행해 타입/린트 오류를 없앤 뒤 진행한다. 빌드에서 드러난 경고·오류는 가능한 한 같이 정리한다.

## Testing Strategy
- 도메인 단위 유틸/서비스가 있다면 순수 함수 수준에서 유닛 테스트를 작성한다.
- 애플리케이션 훅과 저장소는 테스트용 DB를 붙인 통합 테스트로 검증한다. 백엔드에서 제공하는 도구로 DB를 기동한 뒤, 실제 쿼리/트랜잭션을 수행하는 테스트를 우선한다.
- 서드파티만 부득이하게 모킹한다. 가능한 한 실제 어댑터를 연결하거나 로컬/메모리 서비스를 사용한다.
- UI 컴포넌트 테스트는 훅에서 커버하기 어려운 상호작용이 있을 때만 작성하고, 가능하면 통합 테스트에서 플로우 전체를 검증한다.

## Tooling Notes
- Use Node.js >= 18 (20.x recommended). Install dependencies with the workspace package manager (see `README.md`).
- Environment variables belong in `.env.local`; copy from `.env.example` when bootstrapping.
- Run `npm run dev` for the Next.js dev server. Keep the backend and Centrifugo dev services online when working on real-time features.

## References
- Primary spec: `docs/specs/project-setup/1. project-setup.md` (full rationale and acceptance criteria).
- Quickstart & product background: `README.md`.
- Real-time deep dive: `docs/REALTIME_PERFORMANCE_OPTIMIZATION.md` and `docs/websocket` if further context is needed.
