# Scrumble 도메인 기능 상세

## 인증 (Auth)
- **Google OAuth**: 구글 계정 로그인
- **JWT 토큰**: 24시간 만료
- **Callback 처리**: `/auth/callback` 페이지에서 처리

## 체크인 시스템 (Checkin)
### 컨디션 점수
- 1-10점 슬라이더
- 색상 코딩:
  - 1-3점: 빨강 (나쁨)
  - 4-6점: 노랑 (보통)
  - 7-10점: 초록 (좋음)

### 메시지
- 일일 생각이나 상태를 텍스트로 작성
- 최대 글자수 제한 있음

### 이모지 리액션
사용 가능한 리액션:
- ❤️ (사랑)
- 👍 (좋아요)
- 🔥 (화이팅)
- 💪 (힘내)
- 🤗 (포옹)
- ☕ (커피)

## 팀 피드 (Feed)
- 카드 레이아웃으로 체크인 표시
- 실시간 WebSocket 업데이트
- 체크인하지 않은 멤버는 투명도 처리
- Virtual scrolling으로 성능 최적화

## 스페이스 관리 (Space)
- 팀 스페이스 생성
- 초대 링크 생성 및 공유
- 멤버 역할 관리 (Admin/Member)
- 스페이스 설정 (이름, 설명, 이미지)
- 스페이스 삭제 (Admin만)

## 알림 (Notifications)
- 새 체크인 알림
- 리액션 알림
- 멤버 참여/탈퇴 알림
- WebSocket 실시간 전달

## 대시보드 (Dashboard)
- 팀 통계 표시
- 체크인 현황
- 최근 활동 요약

## Todo 기능
- 개인/팀 Todo 관리
- 드래그 앤 드롭 (Atlaskit Pragmatic DnD)
- 상태 관리 (Pending/In Progress/Done)

## 실시간 통신 (WebSocket)
### 이벤트 타입
- `checkin.created`: 새 체크인
- `reaction.added`: 리액션 추가
- `reaction.removed`: 리액션 제거
- `member.joined`: 멤버 참여
- `member.left`: 멤버 탈퇴

### Centrifuge 라이브러리
- 자동 재연결
- 구독 관리
- 메시지 큐잉