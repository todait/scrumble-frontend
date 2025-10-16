# Comment Tiptap Integration Plan

## TL;DR

- CommentInput의 textarea를 TiptapEditor로 교체하고 plain text와 content_json을 모두 전송
- CommentItem(알림)과 CommentPreview(피드)는 TiptapViewer 또는 안전한 plain-text 추출로 렌더링
- API/타입 레이어에 방어적 normalization 추가: JSON 필드 누락, stringified JSON 대응

## 목표

- **CommentInput**: Tiptap 에디터로 댓글 작성
- **CommentItem(알림), CommentPreview(피드)**: Tiptap JSON으로 렌더링
- **기존 Post 문제 방지**:
  - API 응답에 JSON 필드 누락
  - JSON이 stringified로 오는 경우
  - Truncation 시 JSON 구조가 깨지는 문제
  - Edit 모달에서 기존 JSON 로드 실패

---

## 1. 수정이 필요한 컴포넌트/파일 목록

### UI/Components
- ✅ **CommentInput.tsx** - textarea → TiptapEditor 교체
- ✅ **CommentItem.tsx** - 알림 페이지의 댓글 아이템
- ✅ **CommentPreview.tsx** - 피드 리스트의 댓글 미리보기

### API/Types
- ✅ **shared/types/api.ts** - ApiComment에 content_json 추가
- ✅ **shared/types/comment.ts** - Comment/Request/Response에 contentJson 추가
- ✅ **shared/types/notification.ts** - CommentNotificationPayload.comment에 contentJson 추가
- ✅ **shared/lib/api/comments.ts** - API 요청/응답 처리 및 변환

### Shared (신규)
- ✅ **shared/utils/tiptap.utils.ts** - normalize/parse/serialize/truncate 헬퍼
- ✅ **TiptapViewer.tsx** - maxLines line-clamp 지원 확인/개선

**예상 작업량**: M (Medium, 3-6시간)

---

## 2. 파일별 수정 상세

### 2.1 shared/types/api.ts

**변경 목적**: 백엔드 응답/요청에 댓글 JSON 필드(content_json) 반영

```typescript
export interface ApiComment {
  id: string;
  post_id: string;
  author: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
  content: string;
  content_json?: unknown; // 🆕 Tiptap JSON (object or stringified)
  created_at: string;
  updated_at: string;
  images?: ApiImage[];
  reactions?: ApiReaction[];
}
```

**작업량**: S (Small, <1시간)

---

### 2.2 shared/types/notification.ts

**변경 목적**: 알림 페이로드의 comment 객체에 contentJson 추가

```typescript
import type { JSONContent } from '@tiptap/core';

export interface CommentNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    contentJson?: JSONContent; // 🆕 Tiptap JSON
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}

export interface CommentReactionNotificationPayload {
  post: {
    postId: string;
    postType: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  comment: {
    commentId: string;
    content: string;
    contentJson?: JSONContent; // 🆕 Tiptap JSON
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
  reaction: {
    content: string;
    author: {
      id: string;
      name: string;
      avatarURL: string | null;
    };
  };
}
```

**작업량**: S (Small, <1시간)

---

### 2.3 shared/types/comment.ts

**변경 목적**: 프론트엔드 타입에 contentJson 추가

```typescript
import type { JSONContent } from '@tiptap/core';

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  content: string;
  contentJson?: JSONContent; // 🆕 Tiptap JSON
  createdAt: Date;
  images?: CommentImage[];
  reactions?: Reaction[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  contentJson?: JSONContent; // 🆕
  images: ImageMetadata[];
}

export interface UpdateCommentRequest {
  postId: string;
  commentId: string;
  content: string;
  contentJson?: JSONContent; // 🆕
  images: ImageMetadata[];
}

export type CommentResponse = Required<
  Pick<Comment, 'id' | 'postId' | 'author' | 'content' | 'createdAt' | 'updatedAt'>
> & Pick<Comment, 'images' | 'contentJson'>;
```

**작업량**: S (Small, <1시간)

---

### 2.4 shared/lib/api/comments.ts

