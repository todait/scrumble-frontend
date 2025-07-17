# 알림 시스템 설계 문서

## 개요

기존 activity 페이지를 notification 페이지로 변경하여 사용자가 다양한 유형의 알림을 카테고리별로 필터링하고 확인할 수 있는 통합 알림 시스템을 구현합니다. 이 시스템은 Feed, Activity, Notice 세 가지 카테고리로 알림을 분류하고, 각 카테고리 내에서 다양한 알림 유형을 지원합니다.

## 아키텍처

### 전체 구조

```
src/app/[spaceSlug]/notifications/
├── page.tsx                    # 알림 페이지 라우트
└── loading.tsx                 # 로딩 상태 페이지

src/features/notifications/
├── components/
│   ├── NotificationItemList.tsx    # 알림 목록 컨테이너
│   ├── items/                      # 알림 아이템 컴포넌트들
│   │   ├── CheckInPostItem.tsx     # 체크인 포스트 알림
│   │   ├── CheckOutPostItem.tsx    # 체크아웃 포스트 알림
│   │   ├── CommentItem.tsx         # 댓글 알림
│   │   ├── EmojiReactionItem.tsx   # 이모지 반응 알림
│   │   ├── MentionItem.tsx         # 멘션 알림
│   │   ├── SpaceNoticeItem.tsx     # 스페이스 공지 알림
│   │   ├── RoleUpdateItem.tsx      # 역할 업데이트 알림
│   │   ├── SpaceInfoUpdateItem.tsx # 스페이스 정보 업데이트 알림
│   │   ├── MemberJoinLeaveItem.tsx # 멤버 가입/탈퇴 알림
│   │   └── index.ts                # 알림 아이템 내보내기
│   ├── ui/
│   │   ├── NotificationHeader.tsx  # 알림 헤더 (제목 + 필터)
│   │   ├── CategoryFilter.tsx      # 카테고리 필터 버튼들
│   │   ├── EmptyState.tsx          # 빈 상태 컴포넌트
│   │   └── NotificationSkeleton.tsx # 로딩 스켈레톤
│   └── index.ts
├── hooks/
│   ├── useNotifications.ts         # 알림 데이터 관리 훅
│   ├── useNotificationFilter.ts    # 필터링 로직 훅
│   └── index.ts
├── pages/
│   ├── NotificationPage.tsx        # 메인 알림 페이지 컴포넌트
│   └── index.ts
├── stores/
│   └── useNotificationStore.ts     # 알림 상태 관리
├── types/
│   └── notification.types.ts       # 알림 관련 타입 정의
└── utils/
    ├── notificationHelpers.ts      # 알림 유틸리티 함수
    └── index.ts
```

### 라우팅 변경

- 기존: `/[spaceSlug]/activity` → 새로운: `/[spaceSlug]/notifications`
- 기존 activity 경로는 notifications로 리디렉션 처리

## 레이아웃 설계

### FeedPage 레이아웃 참고

NotificationPage는 기존 FeedPage의 레이아웃 구조를 참고하여 일관된 사용자 경험을 제공합니다.

#### 참고할 FeedPage 레이아웃 요소

1. **전체 컨테이너 구조**

   ```typescript
   // FeedPage와 동일한 중앙 정렬 컨테이너 구조
   <div className="flex h-screen justify-center overflow-hidden">
     <div className="flex w-full transition-all duration-300 pt-4 md:w-[672px] md:pt-6">
   ```

2. **헤더 영역 레이아웃**

   ```typescript
   // 필터 버튼과 설정 아이콘의 배치 구조 참고
   <div className="mb-4 flex flex-shrink-0 items-center justify-between px-2 md:mb-[22px] md:justify-center md:px-0">
     <div className="w-10 md:hidden"></div> {/* 모바일 여백 */}
     <CategoryFilter /> {/* FeedPage의 FilterDropdown 위치 */}
     <SettingsIcon /> {/* 모바일 설정 아이콘 */}
   </div>
   ```

3. **메인 콘텐츠 영역**

   ```typescript
   // FeedPage의 피드 컨테이너 구조 참고
   <div className="flex flex-1 flex-col overflow-hidden">
     <div className="rounded-t-xl shadow-[...] md:rounded-t-2xl">
       <NotificationHeader /> {/* FeedHeader 위치 */}
     </div>
     <div className="scrollbar-hide overflow-y-auto pb-20 md:pb-0 rounded-b-xl shadow-[...]">
       <NotificationItemList /> {/* PostCard 목록 위치 */}
     </div>
   </div>
   ```

