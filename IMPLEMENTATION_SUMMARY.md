# 포스트 URL 날짜 자동 설정 기능 구현

## 문제 상황
- URL: `https://www.scrumbl.co/todaitspace1/feed?post=06073e13-e014-4b5c-9541-7676140880b4`
- 해당 링크를 클릭하면 날짜와 상관없이 해당 포스트의 날짜로 자동 이동해야 함
- 현재는 날짜가 다르면 포스트가 제대로 로드되지 않는 문제

## 구현 내용

### 1. 백엔드 API 추가
**파일: `src/shared/lib/api/posts.ts`**
```typescript
/**
 * 특정 포스트의 날짜 정보 조회
 * @param spaceSlug 스페이스 슬러그
 * @param postId 포스트 ID
 * @returns 포스트의 날짜 정보
 */
getPostDate: async (spaceSlug: string, postId: string): Promise<{ date: string }> => {
  const { data } = await apiClient.get<{ date: string }>(
    `/api/v1/spaces/${spaceSlug}/posts/${postId}/date`
  );
  return data;
}
```

### 2. React Query 키 추가
**파일: `src/shared/hooks/queries/postsKeys.ts`**
```typescript
// 포스트 날짜 키
postDate: (spaceSlug: string, postId: string) =>
  [...postsKeys.bySpace(spaceSlug), 'postDate', postId] as const,
```

### 3. 포스트 날짜 조회 훅 생성
**파일: `src/shared/hooks/queries/usePostDate.ts`**
```typescript
export function usePostDate({ spaceSlug, postId, enabled = true }: UsePostDateParams) {
  return useQuery({
    queryKey: postsKeys.postDate(spaceSlug, postId),
    queryFn: () => postsApi.getPostDate(spaceSlug, postId),
    enabled: enabled && !!spaceSlug && !!postId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 1,
  });
}
```

### 4. FeedPage에서 자동 날짜 설정 로직 추가
**파일: `src/features/feed/pages/FeedPage.tsx`**

#### 주요 변경사항:
1. **포스트 ID 기반 날짜 조회**: URL에 `post` 파라미터가 있을 때 해당 포스트의 날짜 조회
2. **자동 날짜 설정**: 조회된 날짜로 `selectedDate` 자동 설정
3. **URL 업데이트**: 날짜 파라미터가 없거나 다른 경우 URL에 올바른 날짜 추가

#### 로직 흐름:
```typescript
// 1. URL에서 포스트 ID 추출
const selectedPostId = searchParams.get('post');

// 2. 포스트 ID가 있을 때만 날짜 조회
const postDateQuery = usePostDate({
  spaceSlug,
  postId: selectedPostId || '',
  enabled: !!selectedPostId,
});

// 3. 날짜 자동 설정 및 URL 업데이트
useEffect(() => {
  const dateParam = searchParams.get('date');

  if (selectedPostId && postDateQuery.data && 'date' in postDateQuery.data) {
    const postDate = new Date(postDateQuery.data.date);
    setSelectedDate(postDate);

    if (dateParam !== postDateQuery.data.date) {
      const newUrl = `/${spaceSlug}/feed?date=${postDateQuery.data.date}&post=${selectedPostId}`;
      router.replace(newUrl);
    }
    return;
  }

  // 기존 날짜 초기화 로직...
}, [searchParams, selectedPostId, postDateQuery.data, setSelectedDate]);
```

## 동작 방식

### Before (기존)
1. URL: `/feed?post=abc123` 접근
2. 현재 날짜 또는 기본 날짜로 피드 로드
3. 해당 날짜에 포스트가 없으면 포스트 상세 화면 실패

### After (수정 후)
1. URL: `/feed?post=abc123` 접근
2. 포스트 ID로 해당 포스트의 날짜 조회 (`getPostDate` API 호출)
3. 조회된 날짜로 자동 설정
4. URL 업데이트: `/feed?date=2024-01-15&post=abc123`
5. 해당 날짜의 피드 로드 및 포스트 상세 화면 표시

## 백엔드 구현 필요사항

아래 API 엔드포인트를 백엔드에서 구현해야 합니다:

```
GET /api/v1/spaces/{spaceSlug}/posts/{postId}/date
```

**응답 형식:**
```json
{
  "date": "2024-01-15"
}
```

**설명:**
- 특정 포스트의 `posted_at` 날짜를 YYYY-MM-DD 형식으로 반환
- 포스트가 존재하지 않으면 404 오류 반환
- 스페이스 권한 체크 필요

## 테스트 방법

1. 포스트 ID를 포함한 URL로 직접 접근
2. URL에 날짜 파라미터 없이 포스트 파라미터만 있는 경우 테스트
3. 다른 날짜의 포스트 링크 클릭 시 자동 날짜 변경 확인

## 참고사항

- 포스트 ID가 유효하지 않거나 API 오류 시 기존 로직 실행
- 성능 최적화를 위해 5분 stale time, 10분 캐시 시간 설정
- 타입 안전성을 위해 TypeScript 체크 통과 확인
