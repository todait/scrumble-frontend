# API 연동 및 데이터 흐름 상세 설계

## 1. 데이터 구조 변경 사항

### 1.1 프론트엔드 타입 업데이트

#### Before
```typescript
// src/shared/types/post.ts
export interface Post {
  conditionText?: string;  // CheckIn 메시지
  reflectionText?: string; // CheckOut 메시지
}
```

#### After
```typescript
// src/shared/types/post.ts
import type { JSONContent } from '@tiptap/react';

export interface Post {
  // 기존 필드 (호환성 유지)
  conditionText?: string;  // CheckIn 메시지 (plainText)
  reflectionText?: string; // CheckOut 메시지 (plainText)
  
  // 새로운 필드
  conditionTextJson?: JSONContent | null;  // CheckIn Tiptap JSON
  reflectionTextJson?: JSONContent | null; // CheckOut Tiptap JSON
}
```

---

## 2. API 요청/응답 스펙

### 2.1 CheckIn 생성 (Create)

#### Request

**Before:**
```typescript
POST /api/v1/posts/checkins

{
  "postedDate": "2025-10-15",
  "conditionScore": 8,
  "conditionText": "오늘은 컨디션 좋아요!",
  "images": [
    { "url": "https://...", "width": 800, "height": 600 }
  ]
}
```

**After:**
```typescript
POST /api/v1/posts/checkins

{
  "postedDate": "2025-10-15",
  "conditionScore": 8,
  "conditionText": "오늘은 컨디션 좋아요!",  // plainText
  "conditionTextJson": {                       // Tiptap JSON
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "오늘은 컨디션 좋아요!" }
        ]
      }
    ]
  },
  "images": [
    { "url": "https://...", "width": 800, "height": 600 }
  ]
}
```

#### Response

**Before:**
```typescript
{
  "message": "체크인이 생성되었습니다",
  "post": {
    "id": "post_123",
    "conditionScore": 8,
    "conditionText": "오늘은 컨디션 좋아요!",
    "postedAt": "2025-10-15T09:00:00Z",
    "createdAt": "2025-10-15T09:00:00Z",
    "updatedAt": "2025-10-15T09:00:00Z"
  }
}
```

**After:**
```typescript
{
  "message": "체크인이 생성되었습니다",
  "post": {
    "id": "post_123",
    "conditionScore": 8,
    "conditionText": "오늘은 컨디션 좋아요!",
    "conditionTextJson": {
      "type": "doc",
      "content": [...]
    },
    "postedAt": "2025-10-15T09:00:00Z",
    "createdAt": "2025-10-15T09:00:00Z",
    "updatedAt": "2025-10-15T09:00:00Z"
  }
}
```

### 2.2 CheckIn 수정 (Update)

#### Request

```typescript
PUT /api/v1/posts/checkins/{postId}

{
  "conditionScore": 9,
  "conditionText": "수정된 메시지",
  "conditionTextJson": {
    "type": "doc",
    "content": [...]
  },
  "images": [...]
}
```

### 2.3 CheckOut 생성/수정

동일한 패턴으로 `reflectionText` → `reflectionText` + `reflectionTextJson`

---

## 3. API Layer 수정

### 3.1 posts.ts API 파일

