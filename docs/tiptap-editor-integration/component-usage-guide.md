# Tiptap 컴포넌트 사용 가이드

## 개요

이 문서는 프로젝트에 통합된 Tiptap 에디터 컴포넌트들의 사용법을 설명합니다.

## 컴포넌트 구조

```
src/shared/components/tiptap/
├── components/
│   ├── PostFormEditor.tsx      # 게시물 작성용 에디터
│   ├── CommentEditor.tsx       # 댓글 작성/수정용 에디터
│   ├── TodoEditor.tsx          # 할일 입력용 에디터
│   └── MentionList.tsx         # 멘션 드롭다운 UI
├── extensions/
│   ├── AutoLink.ts             # URL 자동 감지
│   ├── CustomMention.tsx       # 멘션 기능
│   ├── post-form-extensions.ts # PostForm 확장 로더
│   ├── comment-extensions.ts   # Comment 확장 로더
│   └── todo-extensions.ts      # Todo 확장 로더
├── hooks/
│   ├── useOptimizedEditor.ts   # 성능 최적화 에디터 훅
│   └── useAccessibleEditor.ts  # 접근성 지원 훅
├── styles/
│   └── tiptap.css             # 에디터 스타일
└── tiptap.types.ts            # TypeScript 타입 정의
```

## 1. PostFormEditor

게시물 작성에 사용되는 240px 고정 높이 에디터입니다.

### 사용법

```tsx
import { PostFormEditor } from '@/shared/components/tiptap/components/PostFormEditor';
import { useImageUpload } from '@/shared/hooks/useImageUpload';

function PostForm() {
  const [content, setContent] = useState('');
  const imageUploadHook = useImageUpload();
  
  const handleSubmit = () => {
    console.log('제출:', content);
  };

  return (
    <PostFormEditor
      value={content}
      onChange={setContent}
      placeholder="오늘 하루는 어떠셨나요?"
      onSubmit={handleSubmit}
      imageUploadHook={imageUploadHook}
      onImagePaste={(files) => imageUploadHook.uploadImages(files)}
      onImageDrop={(files) => imageUploadHook.uploadImages(files)}
      mentionConfig={{
        suggestions: userList,
        onMentionSelect: (user) => console.log('멘션:', user),
      }}
    />
  );
}
```

### 주요 Props

| Prop | 타입 | 설명 | 필수 |
|------|------|------|------|
| value | string | 에디터 내용 (HTML) | ✓ |
| onChange | (value: string) => void | 내용 변경 콜백 | ✓ |
| placeholder | string | 플레이스홀더 텍스트 | |
| onSubmit | () => void | Cmd+Enter 제출 콜백 | |
| imageUploadHook | any | 이미지 업로드 훅 인스턴스 | |
| onImagePaste | (files: File[]) => void | 이미지 붙여넣기 콜백 | |
| onImageDrop | (files: File[]) => void | 이미지 드래그앤드롭 콜백 | |
| mentionConfig | MentionConfig | 멘션 설정 | |
| disabled | boolean | 비활성화 상태 | |
| autoFocus | boolean | 자동 포커스 | |

### 기능

- **텍스트 서식**: Bold (Cmd/Ctrl+B)
- **목록**: 글머리 기호 목록 (-, * 자동 변환)
- **링크**: URL 자동 감지 및 변환
- **멘션**: @ 입력으로 사용자 멘션
- **이미지**: 붙여넣기, 드래그앤드롭 지원
- **제출**: Cmd/Meta+Enter

## 2. CommentEditor

댓글 작성 및 수정에 사용되는 동적 높이 에디터입니다.

### 사용법