4. **반응형 디자인 패턴**

   - 모바일: `px-2`, 데스크톱: `px-4`
   - 모바일 하단 여백: `pb-20`, 데스크톱: `pb-0`
   - 그림자 효과: `shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)]`

5. **스크롤 처리**
   - `scrollbar-hide` 클래스로 스크롤바 숨김
   - `overflow-y-auto`로 세로 스크롤 활성화
   - 스크롤 컨테이너 ref를 통한 프로그래밍적 스크롤 제어

#### NotificationPage 전용 수정사항

1. **헤더 구조 변경**

   - FeedPage의 날짜 선택기 제거
   - 카테고리 필터 버튼 추가 (전체, 활동, 공지)
   - "알림" 제목 표시

2. **콘텐츠 영역 조정**

   - PostCard 대신 NotificationItem 컴포넌트 사용
   - 알림 유형별 다른 레이아웃 적용
   - 빈 상태 처리 (알림이 없는 경우)

3. **상호작용 패턴**
   - PostDetail 모달 없음 (알림 클릭 시 해당 페이지로 이동)
   - 플로팅 버튼 없음 (체크아웃 버튼 등 제거)

## 컴포넌트 및 인터페이스

### 1. 핵심 타입 정의

```typescript
// notification.types.ts
export enum NotificationCategory {
  FEED = 'Feed',
  ACTIVITY = 'Activity',
  NOTICE = 'Notice',
}

export enum NotificationType {
  CHECK_IN_POST = 1,
  CHECK_OUT_POST = 2,
  COMMENT = 3,
  EMOJI_REACTION = 4,
  MENTION = 5,
  SPACE_NOTICE = 6,
  ROLE_UPDATE = 7,
  SPACE_INFO_UPDATE = 8,
  MEMBER_JOIN_LEAVE = 9,
}

export interface BaseNotification {
  id: string;
  category: NotificationCategory;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  spaceId: string;
}

export interface CheckInPostNotification extends BaseNotification {
  type: NotificationType.CHECK_IN_POST;
  user: User;
  post: {
    id: string;
    content: string;
    conditionScore: number;
  };
}

export interface CommentNotification extends BaseNotification {
  type: NotificationType.COMMENT;
  commenter: User;
  comment: {
    id: string;
    content: string;
  };
  targetPost: {
    id: string;
    content: string;
  };
}

export interface EmojiReactionNotification extends BaseNotification {
  type: NotificationType.EMOJI_REACTION;
  reactor: User;
  emoji: string;
  targetPost: {
    id: string;
    content: string;
  };
}

export interface MentionNotification extends BaseNotification {
  type: NotificationType.MENTION;
  mentioner: User;
  content: string;
  context: {
    type: 'post' | 'comment';
    id: string;
  };
}

export interface SpaceNoticeNotification extends BaseNotification {
  type: NotificationType.SPACE_NOTICE;
  title: string;
  content: string;
  author: User;
}

export type Notification =
  | CheckInPostNotification
  | CommentNotification
  | EmojiReactionNotification
  | MentionNotification
  | SpaceNoticeNotification;

export interface NotificationFilter {
  category: NotificationCategory | 'ALL';
  isRead?: boolean;
}
```

### 2. 메인 페이지 컴포넌트

```typescript
// NotificationPage.tsx
interface NotificationPageProps {
  spaceSlug: string;
}

export function NotificationPage({ spaceSlug }: NotificationPageProps) {
  // 알림 데이터 및 필터링 로직
  // 헤더 + 알림 목록 렌더링
}
```

### 3. 알림 헤더 컴포넌트

```typescript
// NotificationHeader.tsx
interface NotificationHeaderProps {
  currentFilter: NotificationCategory | 'ALL';
  onFilterChange: (filter: NotificationCategory | 'ALL') => void;
}

export function NotificationHeader({ currentFilter, onFilterChange }: NotificationHeaderProps) {
  // 제목 + 카테고리 필터 버튼들
}
```

### 4. 알림 아이템 컴포넌트들

각 알림 유형별로 전용 컴포넌트를 구현:

```typescript
// CheckInPostItem.tsx
interface CheckInPostItemProps {
  notification: CheckInPostNotification;
  onClick?: () => void;
}

// CommentItem.tsx
interface CommentItemProps {
  notification: CommentNotification;
  onClick?: () => void;
}

// EmojiReactionItem.tsx
interface EmojiReactionItemProps {
  notification: EmojiReactionNotification;
  onClick?: () => void;
}
```

## 데이터 모델

### 알림 데이터 구조

백엔드에서 제공하는 알림 데이터는 다음과 같은 구조를 가집니다:

```json
{
  "id": "notification-uuid",
  "category": "Activity",
  "type": 4,
  "createdAt": "2024-01-15T10:30:00Z",
  "isRead": false,
  "spaceId": "space-uuid",
  "data": {
    // 알림 유형별 특화 데이터
    "reactor": { "id": "user-uuid", "name": "홍길동", "avatar": "..." },
    "emoji": "❤️",
    "targetPost": { "id": "post-uuid", "content": "오늘 컨디션이 좋네요!" }
  }
}
```

### 카테고리별 알림 매핑

- **Feed 카테고리**

  - CheckInPost (1): 체크인 포스트 알림
  - CheckOutPost (2): 체크아웃 포스트 알림

- **Activity 카테고리**

  - Comment (3): 댓글 알림
  - EmojiReaction (4): 이모지 반응 알림
  - Mention (5): 멘션 알림

- **Notice 카테고리**
  - SpaceNotice (6): 스페이스 공지사항
  - RoleUpdate (7): 역할 업데이트
  - SpaceInfoUpdate (8): 스페이스 정보 업데이트
  - MemberJoinLeave (9): 멤버 가입/탈퇴

## 에러 처리

### 에러 시나리오

1. **네트워크 에러**: API 호출 실패 시 재시도 로직
2. **데이터 파싱 에러**: 잘못된 알림 데이터 형식 처리
3. **권한 에러**: 스페이스 접근 권한 없음
4. **빈 데이터**: 알림이 없는 경우 적절한 빈 상태 표시

### 에러 처리 전략

```typescript
// useNotifications.ts
export function useNotifications(spaceSlug: string) {
  return useQuery({
    queryKey: ['notifications', spaceSlug],
    queryFn: () => fetchNotifications(spaceSlug),
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: error => {
      console.error('알림 로드 실패:', error);
      // 토스트 알림 표시
    },
  });
}
```

## 테스팅 전략

### 단위 테스트

1. **컴포넌트 테스트**

   - 각 알림 아이템 컴포넌트의 렌더링 테스트
   - 필터링 로직 테스트
   - 사용자 상호작용 테스트

2. **훅 테스트**

   - useNotifications 훅의 데이터 페칭 테스트
   - useNotificationFilter 훅의 필터링 로직 테스트

3. **유틸리티 테스트**
   - 알림 데이터 변환 함수 테스트
   - 시간 포맷팅 함수 테스트

### 통합 테스트

1. **페이지 레벨 테스트**

   - 전체 알림 페이지의 렌더링 및 상호작용 테스트
   - 필터 변경 시 알림 목록 업데이트 테스트

2. **API 통합 테스트**
   - 실제 API와의 연동 테스트
   - 에러 상황 처리 테스트

### 테스트 도구

- **Jest**: 단위 테스트 프레임워크
- **React Testing Library**: 컴포넌트 테스트
- **MSW (Mock Service Worker)**: API 모킹

## 성능 최적화

### 렌더링 최적화

1. **가상화**: 대량의 알림 목록을 위한 가상 스크롤링
2. **메모이제이션**: React.memo를 사용한 불필요한 리렌더링 방지
3. **지연 로딩**: 이미지 및 무거운 컴포넌트의 지연 로딩

### 데이터 최적화

1. **페이지네이션**: 알림 목록의 페이지별 로딩
2. **캐싱**: React Query를 통한 효율적인 데이터 캐싱
3. **프리페칭**: 다음 페이지 데이터의 사전 로딩

### 번들 최적화

1. **코드 분할**: 알림 기능의 동적 import
2. **트리 쉐이킹**: 사용하지 않는 코드 제거
3. **압축**: 이미지 및 에셋 최적화

## 접근성 고려사항

### 키보드 네비게이션

- 필터 버튼들 간의 키보드 네비게이션 지원
- 알림 아이템들의 키보드 접근성
- 포커스 관리 및 시각적 표시

### 스크린 리더 지원

- 적절한 ARIA 라벨 및 역할 설정
- 알림 내용의 의미적 구조화
- 상태 변경 시 스크린 리더 알림

### 색상 및 대비

- 충분한 색상 대비 확보
- 색상에만 의존하지 않는 정보 전달
- 다크 모드 지원 (향후 확장)

## 모바일 최적화

### 터치 인터페이스

- 적절한 터치 타겟 크기 (최소 44px)
- 스와이프 제스처 지원 (향후 확장)
- 터치 피드백 제공

### 반응형 디자인

- 모바일 우선 설계
- 다양한 화면 크기 대응
- 가로/세로 모드 지원

### 성능 최적화

- 모바일 네트워크 환경 고려
- 이미지 최적화 및 지연 로딩
- 배터리 효율성 고려