**변경 목적**:
- 요청 시 content_json 함께 전송
- 응답 맵핑 시 content_json 파싱 (stringified/누락 대응)
- Comment.contentJson 설정

```typescript
import { normalizeApiJson } from '@/shared/utils/tiptap.utils';

export const convertApiCommentToComment = (apiComment: ApiComment): Comment => ({
  id: apiComment.id,
  author: {
    id: apiComment.author.id,
    name: apiComment.author.name,
    profileImage: apiComment.author.avatar_url || '',
  },
  content: apiComment.content,
  contentJson: normalizeApiJson(apiComment.content_json, apiComment.content), // 🆕
  createdAt: new Date(apiComment.created_at),
  images: apiComment.images?.map(convertApiImageToImage),
  reactions: convertApiReactionsToReactions(apiComment.reactions),
});

createComment: async (params: CreateCommentRequest): Promise<CreateCommentResponse> => {
  const { data } = await apiClient.post(`/api/v1/posts/${params.postId}/comments`, {
    content: params.content,
    content_json: params.contentJson ?? null, // 🆕
    images: params.images,
  });

  return {
    message: data.message,
    comment: {
      id: data.comment.id,
      postId: data.comment.post_id,
      content: data.comment.content,
      contentJson: normalizeApiJson(data.comment.content_json, data.comment.content), // 🆕
      createdAt: data.comment.created_at,
      updatedAt: data.comment.updated_at,
      author: {
        id: data.comment.author.id,
        name: data.comment.author.name,
        email: data.comment.author.email,
        avatarURL: data.comment.author.avatar_url,
      },
      images: data.comment.images?.map(convertApiImageToImage),
    },
  };
},

updateComment: async (params: UpdateCommentRequest): Promise<UpdateCommentResponse> => {
  const { data } = await apiClient.patch(
    `/api/v1/posts/${params.postId}/comments/${params.commentId}`,
    {
      content: params.content,
      content_json: params.contentJson ?? null, // 🆕
      images: params.images,
    }
  );

  return {
    message: data.message,
    comment: {
      id: data.comment.id,
      postId: data.comment.post_id,
      content: data.comment.content,
      contentJson: normalizeApiJson(data.comment.content_json, data.comment.content), // 🆕
      createdAt: data.comment.created_at,
      updatedAt: data.comment.updated_at,
      author: {
        id: data.comment.author.id,
        name: data.comment.author.name,
        email: data.comment.author.email,
        avatarURL: data.comment.author.avatar_url,
      },
      images: data.comment.images?.map(convertApiImageToImage),
    },
  };
},
```

**작업량**: M (Medium, 1-2시간)

---

### 2.5 CommentInput.tsx

**변경 목적**:
- textarea → TiptapEditor 교체
- plainText + tiptap JSON 동시 보관
- onSubmit 호출 시 { content, contentJson, images } 전달

**주요 변경 사항**:

```typescript
interface CommentInputProps {
  authorName: string;
  placeholder?: string;
  onSubmit: (content: string, contentJson: JSONContent | undefined, images: ImageMetadata[]) => void; // 🆕 contentJson 추가
  isSubmitting?: boolean;
}

export function CommentInput({ authorName, placeholder, onSubmit, isSubmitting = false }: CommentInputProps) {
  const [plainText, setPlainText] = useState('');
  const [contentJson, setContentJson] = useState<JSONContent | undefined>();
  const [isFocused, setIsFocused] = useState(false);

  // ... 이미지 업로드 로직은 동일 ...

  const handleSubmit = () => {
    if (plainText.trim() || completedImages.length > 0) {
      const imagesToSubmit = [...completedImages];
      const textToSubmit = plainText.trim();
      const jsonToSubmit = contentJson;

      clearImages();
      setPlainText('');
      setContentJson(undefined);

      onSubmit(textToSubmit, jsonToSubmit, imagesToSubmit); // 🆕
    }
  };

  const isSubmitEnabled =
    (plainText.trim().length > 0 || completedImages.length > 0) &&
    !isUploading &&
    !hasUploadingImages;

  return (
    <div className={...}>
      {/* TiptapEditor로 교체 */}
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <TiptapEditor
            content={contentJson}
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
            }}
            placeholder={displayPlaceholder}
            minHeight={22}
            maxHeight={150}
            showToolbar={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmit={handleSubmit}
            disabled={false}
          />
        </div>
      </div>

      {/* 이미지 미리보기 */}
      {uploadingImages.length > 0 && (
        <ImagePreviewList images={uploadingImages} onRemove={removeImage} disabled={false} />
      )}

      {/* 하단 액션 바 - 동일 유지 */}
      <div className="flex items-center justify-between">
        {/* ... */}
      </div>
    </div>
  );
}
```