```tsx
import { CommentEditor } from '@/shared/components/tiptap/components/CommentEditor';

// 새 댓글 작성
function NewComment() {
  const [content, setContent] = useState('');
  
  const handleSubmit = () => {
    console.log('댓글 제출:', content);
    setContent('');
  };

  return (
    <CommentEditor
      value={content}
      onChange={setContent}
      placeholder="댓글을 입력하세요..."
      mode="new"
      onSubmit={handleSubmit}
      minLines={1}
      maxLines={5}
    />
  );
}

// 댓글 수정
function EditComment({ comment }) {
  const [content, setContent] = useState(comment.content);
  
  const handleSave = () => {
    console.log('댓글 수정:', content);
  };
  
  const handleCancel = () => {
    setContent(comment.content);
  };

  return (
    <CommentEditor
      value={content}
      onChange={setContent}
      mode="edit"
      onSubmit={handleSave}
      onCancel={handleCancel}
      autoFocus={true}
    />
  );
}
```

### 주요 Props

| Prop | 타입 | 설명 | 필수 |
|------|------|------|------|
| value | string | 에디터 내용 (HTML) | ✓ |
| onChange | (value: string) => void | 내용 변경 콜백 | ✓ |
| mode | 'new' \| 'edit' | 작성/수정 모드 | |
| minLines | number | 최소 줄 수 (기본: 1) | |
| maxLines | number | 최대 줄 수 (기본: 5) | |
| onSubmit | () => void | Enter 제출 콜백 | |
| onCancel | () => void | Escape 취소 콜백 (수정 모드) | |
| imageUploadHook | any | 이미지 업로드 훅 | |
| enableImageUpload | boolean | 이미지 업로드 활성화 | |
| mentionConfig | MentionConfig | 멘션 설정 | |

### 기능

- **동적 높이**: 내용에 따라 자동 조절 (최소/최대 설정 가능)
- **키보드 단축키**:
  - Enter: 제출
  - Shift+Enter: 줄바꿈
  - Escape: 취소 (수정 모드)
- **이미지 업로드**: 붙여넣기, 드래그앤드롭
- **멘션**: @ 입력으로 사용자 멘션

## 3. TodoEditor

할일 입력에 사용되는 단일 라인 에디터입니다.

### 사용법

```tsx
import { TodoEditor } from '@/shared/components/tiptap/components/TodoEditor';

function TodoInput() {
  const [text, setText] = useState('');
  
  const handleSubmit = () => {
    console.log('할일 추가:', text);
    setText('');
  };

  return (
    <TodoEditor
      value={text}
      onChange={setText}
      placeholder="투두를 입력하세요..."
      onSubmit={handleSubmit}
      enableMentions={true}
      mentionConfig={{
        suggestions: userList,
        onMentionSelect: (user) => console.log('멘션:', user),
      }}
    />
  );
}
```

### 주요 Props

| Prop | 타입 | 설명 | 필수 |
|------|------|------|------|
| value | string | 에디터 내용 (HTML) | ✓ |
| onChange | (value: string) => void | 내용 변경 콜백 | ✓ |
| placeholder | string | 플레이스홀더 텍스트 | |
| onSubmit | () => void | Enter 제출 콜백 | |
| enableMentions | boolean | 멘션 기능 활성화 | |
| mentionConfig | MentionConfig | 멘션 설정 | |

### 기능

- **단일 라인**: 줄바꿈 방지
- **Bold 서식**: Cmd/Ctrl+B
- **멘션**: @ 입력으로 사용자 멘션 (선택적)
- **Enter 제출**: Enter 키로 즉시 제출

## 멘션 기능 사용법

### MentionConfig 타입

```typescript
interface MentionConfig {
  suggestions: MentionUser[];
  onMentionSelect?: (user: MentionUser) => void;
}

interface MentionUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}
```

### 멘션 사용 예시

```tsx
const mentionUsers: MentionUser[] = [
  { id: '1', name: '김철수', email: 'chulsoo@example.com', avatar: '/avatar1.jpg' },
  { id: '2', name: '이영희', email: 'younghee@example.com' },
  { id: '3', name: '박민수', email: 'minsoo@example.com' },
];

<PostFormEditor
  value={content}
  onChange={setContent}
  mentionConfig={{
    suggestions: mentionUsers,
    onMentionSelect: (user) => {
      console.log('선택된 사용자:', user);
      // 알림 전송 등의 추가 작업
    },
  }}
/>
```

