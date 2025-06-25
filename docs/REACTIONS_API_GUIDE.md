# 리액션 API 가이드

## 개요

리액션 시스템은 포스트와 댓글에 이모지 리액션을 추가/제거할 수 있는 기능을 제공합니다. Optimistic Update를 통해 즉각적인 UI 반영과 에러 시 자동 롤백을 지원합니다.

## 아키텍처

```
/shared/lib/api/reactions.ts       # API 호출 로직
/shared/hooks/queries/useReactions.ts  # React Query 훅들
/shared/hooks/queries/reactionsKeys.ts # 캐시 키 관리
```

## API 엔드포인트

### 백엔드 API
- `POST /api/v1/:targetType/:targetId/reactions` - 리액션 추가
- `DELETE /api/v1/:targetType/:targetId/reactions` - 리액션 제거
- `GET /api/v1/:targetType/:targetId/reactions` - 리액션 조회

여기서 `targetType`은 `"posts"` 또는 `"comments"`이고, `targetId`는 해당 포스트나 댓글의 ID입니다.

## 사용법

### 1. 기본 사용법

```typescript
import { useAddReaction, useRemoveReaction, useToggleReaction } from '@/shared/hooks/queries';

function PostCard({ post, spaceSlug }: { post: Post; spaceSlug: string }) {
  const addReaction = useAddReaction(spaceSlug);
  const removeReaction = useRemoveReaction(spaceSlug);
  const toggleReaction = useToggleReaction(spaceSlug);

  const handleReactionClick = (emoji: string) => {
    toggleReaction.mutate({
      targetType: 'posts',
      targetId: post.id,
      emoji,
      currentReactions: post.reactions,
    });
  };

  return (
    <div>
      <div>{post.content}</div>
      <div className="reactions">
        {['❤️', '👍', '🔥', '💪', '🤗', '☕'].map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className="reaction-button"
          >
            {emoji}
            {post.reactions.find(r => r.emoji === emoji)?.count || 0}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. 개별 추가/제거

```typescript
function ReactionButton({ post, emoji, spaceSlug }: Props) {
  const addReaction = useAddReaction(spaceSlug);
  const removeReaction = useRemoveReaction(spaceSlug);
  const { user } = useAuth();

  const reaction = post.reactions.find(r => r.emoji === emoji);
  const userHasReacted = reaction?.userIds.includes(user?.id || '') || false;

  const handleClick = () => {
    if (userHasReacted) {
      removeReaction.mutate({
        targetType: 'posts',
        targetId: post.id,
        emoji,
      });
    } else {
      addReaction.mutate({
        targetType: 'posts',
        targetId: post.id,
        emoji,
      });
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={userHasReacted ? 'reacted' : ''}
      disabled={addReaction.isPending || removeReaction.isPending}
    >
      {emoji} {reaction?.count || 0}
    </button>
  );
}
```

### 3. 댓글 리액션

```typescript
function CommentReactions({ comment, spaceSlug }: Props) {
  const toggleReaction = useToggleReaction(spaceSlug);

  const handleReactionClick = (emoji: string) => {
    toggleReaction.mutate({
      targetType: 'comments',  // 댓글 리액션
      targetId: comment.id,
      emoji,
      currentReactions: comment.reactions || [],
    });
  };

  // UI 렌더링...
}
```

## 주요 특징

### 1. Optimistic Update
- 서버 요청 전에 UI를 먼저 업데이트하여 즉각적인 반응 제공
- 사용자 경험 향상을 위해 로딩 상태 최소화

### 2. 자동 롤백
- 서버 요청 실패 시 이전 상태로 자동 복원
- 데이터 일관성 보장

### 3. 중복 방지
- 동일한 사용자가 같은 이모지에 중복 리액션하는 것을 방지
- 클라이언트와 서버 양쪽에서 검증

### 4. 캐시 무효화
- 성공/실패 관계없이 최종적으로 서버 데이터로 동기화
- 다른 사용자의 리액션 변경사항도 반영

## 에러 처리

```typescript
const addReaction = useAddReaction(spaceSlug);

// 에러 상태 확인
if (addReaction.isError) {
  console.error('리액션 추가 실패:', addReaction.error);
}

// 로딩 상태 확인
if (addReaction.isPending) {
  // 로딩 UI 표시
}
```

## 타입 정의

```typescript
interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface AddReactionRequest {
  targetType: 'posts' | 'comments';
  targetId: string;
  emoji: string;
}
```

## 성능 최적화

1. **배치 업데이트**: 여러 리액션 변경을 한 번에 처리
2. **선택적 무효화**: 변경된 포스트/댓글만 캐시 업데이트
3. **중복 요청 방지**: 동일한 요청이 진행 중일 때 새 요청 차단

## 주의사항

1. `spaceSlug`는 캐시 키에 사용되므로 정확한 값을 전달해야 합니다.
2. Optimistic Update는 포스트 리액션에만 적용되며, 댓글 리액션은 서버 응답 후 업데이트됩니다.
3. 에러 발생 시 사용자에게 적절한 피드백을 제공하는 것이 좋습니다.