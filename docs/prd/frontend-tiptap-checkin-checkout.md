# 프런트엔드 체크인/체크아웃 Tiptap 통합 계획

## 배경 및 목표
- 현재 `PostForm`은 `<textarea>` 기반으로 plain text만 제출하며, 백엔드 JSON 필드(`*_text_json`)는 미사용 상태.
- 목표는 Tiptap Editor(App Router 환경)로 체크인/체크아웃 작성·수정을 제공하고, 백엔드가 반환하는 JSON을 그대로 렌더링하여 리치 텍스트 경험을 제공하는 것.
- 기존 문자열 기반 UI는 fallback으로 유지해 레거시 데이터와의 호환성을 보장한다.

## Phase Checklist
- **Phase 0 · 분석 및 정렬 (완료 시 근거 기록)**
  - [ ] 기존 `PostForm` 흐름(이미지 업로드, Enter 처리, CMD+Enter 제출)을 문서화한다.
  - [ ] 피드/디테일/모달 등 체크인/체크아웃을 소비하는 컴포넌트 목록을 정리하고 렌더링 책임을 구분한다.
  - [ ] Tiptap 도입 범위(StarterKit, Mention, Placeholder 등 확장)와 라이선스/번들 사이즈 영향 검토.
  - [ ] 백엔드 API 계약 변경 사항(신규 JSON 필드) 및 롤백 전략을 합의한다.
  - [ ] QA와 리치 텍스트 테스트 시나리오(브라우저, 모바일 뷰)를 정의한다.

- **Phase 1 · 에디터 인프라 설계**
  - [ ] `@tiptap/core`, `@tiptap/react`, 필요한 확장 패키지 목록을 정의하고 의존성 분석.
  - [ ] 디자인 팀과 협의하여 에디터 스타일 가이드(텍스트 크기, 색상, placeholder 등)를 확정한다.
  - [ ] 전역 CSS/Tailwind 설정 변경이 필요한지 판단하고, 스타일 토큰을 정리한다.
  - [ ] 서버/클라이언트 컴포넌트 경계와 Suspense 전략을 결정한다.

- **Phase 2 · 작성 플로우 구현**
  - [ ] `PostForm`을 Tiptap 기반으로 리팩터링하고, 기존 props(`onSubmit`, `onChange`, 이미지 업로드 등)와 호환되도록 한다.
  - [ ] `initialMessage`(문자열)와 백엔드 JSON 응답을 Tiptap document로 변환하는 helper를 작성한다.
  - [ ] plain text fallback 로직을 구현해 JSON이 비어 있거나 파싱 실패 시 textarea UX로 회귀한다.
  - [ ] CMD+Enter 제출, Enter key 동작, focus 유지 등 기존 UX 테스트를 갱신한다.
  - [ ] Jest/RTL 테스트로 onChange JSON payload, 이미지 업로드 연계, shortcut 작동을 검증한다.

- **Phase 3 · 조회/렌더링 업데이트**
  - [ ] 피드 카드, 상세 모달, 히스토리 뷰에서 JSON payload를 Tiptap Renderer 혹은 lightweight viewer로 렌더링.
  - [ ] 문자열 데이터만 존재하는 경우 레거시 텍스트 렌더러를 사용하도록 fallback 작성.
  - [ ] SEO/메타 태그, 공유 미리보기용 plain text 추출 로직을 구현한다.
  - [ ] 다국어/RTL 지원 여부를 확인하고 스타일 조정을 적용한다.
  - [ ] Storybook 시나리오(빈 문서, 일반 텍스트, 다중 paragraph 등)를 추가한다.

- **Phase 4 · API 연동 및 상태 관리**
  - [ ] `shared/lib/api/posts` 요청/응답 타입에 JSON 필드를 추가하고 TypeScript 타입을 확장한다.
  - [ ] React Query/Zustand 등 상태 관리 스토어에서 JSON 데이터를 캐싱·갱신하도록 수정한다.
  - [ ] 기존 mutation/optimistic update 로직이 문자열을 참조하는지 점검하고 JSON을 반영한다.
  - [ ] regression 대비 E2E 테스트(Playwright)를 작성해 작성→피드 확인→수정→삭제 흐름을 검증한다.

- **Phase 5 · 검증, 접근성, 배포 준비**
  - [ ] 접근성 점검(ARIA 속성, 포커스 아웃라인, 스크린리더 텍스트)을 수행한다.
  - [ ] Cross-browser 테스트(Chrome, Safari, Edge, 모바일 WebView)를 체크한다.
  - [ ] Lighthouse/Performance 측정으로 번들 증가 영향 확인 및 코드 분할 여부 결정.
  - [ ] 사용자 가이드/릴리스 노트에 리치 텍스트 작성 안내와 호환 범위를 문서화한다.
  - [ ] 백엔드 준비가 완료되었는지 확인 후 동시 배포를 스케줄링한다.

## 참고 링크
- 작성/수정 폼: `frontend/src/shared/components/ui/PostForm.tsx`
- 체크인/체크아웃 폼 래퍼: `frontend/src/features/checkin/components/forms`, `frontend/src/features/checkout/components/forms`
- API 클라이언트: `frontend/src/shared/lib/api/posts.ts`
- E2E 테스트: `frontend/test-results` 및 Playwright 설정

> 각 체크 항목 완료 시 관련 PR 링크와 스크린샷/캡처를 문서에 추가해 추적한다.
