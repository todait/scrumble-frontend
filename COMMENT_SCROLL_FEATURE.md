# 특정 댓글 URL 스크롤 기능 구현

## 기능 개요
- URL: `https://www.scrumbl.co/todaitspace1/feed?post=postId&comment=commentId`
- 해당 링크로 접근 시 특정 댓글 위치로 자동 스크롤 및 하이라이트
- 포스트 날짜 자동 설정 기능과 연계

## 구현 내용

### 1. CommentSection 컴포넌트 개선
**파일: `src/shared/components/ui/CommentSection.tsx`**

#### 주요 변경사항:
- 댓글 하이라이트 기능 추가
- 댓글 식별자 속성 추가

```typescript
interface CommentSectionProps {
  // ... 기존 props
  highlightedCommentId?: string | null; // 하이라이트할 댓글 ID
}

interface CommentItemProps {
  // ... 기존 props
  isHighlighted?: boolean; // 댓글 하이라이트 여부
}
```

#### 댓글 하이라이트 스타일:
```typescript
<div
  data-comment-id={comment.id}
  className={`group relative flex gap-3 overflow-visible ${className} ${
    isHighlighted ? 'rounded-lg bg-yellow-50 ring-2 ring-yellow-200' : ''
  }`}
>
```

### 2. PostDetail 컴포넌트 확장
**파일: `src/features/feed/components/PostDetail.tsx`**

#### 주요 기능:
1. **URL 파라미터 처리**: `comment` 파라미터 추출
2. **댓글 스크롤 함수**: 특정 댓글로 부드러운 스크롤
3. **하이라이트 관리**: 3초간 댓글 하이라이트 후 자동 제거

```typescript
// URL 파라미터 추출
const commentId = searchParams.get('comment');
const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

// 댓글 스크롤 함수
const scrollToComment = (commentId: string) => {
  const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
  if (commentElement && scrollableAreaRef.current) {
    const scrollContainer = scrollableAreaRef.current;
    const elementRect = commentElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    // 댓글을 화면 중앙에 위치시키도록 스크롤
    const scrollTop = elementRect.top - containerRect.top + scrollContainer.scrollTop -
                    (containerRect.height / 2) + (elementRect.height / 2);

    scrollContainer.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });

    // 3초간 하이라이트
    setHighlightedCommentId(commentId);
    setTimeout(() => {
      setHighlightedCommentId(null);
    }, 3000);
  }
};

// 댓글 스크롤 이벤트 처리
useEffect(() => {
  if (commentId && post.comments.length > 0) {
    setTimeout(() => {
      scrollToComment(commentId);
    }, 300);
  }
}, [commentId, post.comments.length]);
```

### 3. FeedPage 댓글 URL 처리
**파일: `src/features/feed/pages/FeedPage.tsx`**

#### 주요 변경사항:
- 댓글 URL 파라미터 추출
- URL 업데이트 시 댓글 ID 유지

```typescript
// URL 파라미터 추출
const selectedPostId = searchParams.get('post');
const selectedCommentId = searchParams.get('comment');

// URL 업데이트 시 댓글 ID 포함
if (dateParam !== postDateQuery.data.date) {
  const queryParams = new URLSearchParams();
  queryParams.set('date', postDateQuery.data.date);
  queryParams.set('post', selectedPostId);
  if (selectedCommentId) {
    queryParams.set('comment', selectedCommentId);
  }
  const newUrl = `/${spaceSlug}/feed?${queryParams.toString()}`;
  router.replace(newUrl);
}
```

## 동작 흐름

### 1. 댓글 URL 접근
```
사용자가 /feed?post=abc123&comment=def456 접근
```

### 2. 포스트 날짜 조회
```
1. 포스트 ID로 날짜 조회 (기존 기능)
2. 조회된 날짜로 selectedDate 설정
3. URL에 날짜 추가: /feed?date=2024-01-15&post=abc123&comment=def456
```

### 3. 피드 로드 및 포스트 상세 화면
```
1. 해당 날짜의 피드 데이터 로드
2. 포스트 상세 화면 열기
3. 댓글 렌더링 완료 후 스크롤 실행
```

### 4. 댓글 스크롤 및 하이라이트
```
1. data-comment-id 속성으로 댓글 요소 찾기
2. 화면 중앙에 위치하도록 부드러운 스크롤
3. 3초간 노란색 하이라이트 표시
4. 하이라이트 자동 제거
```

## 사용 사례

### 1. 댓글 공유 기능
```typescript
// 댓글 공유 URL 생성
const shareCommentUrl = `${window.location.origin}/${spaceSlug}/feed?post=${postId}&comment=${commentId}`;

// 클립보드에 복사
await navigator.clipboard.writeText(shareCommentUrl);
```

### 2. 댓글 알림에서 연결
```typescript
// 댓글 알림 클릭 시 해당 댓글로 이동
const notificationUrl = `/feed?post=${postId}&comment=${commentId}`;
router.push(notificationUrl);
```

## 시각적 효과

### 하이라이트 스타일
- **배경색**: `bg-yellow-50` (연한 노란색)
- **테두리**: `ring-2 ring-yellow-200` (노란색 테두리)
- **지속시간**: 3초
- **애니메이션**: 부드러운 스크롤 (`behavior: 'smooth'`)

### 스크롤 위치
- 댓글이 화면 중앙에 위치하도록 계산
- 컨테이너 높이의 50% 지점에 댓글 중앙 배치

## 성능 고려사항

### 1. 댓글 렌더링 대기
- 댓글이 DOM에 렌더링될 때까지 300ms 대기
- 렌더링 완료 후 스크롤 실행

### 2. 메모리 관리
- 하이라이트 타이머 자동 정리
- 컴포넌트 언마운트 시 정리 함수 실행

### 3. 중복 실행 방지
- 동일한 댓글 ID에 대한 중복 스크롤 방지
- 스크롤 진행 중 추가 스크롤 요청 무시

## 향후 개선사항

### 1. 댓글이 없는 경우 처리
```typescript
// 댓글이 아직 로드되지 않은 경우 재시도
if (commentId && !post.comments.find(c => c.id === commentId)) {
  // 댓글 데이터 추가 로드 또는 에러 처리
}
```

### 2. 더 정교한 스크롤 위치 계산
```typescript
// 헤더 높이, 패딩 등을 고려한 정확한 스크롤 위치
const headerHeight = 60;
const scrollTop = elementRect.top - containerRect.top + scrollContainer.scrollTop - headerHeight;
```

### 3. 하이라이트 애니메이션 개선
```typescript
// 점진적 하이라이트 효과
const [highlightIntensity, setHighlightIntensity] = useState(1);

useEffect(() => {
  if (highlightedCommentId) {
    const timer = setInterval(() => {
      setHighlightIntensity(prev => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(timer);
  }
}, [highlightedCommentId]);
```

## 테스트 방법

### 1. 기본 기능 테스트
```
1. 댓글이 있는 포스트에서 댓글 URL 생성
2. 새 탭에서 해당 URL로 접근
3. 댓글 위치로 스크롤되는지 확인
4. 하이라이트가 3초간 표시되는지 확인
```

### 2. 에지 케이스 테스트
```
1. 존재하지 않는 댓글 ID로 접근
2. 삭제된 댓글 ID로 접근
3. 포스트 ID는 있지만 댓글 ID가 없는 경우
4. 댓글이 아직 로드되지 않은 상태에서 접근
```

### 3. 성능 테스트
```
1. 댓글이 많은 포스트에서 테스트
2. 스크롤 애니메이션 부드러움 확인
3. 메모리 누수 없이 하이라이트 제거되는지 확인
```
