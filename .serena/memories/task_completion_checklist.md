# 작업 완료 체크리스트

## 코드 작성 후 필수 실행 명령어

### 1. 타입 체크
```bash
npm run type-check
```
TypeScript 컴파일 오류가 없는지 확인

### 2. 린트 검사
```bash
npm run lint
```
ESLint 규칙 위반 사항 확인 및 수정

### 3. 포맷팅
```bash
npm run format
```
Prettier로 코드 포맷팅 자동 적용

### 4. 테스트 실행 (구현된 경우)
```bash
npm test
```
관련 테스트가 모두 통과하는지 확인

## 체크 포인트

### 코드 품질
- [ ] TypeScript 타입 정의 완료
- [ ] Props interface 정의
- [ ] 불필요한 import 제거
- [ ] console.log 제거

### 기능 검증
- [ ] 개발 서버에서 기능 동작 확인
- [ ] 에러 케이스 처리
- [ ] 로딩/에러 상태 UI 구현

### 성능
- [ ] 불필요한 리렌더링 방지
- [ ] 큰 컴포넌트는 dynamic import 고려
- [ ] 이미지 최적화 (next/image 사용)

### 접근성
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 호환성 고려
- [ ] 적절한 ARIA 속성 추가

### 커밋 전 최종 확인
- [ ] 모든 린트 에러 해결
- [ ] 타입 체크 통과
- [ ] 관련 파일만 스테이징
- [ ] 커밋 메시지 컨벤션 준수 (feat/fix/docs/style/refactor/test/chore)
- [ ] 사용자에게 커밋 확인 요청

## 백엔드 연동 시
- [ ] API endpoint 확인
- [ ] 에러 응답 처리
- [ ] 로딩 상태 구현
- [ ] WebSocket 이벤트 처리 (필요시)