## 성능 최적화

### 1. 동적 로딩

각 에디터는 필요한 확장만 동적으로 로드합니다:

- PostFormEditor: Bold, BulletList, AutoLink, Mention
- CommentEditor: Bold, BulletList, AutoLink, Mention
- TodoEditor: Bold, Mention (최소 기능)

### 2. 한글 입력 최적화

`useOptimizedEditor` 훅이 한글 입력 시 성능을 최적화합니다:
- Composition 이벤트 처리
- 업데이트 디바운싱
- 메모리 누수 방지

## 접근성

모든 에디터는 스크린 리더와 키보드 탐색을 지원합니다:

### ARIA 속성
- role="textbox"
- aria-label (각 에디터별 설명)
- aria-multiline="true"
- aria-readonly (편집 가능 상태)
- aria-invalid (빈 내용 표시)

### 키보드 탐색
- Tab/Shift+Tab: 에디터 간 이동
- 방향키: 텍스트 내 이동
- 멘션 드롭다운: 방향키로 선택, Enter로 확정

## 스타일 커스터마이징

### CSS 클래스

```css
/* 기본 에디터 */
.tiptap-editor {
  /* 공통 스타일 */
}

/* PostForm 에디터 */
.tiptap-editor--post-form {
  height: 240px;
  /* 추가 스타일 */
}

/* Comment 에디터 */
.tiptap-editor--comment {
  min-height: 60px;
  max-height: 300px;
  /* 추가 스타일 */
}

/* Todo 에디터 */
.tiptap-editor--todo {
  height: 24px;
  /* 추가 스타일 */
}
```

### 커스텀 className

```tsx
<PostFormEditor
  value={content}
  onChange={setContent}
  className="my-custom-class"
/>
```

## 마이그레이션 가이드

### 기존 textarea에서 마이그레이션

```tsx
// 기존 코드
<textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="내용을 입력하세요"
  onKeyDown={(e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  }}
/>

// Tiptap으로 변경
<PostFormEditor
  value={content}
  onChange={setContent}
  placeholder="내용을 입력하세요"
  onSubmit={handleSubmit}
/>
```

### HTML 콘텐츠 처리

Tiptap은 HTML 형식으로 콘텐츠를 저장합니다:

```tsx
// 순수 텍스트 추출
const plainText = content
  .replace(/<[^>]*>/g, '') // HTML 태그 제거
  .trim();

// 서버로 전송
const payload = {
  content: content, // HTML 형식
  contentFormat: 'html',
};
```

## 트러블슈팅

### 1. 에디터가 로드되지 않음

확인 사항:
- 필요한 패키지가 설치되었는지 확인
- 동적 import 에러 확인
- 콘솔 에러 메시지 확인

### 2. 한글 입력 시 끊김

이미 `useOptimizedEditor`에서 처리하고 있지만, 문제가 지속되면:
- 브라우저 개발자 도구에서 성능 프로파일링
- 불필요한 리렌더링 확인

### 3. 스타일이 적용되지 않음

확인 사항:
- `tiptap.css` import 여부
- CSS 클래스 충돌 확인
- Tailwind purge 설정

### 4. 멘션이 작동하지 않음

확인 사항:
- mentionUsers 배열이 올바른 형식인지
- enableMentions가 true인지 (TodoEditor)
- 사용자 목록이 비어있지 않은지

## 추가 리소스

- [Tiptap 공식 문서](https://tiptap.dev/)
- [프로젝트 요구사항 문서](/docs/tiptap-editor-integration/requirements.md)
- [백엔드 마이그레이션 가이드](/docs/tiptap-editor-integration/backend-migration-guide.md)