**작업량**: M (Medium, 2-3시간)

---

### 2.6 CommentItem.tsx (알림)

**변경 목적**: 알림 리스트에 댓글 본문을 안전하게 요약(150자) 표시

```typescript
import { extractPlainText } from '@/shared/utils/tiptap.utils';
import { truncateText } from '../../utils/notificationHelpers';

const CommentItem = memo(function CommentItem({ notification, onClick }: CommentItemProps) {
  const { currentSpaceMember: member } = useAuth();
  const { createdAt, isRead, payload } = notification;
  const { post, comment } = payload;

  if (!comment) return null;

  // 🆕 JSON → plainText 추출 후 truncate
  const commentText = extractPlainText(comment.contentJson, comment.content || '');

  return (
    <div className={...} onClick={onClick}>
      <div className="flex items-center gap-3 md:gap-[20px]">
        <div className="flex-shrink-0">
          <ProfileImage src={comment.author.avatarURL || ''} alt={comment.author.name} size={40} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="pb-1 text-[12px] font-semibold text-[#6E6E73] text-opacity-50">
            #{getAuthorDisplayName(post.author.id, post.author.name, member?.id)}의{' '}
            {getPostTypeDisplayName(post.postType)}
          </div>
          <div className="text-[13px] text-[#1D1D1F]">
            {getActionAuthorDisplayName(comment.author.id, comment.author.name, member?.id, '댓글')}
            : <span className="text-[#6E6E73]">{truncateText(commentText, 150)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs text-[#999999]">{formatTime(new Date(createdAt))}</span>
        </div>
      </div>
    </div>
  );
});
```

**작업량**: S (Small, <1시간)

---

### 2.7 CommentPreview.tsx

**변경 목적**: 최근 댓글 한 줄 미리보기 (선택적)

```typescript
import { extractPlainText } from '@/shared/utils/tiptap.utils';

interface CommentPreviewProps {
  postId: string;
  comments: Comment[];
  commentCount: number;
  lastCommentTime?: Date;
  onCommentClick?: (postId: string) => void;
  className?: string;
  latestComment?: { content?: string; contentJson?: JSONContent }; // 🆕 선택적
}

export function CommentPreview({
  postId,
  comments,
  commentCount,
  lastCommentTime,
  onCommentClick,
  className = '',
  latestComment, // 🆕
}: CommentPreviewProps) {
  if (commentCount === 0) return null;

  const uniqueAuthors = pipe(
    comments,
    reverse,
    uniqBy(comment => comment.author.id),
    take(5),
    map(comment => comment.author),
    toArray
  );

  return (
    <button onClick={...} className={...}>
      <div className="flex gap-1">
        {uniqueAuthors.map((author, index) => (
          <ProfileImage key={...} src={author.profileImage} alt={author.name} size={32} />
        ))}
      </div>

      <span className="text-sm leading-[1.5] text-[#222222] opacity-80 md:text-[13px]">
        {commentCount}개의 댓글
      </span>

      {/* 🆕 최근 댓글 미리보기 (선택적) */}
      {latestComment && (
        <span className="line-clamp-1 text-sm leading-[1.5] text-[#6E6E73] opacity-60">
          {truncateText(extractPlainText(latestComment.contentJson, latestComment.content || ''), 90)}
        </span>
      )}

      {lastCommentTime && (
        <>
          <span className="text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:hidden md:text-[13px]">
            {formatDistanceToNow(lastCommentTime, { addSuffix: true, locale: ko })}
          </span>
          <span className="hidden text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:block md:text-[13px]">
            보기
          </span>
        </>
      )}

      <RiArrowRightSLine className="ml-auto h-4 w-4 text-[#222222] opacity-0 transition-opacity group-hover:opacity-60" />
    </button>
  );
}
```