```typescript
// src/shared/lib/api/posts.ts

import type { JSONContent } from '@tiptap/react';
import type {
  CreateCheckInRequest,
  CreateCheckInResponse,
  UpdateCheckInRequest,
  UpdateCheckInResponse,
  CreateCheckOutRequest,
  CreateCheckOutResponse,
  UpdateCheckOutRequest,
  UpdateCheckOutResponse,
} from '@/shared/types/post';

// ===== CheckIn API =====

export async function createCheckIn(
  params: CreateCheckInRequest
): Promise<CreateCheckInResponse> {
  const response = await apiClient.post('/posts/checkins', {
    posted_date: params.postedDate,
    condition_score: params.conditionScore,
    condition_text: params.conditionText,
    condition_text_json: params.conditionTextJson, // 새로 추가
    images: params.images,
  });

  return {
    message: response.data.message,
    post: {
      id: response.data.post.id,
      conditionScore: response.data.post.condition_score,
      conditionText: response.data.post.condition_text,
      conditionTextJson: response.data.post.condition_text_json, // 새로 추가
      postedAt: response.data.post.posted_at,
      createdAt: response.data.post.created_at,
      updatedAt: response.data.post.updated_at,
    },
  };
}

export async function updateCheckIn(
  params: UpdateCheckInRequest
): Promise<UpdateCheckInResponse> {
  const response = await apiClient.put(`/posts/checkins/${params.postId}`, {
    condition_score: params.conditionScore,
    condition_text: params.conditionText,
    condition_text_json: params.conditionTextJson, // 새로 추가
    images: params.images,
  });

  return {
    message: response.data.message,
    post: {
      id: response.data.post.id,
      conditionScore: response.data.post.condition_score,
      conditionText: response.data.post.condition_text,
      conditionTextJson: response.data.post.condition_text_json, // 새로 추가
      postedAt: response.data.post.posted_at,
      createdAt: response.data.post.created_at,
      updatedAt: response.data.post.updated_at,
    },
  };
}

// ===== CheckOut API =====

export async function createCheckOut(
  params: CreateCheckOutRequest
): Promise<CreateCheckOutResponse> {
  const response = await apiClient.post('/posts/checkouts', {
    posted_date: params.postedDate,
    reflection_text: params.reflectionText,
    reflection_text_json: params.reflectionTextJson, // 새로 추가
    images: params.images,
  });

  return {
    message: response.data.message,
    post: {
      id: response.data.post.id,
      reflectionText: response.data.post.reflection_text,
      reflectionTextJson: response.data.post.reflection_text_json, // 새로 추가
      postedAt: response.data.post.posted_at,
      createdAt: response.data.post.created_at,
      updatedAt: response.data.post.updated_at,
    },
  };
}

export async function updateCheckOut(
  params: UpdateCheckOutRequest
): Promise<UpdateCheckOutResponse> {
  const response = await apiClient.put(`/posts/checkouts/${params.postId}`, {
    reflection_text: params.reflectionText,
    reflection_text_json: params.reflectionTextJson, // 새로 추가
    images: params.images,
  });

  return {
    message: response.data.message,
    post: {
      id: response.data.post.id,
      reflectionText: response.data.post.reflection_text,
      reflectionTextJson: response.data.post.reflection_text_json, // 새로 추가
      postedAt: response.data.post.posted_at,
      createdAt: response.data.post.created_at,
      updatedAt: response.data.post.updated_at,
    },
  };
}
```

### 3.2 Post Transform 수정

```typescript
// src/features/feed/utils/postTransform.utils.ts

import type { Post as APIPost } from '@/shared/types/post';
import type { CheckinPost, CheckoutPost } from '../types/feed.types';

export function transformToCheckinPost(apiPost: APIPost): CheckinPost {
  return {
    id: apiPost.id,
    type: 'checkin',
    author: {
      id: apiPost.author.id,
      name: apiPost.author.name,
      profileImage: apiPost.author.avatarURL,
    },
    conditionScore: apiPost.conditionScore || 0,
    conditionEmoji: getConditionEmoji(apiPost.conditionScore || 0),
    conditionText: apiPost.conditionText || '',
    conditionTextJson: apiPost.conditionTextJson || null, // 새로 추가
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    images: apiPost.images,
    reactions: apiPost.reactions || [],
    comments: apiPost.comments || [],
    commentCount: apiPost.comments?.length || 0,
  } satisfies CheckinPost;
}

export function transformToCheckoutPost(apiPost: APIPost): CheckoutPost {
  return {
    id: apiPost.id,
    type: 'checkout',
    author: {
      id: apiPost.author.id,
      name: apiPost.author.name,
      profileImage: apiPost.author.avatarURL,
    },
    reflectionText: apiPost.reflectionText || '',
    reflectionTextJson: apiPost.reflectionTextJson || null, // 새로 추가
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    images: apiPost.images,
    reactions: apiPost.reactions || [],
    comments: apiPost.comments || [],
    commentCount: apiPost.comments?.length || 0,
  } satisfies CheckoutPost;
}
```

---

## 4. 타입 정의 업데이트

### 4.1 src/shared/types/post.ts

```typescript
import type { JSONContent } from '@tiptap/react';

// ===== CheckIn =====

export interface CreateCheckInRequest {
  postedDate?: string;
  conditionScore: number;
  conditionText: string;
  conditionTextJson?: JSONContent | null; // 새로 추가
  images: ImageMetadata[];
}

export type CheckInPostResponse = Required<
  Pick<
    Post,
    | 'id'
    | 'conditionScore'
    | 'conditionText'
    | 'conditionTextJson' // 새로 추가
    | 'postedAt'
    | 'createdAt'
    | 'updatedAt'
  >
>;

export interface UpdateCheckInRequest {
  postId: string;
  conditionScore: number;
  conditionText: string;
  conditionTextJson?: JSONContent | null; // 새로 추가
  images: ImageMetadata[];
}

// ===== CheckOut =====

export interface CreateCheckOutRequest {
  postedDate?: string;
  reflectionText?: string;
  reflectionTextJson?: JSONContent | null; // 새로 추가
  images: ImageMetadata[];
}

export type CheckOutPostResponse = Required<
  Pick<
    Post,
    | 'id'
    | 'reflectionText'
    | 'reflectionTextJson' // 새로 추가
    | 'postedAt'
    | 'createdAt'
    | 'updatedAt'
  >
>;

export interface UpdateCheckOutRequest {
  postId: string;
  reflectionText: string;
  reflectionTextJson?: JSONContent | null; // 새로 추가
  images: ImageMetadata[];
}
```

### 4.2 src/features/feed/types/feed.types.ts

```typescript
import type { JSONContent } from '@tiptap/react';

export interface CheckinPost extends BasePost {
  type: 'checkin';
  conditionScore: number;
  conditionEmoji: string;
  conditionText: string;
  conditionTextJson?: JSONContent | null; // 새로 추가
}

export interface CheckoutPost extends BasePost {
  type: 'checkout';
  reflectionText: string;
  reflectionTextJson?: JSONContent | null; // 새로 추가
}

// getPostContent 함수도 업데이트
export const getPostContent = (post: Post): string => {
  if (isCheckinPost(post)) {
    return post.conditionText || '';
  }
  return post.reflectionText || '';
};

// getPostJsonContent 함수 추가
export const getPostJsonContent = (post: Post): JSONContent | null => {
  if (isCheckinPost(post)) {
    return post.conditionTextJson || null;
  }
  return post.reflectionTextJson || null;
};
```

---

## 5. 컴포넌트 업데이트

### 5.1 PostForm 업데이트

```typescript
// src/shared/components/ui/PostForm.tsx

import type { JSONContent } from '@tiptap/react';
import { TiptapEditor } from '@/shared/components/tiptap';

interface PostFormProps {
  onSubmit: (data: {
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }) => void;
  onChange?: (data: {
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }) => void;
  // ... 기타 props
  initialMessage?: string;
  initialMessageJson?: JSONContent | null; // 새로 추가
}

export const PostForm = ({
  onSubmit,
  onChange,
  initialMessage = '',
  initialMessageJson = null, // 새로 추가
  // ... 기타 props
}: PostFormProps) => {
  const [messageJson, setMessageJson] = useState<JSONContent | null>(
    initialMessageJson
  );
  const [messagePlainText, setMessagePlainText] = useState(initialMessage);

  const handleEditorChange = (json: JSONContent, text: string) => {
    setMessageJson(json);
    setMessagePlainText(text);

    if (onChange) {
      onChange({
        message: text,
        messageJson: json,
        images: completedImages,
      });
    }
  };

  const handleSubmit = () => {
    if (messagePlainText.trim() || completedImages.length > 0) {
      onSubmit({
        message: messagePlainText,
        messageJson,
        images: completedImages,
      });
    }
  };

  return (
    <div>
      {children}

      <TiptapEditor
        content={messageJson}
        onChange={handleEditorChange}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={240}
        onKeyDown={(e, editor) => {
          if (e.metaKey && e.key === 'Enter' && !isSubmitDisabled) {
            e.preventDefault();
            handleSubmit();
            return true;
          }
          return false;
        }}
      />

      {/* 이미지 업로드 영역 (기존 유지) */}
      <ImagePreviewList ... />

      <button onClick={handleSubmit} ...>
        저장
      </button>
    </div>
  );
};
```