**작업량**: S (Small, <1시간)

---

### 2.8 shared/utils/tiptap.utils.ts (신규)

**변경 목적**: Post에서 발생했던 문제를 방지하는 표준 유틸

```typescript
import type { JSONContent } from '@tiptap/core';

/**
 * JSON 문자열을 안전하게 파싱
 */
export const safeParseJson = <T = any>(input: unknown): T | undefined => {
  if (typeof input !== 'string') return undefined;
  try {
    return JSON.parse(input) as T;
  } catch {
    return undefined;
  }
};

/**
 * 유효한 Tiptap 문서인지 확인
 */
export const isValidTiptapDoc = (json: any): boolean =>
  !!json && typeof json === 'object' && json.type === 'doc';

/**
 * 빈 Tiptap 문서 생성
 */
export const emptyDoc = (): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

/**
 * 일반 텍스트를 Tiptap 문서로 변환
 */
export const textToDoc = (text: string): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : undefined,
    },
  ],
});

/**
 * API 응답의 JSON 필드를 정규화
 * - stringified JSON → object
 * - 유효하지 않은 경우 fallbackText를 문서로 변환
 */
export const normalizeApiJson = (
  maybeJson: unknown,
  fallbackText?: string
): JSONContent | undefined => {
  const parsed = typeof maybeJson === 'string' ? safeParseJson<JSONContent>(maybeJson) : maybeJson;

  if (isValidTiptapDoc(parsed)) return parsed as JSONContent;
  if (fallbackText && fallbackText.length > 0) return textToDoc(fallbackText);

  return undefined;
};

/**
 * Tiptap JSON에서 일반 텍스트 추출
 */
export const extractPlainText = (json?: JSONContent, fallbackText = ''): string => {
  if (!json || !isValidTiptapDoc(json)) return fallbackText || '';

  const walk = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (Array.isArray(node.content)) return node.content.map(walk).join('');
    return '';
  };

  return walk(json);
};

/**
 * Tiptap JSON이 비어있는지 확인
 */
export const isEmptyJson = (json?: JSONContent): boolean => {
  if (!json || !isValidTiptapDoc(json)) return true;
  const text = extractPlainText(json);
  return text.trim().length === 0;
};
```

**작업량**: M (Medium, 1-2시간)

---

### 2.9 TiptapViewer 개선/확인 (선택)

**변경 목적**: truncation 시 JSON 구조가 깨지는 문제 방지

**방법**:
- TiptapViewer 내부에서 maxLines를 지원한다면 CSS line-clamp 기반 시각적 절단만 수행
- JSON 자체를 수정하거나 slice하지 않음

**CSS 래퍼 대응**:
```tsx
<div className="line-clamp-3">
  <TiptapViewer content={contentJson} />
</div>
```

**작업량**: S (Small, <1시간)

---

## 3. Post 작업에서 발생했던 문제 방지 체크리스트

### ✅ API 응답에 JSON 필드 누락
- `ApiComment.content_json?: unknown` 타입 정의 (옵셔널)
- `convertApiCommentToComment`에서 `normalizeApiJson` 적용
- 없으면 plainText → JSON 변환 또는 undefined 허용

### ✅ JSON이 stringified로 오는 경우 처리
- `safeParseJson` + `normalizeApiJson` 사용
- 문자열인 경우 파싱 후 유효성 검사

### ✅ TiptapViewer에서 truncation 시 JSON 구조 깨짐
- **절대 JSON을 잘라내지 않음**
- 미리보기/알림은 `extractPlainText(json)` → `truncateText`로 처리
- 뷰어에서 라인 제한은 **CSS line-clamp**로 시각적 절단만

### ✅ Edit 모달에서 기존 JSON 로드 실패
- `normalizeApiJson`으로 초기 content 설정
- 유효 JSON → 그대로, 없으면 `textToDoc(content)`
- Editor mount 시 빈 문서/유효성 보장
- stringified/invalid JSON 대비 try/catch 내장