### 5.2 CheckInForm 업데이트

```typescript
// src/features/checkin/components/forms/CheckInForm.tsx

import type { JSONContent } from '@tiptap/react';

interface CheckInFormProps {
  onSubmit: (data: {
    score: number;
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }) => void;
  onChange?: (data: {
    score: number | null;
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }) => void;
  initialData?: {
    score: number;
    message: string;
    messageJson?: JSONContent | null; // 새로 추가
    images?: ImageMetadata[];
  };
  // ... 기타 props
}

export const CheckInForm = ({
  onSubmit,
  onChange,
  initialData,
  // ... 기타
}: CheckInFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(
    initialData?.score || null
  );
  const [currentFormData, setCurrentFormData] = useState<{
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }>({
    message: initialData?.message || '',
    messageJson: initialData?.messageJson || null, // 새로 추가
    images: initialData?.images || [],
  });

  const handleSubmit = (data: {
    message: string;
    messageJson?: JSONContent | null;
    images: ImageMetadata[];
  }) => {
    if (!selectedScore) {
      if (onScoreRequiredToast) onScoreRequiredToast();
      return;
    }
    if (selectedScore && data.message.trim()) {
      onSubmit({
        score: selectedScore,
        message: data.message,
        messageJson: data.messageJson, // 새로 추가
        images: data.images,
      });
    }
  };

  const handlePostFormChange = useCallback(
    (data: {
      message: string;
      messageJson?: JSONContent | null;
      images: ImageMetadata[];
    }) => {
      setCurrentFormData(data);
      if (onChange) {
        onChange({
          score: selectedScoreRef.current,
          message: data.message,
          messageJson: data.messageJson, // 새로 추가
          images: data.images,
        });
      }
    },
    [onChange]
  );

  return (
    <PostForm
      onSubmit={handleSubmit}
      onChange={handlePostFormChange}
      initialMessage={initialData?.message}
      initialMessageJson={initialData?.messageJson} // 새로 추가
      initialImages={initialData?.images}
      // ... 기타
    >
      <ScoreSelector value={selectedScore} onChange={handleScoreChange} />
    </PostForm>
  );
};
```

### 5.3 CheckIn Hook 업데이트

```typescript
// src/features/checkin/hooks/useCheckInForm.ts

const handleSubmit = async (data: {
  score: number;
  message: string;
  messageJson?: JSONContent | null;
  images: ImageMetadata[];
}) => {
  if (isEdit && post) {
    // 수정
    updateCheckIn({
      postId: post.id,
      conditionScore: data.score,
      conditionText: data.message,
      conditionTextJson: data.messageJson, // 새로 추가
      images: data.images,
    });
  } else {
    // 생성
    createCheckIn({
      postedDate,
      conditionScore: data.score,
      conditionText: data.message,
      conditionTextJson: data.messageJson, // 새로 추가
      images: data.images,
    });
  }
};
```

### 5.4 PostContent 뷰어 업데이트

```typescript
// src/features/feed/components/PostContent.tsx

import { TiptapViewer } from '@/shared/components/tiptap';
import { getPostJsonContent, getPostContent } from '../types/feed.types';

export function PostContent({ post, isDetailView, ... }: PostContentProps) {
  const jsonContent = getPostJsonContent(post);
  const plainTextContent = getPostContent(post);

  return (
    <div>
      {/* ... 헤더, 프로필 등 */}

      {/* 본문 - Tiptap Viewer 사용 */}
      <div className="mt-[10px] py-2">
        <TiptapViewer
          content={jsonContent || plainTextContent}
          fallbackText={plainTextContent}
          maxLength={isDetailView ? undefined : 200}
          initialExpanded={isDetailView}
        />
      </div>

      {/* ... 이미지, 댓글 등 */}
    </div>
  );
}
```