### ✅ 메시지 전송 포맷
- 항상 `content`(plain) + `content_json`(JSON) 동시 전송
- 백엔드가 `content_json`을 무시/미지원해도 기능 유지

### ✅ Null/Empty 안전성
- content가 비어도 content_json이 비어도 이미지가 있으면 제출 가능
- `extractPlainText` 시 null/undefined 안전 처리

### ✅ 타입/런타임 간극
- 타입에 optional 반영 (필수 X)
- 런타임에서 normalize/parse로 수용성 확보

---

## 4. 작업 순서와 의존성

### 1단계: Types (S)
- ✅ `api.ts` - ApiComment.content_json 추가
- ✅ `notification.ts` - CommentNotificationPayload.comment.contentJson 추가
- ✅ `comment.ts` - Comment.contentJson, 요청/응답에 contentJson 추가

### 2단계: Utils (M)
- ✅ `shared/utils/tiptap.utils.ts` 생성

### 3단계: API 레이어 (M)
- ✅ `comments.ts` - 요청 바디에 content_json 추가
- ✅ 응답 변환에서 normalizeApiJson 적용

### 4단계: UI 통합 (M)
- ✅ `CommentInput.tsx` - TiptapEditor 연동, onSubmit 시그니처 변경
- ✅ `CommentItem.tsx` - extractPlainText + truncateText 적용
- ✅ `CommentPreview.tsx` - latestComment(optional)로 한 줄 미리보기

### 5단계: Viewer truncation 확인 (S)
- ✅ TiptapViewer에 line-clamp 적용 확인/추가

### 6단계: QA (S)
- ✅ JSON 필드 없음 → 정상 렌더 (plain fallback)
- ✅ JSON이 stringified → 파싱 후 렌더
- ✅ 알림/미리보기 truncation → JSON 손상 없음
- ✅ Edit 모달 로드/저장 → 정상

**의존성**:
- 1 → 2 → 3 순서 선행
- CommentInput 변경 시 사용처 빌드 확인

---

## 5. 새로 생성할 파일

- ✅ **shared/utils/tiptap.utils.ts**
  - safeParseJson
  - isValidTiptapDoc
  - emptyDoc
  - textToDoc
  - normalizeApiJson
  - extractPlainText
  - isEmptyJson

---

## 6. 리스크 및 완화 전략

### 리스크 1: 백엔드가 content_json을 아직 지원하지 않을 수 있음
- **완화**: content_json 전송은 안전함. 백엔드가 무시하더라도 content(plain) 동작
- **대안**: feature-flag로 제어 또는 enabled 시에만 전송

### 리스크 2: Stringified JSON 포맷 차이
- **완화**: safeParseJson + isValidTiptapDoc으로 검증
- **Fallback**: plainText로 렌더링

### 리스크 3: Editor 초기 content glitch
- **완화**: 항상 정규화된 JSON 또는 undefined 전달
- **Editor**: 빈 상태 처리 내장

---

## 7. 선택적 고급 경로 (Optional Advanced Path)

### 서버 파이프라인
- 서버에서 create/update 시 content_json 검증
- plainText 추출 및 저장
- 알림은 서버에서 계산된 plainText 사용 (플랫폼 간 일관성)

### Rich Preview Renderer
- ProseMirror Node 순회로 최소/유효한 truncated doc 생성
- 설정 가능한 max nodes/characters
- Preview 컨텍스트에서 활용

---

## 8. Trade-offs

### 왜 content와 content_json을 모두 보관하나?
- 호환성 유지
- 검색/미리보기 즉시 가능 (TipTap 렌더링 없이)
- 쉬운 롤백

### 왜 JSON을 truncate하지 않나?
- 이전 손상 문제 방지
- CSS line-clamp와 plain-text 추출이 더 간단하고 안전

### 왜 새 파일을 최소화하나?
- 단일 utils 파일로 정규화 및 텍스트 추출 로직 통합
- 중복 로직 방지 및 향후 버그 최소화

---

## 9. 참고 자료

- [Tiptap 공식 문서](https://tiptap.dev/)
- [Tiptap React 가이드](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Post Tiptap 마이그레이션 문서](./README.md)