---

## 6. 호환성 처리

### 6.1 기존 Post 처리 전략

**시나리오 1: JSON 있음**
```typescript
post.conditionTextJson = { type: "doc", ... }  // ✅ Tiptap으로 렌더링
post.conditionText = "plain text"             // Fallback으로 보관
```

**시나리오 2: JSON 없음 (기존 Post)**
```typescript
post.conditionTextJson = null                 // ❌ JSON 없음
post.conditionText = "plain text"            // ✅ plainText로 렌더링
```

### 6.2 TiptapViewer에서 처리

```typescript
// TiptapViewer.tsx
export const TiptapViewer = ({ content, fallbackText }: TiptapViewerProps) => {
  const isJson = content && typeof content === 'object';

  if (!isJson && !fallbackText) {
    return <p className="text-gray-400">내용이 없습니다</p>;
  }

  if (!isJson) {
    // plainText로 처리
    return <p className="whitespace-pre-wrap">{fallbackText}</p>;
  }

  // JSON으로 처리
  return <EditorContent editor={editor} />;
};
```

---

## 7. 에러 처리

### 7.1 API 에러

```typescript
try {
  await createCheckIn({
    conditionText: text,
    conditionTextJson: json,
    ...
  });
} catch (error) {
  if (error.response?.status === 400) {
    // JSON 파싱 에러 등
    show('입력 형식이 올바르지 않습니다');
  } else {
    show('게시물 저장에 실패했습니다');
  }
}
```

### 7.2 JSON 파싱 에러

```typescript
// TiptapViewer.tsx
try {
  const editor = useEditor({
    content: jsonContent,
    ...
  });
} catch (error) {
  console.error('Tiptap JSON 파싱 에러:', error);
  // Fallback to plainText
  return <p className="whitespace-pre-wrap">{fallbackText}</p>;
}
```

---

## 8. 마이그레이션 체크리스트

- [ ] Tiptap 패키지 설치
- [ ] TiptapEditor 컴포넌트 구현
- [ ] TiptapViewer 컴포넌트 구현
- [ ] PostForm에 TiptapEditor 통합
- [ ] CheckInForm 데이터 구조 업데이트
- [ ] CheckOutForm 데이터 구조 업데이트
- [ ] API posts.ts 파일 수정 (condition_text_json, reflection_text_json)
- [ ] Post 타입 정의 업데이트
- [ ] postTransform.utils.ts 수정
- [ ] PostContent에 TiptapViewer 통합
- [ ] 기존 Post 호환성 테스트
- [ ] 드래그앤드롭 이미지 기능 테스트
- [ ] API 통합 테스트
- [ ] E2E 테스트

---

## 9. 백엔드 확인 필요 사항

### 질문 1: JSON 컬럼명
백엔드에서 사용하는 정확한 컬럼명을 확인해주세요:
- `condition_text_json` / `reflection_text_json`
- `conditionTextJson` / `reflectionTextJson`
- 기타

### 질문 2: API 요청 형식
API 요청 시 plainText와 JSON을 모두 보내야 하나요?
- Option A: 둘 다 전송
- Option B: JSON만 전송 (백엔드에서 plainText 추출)

### 질문 3: 기존 데이터
기존 Post의 JSON 데이터 처리 방식:
- Option A: 프론트엔드에서 plainText/JSON 분기 처리
- Option B: 백엔드 마이그레이션 후 모든 Post가 JSON 보유

### 질문 4: 응답 형식
GET API 응답에 JSON 필드가 포함되나요?
```json
{
  "post": {
    "condition_text": "plain text",
    "condition_text_json": { "type": "doc", ... }
  }
}
```
