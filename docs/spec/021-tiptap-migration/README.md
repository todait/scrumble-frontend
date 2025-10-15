# Tiptap 마이그레이션 설계 문서

## 1. 개요

CheckIn/Out Post의 작성 및 뷰어 기능을 기존 일반 textarea 방식에서 Tiptap 리치 에디터로 마이그레이션합니다.

### 목표
- 기본적인 텍스트 편집 기능(링크, bold, italic, list 등) 지원
- 기존 스타일(input 태그 스타일)과 일관성 유지
- 드래그앤드롭 이미지 기능 유지
- JSON 기반 데이터 저장 및 plainText 추출
- 재사용 가능한 컴포넌트 구조 (TodoInput, CommentInput에서도 활용)

### 범위
- ✅ 프론트엔드 마이그레이션
- ❌ 백엔드 마이그레이션 (별도 진행)

---

## 2. 현재 구조 분석

### 2.1 에디터 컴포넌트

**PostForm.tsx** (`src/shared/components/ui/PostForm.tsx`)
- 현재 `<textarea>` 기반
- 이미지 업로드/미리보기 기능 내장
- 드래그앤드롭, 클립보드 붙여넣기 지원
- `message: string` 형태로 데이터 처리

**CheckInForm.tsx** / **CheckOutForm.tsx**
- PostForm을 래핑
- CheckInForm은 추가로 ScoreSelector 포함
- 동일한 데이터 구조 사용 (`message: string`)

### 2.2 뷰어 컴포넌트

**PostContent.tsx** (`src/features/feed/components/PostContent.tsx`)
- 현재 `<p className="whitespace-pre-wrap">` 로 표시
- CheckIn: `post.conditionText` 사용
- CheckOut: `post.reflectionText` 사용
- 텍스트를 그대로 렌더링

### 2.3 데이터 타입

**현재 필드:**
```typescript
interface Post {
  conditionText?: string;  // CheckIn 메시지
  reflectionText?: string; // CheckOut 메시지
}
```

**백엔드 준비 완료:**
- `condition_text_json` (CheckIn용)
- `reflection_text_json` (CheckOut용)
- 기존 `condition_text`, `reflection_text` 필드 유지

### 2.4 현재 사용하지 않는 Tiptap
- `package.json` 확인 결과: **Tiptap 미설치**
- 새로 설치 필요

---

## 3. 설계 결정 사항

### 3.1 필요한 확인 사항 (질문)

#### Q1: 백엔드 JSON 컬럼명 확인
백엔드에서 준비된 JSON 컬럼 이름이 정확히 무엇인가요?
- Option A: `condition_text_json`, `reflection_text_json`
- Option B: `conditionTextJson`, `reflectionTextJson`
- Option C: 기타 (직접 입력)

#### Q2: API 요청/응답 형식
API 요청 시 JSON과 plainText를 모두 보내야 하나요?
```typescript
// Option A: 둘 다 전송
{
  conditionText: "plain text",
  conditionTextJson: { type: "doc", content: [...] }
}

// Option B: JSON만 전송 (백엔드에서 plainText 추출)
{
  conditionTextJson: { type: "doc", content: [...] }
}
```

#### Q3: 기존 데이터 처리
기존 Post의 `conditionText`/`reflectionText`가 JSON이 아닌 경우:
- Option A: plainText로 처리 (JSON 없으면 plainText로 표시)
- Option B: 프론트엔드에서 plainText → Tiptap JSON 변환
- Option C: 백엔드에서 마이그레이션 후 모든 Post가 JSON을 가짐

#### Q4: 이미지 업로드 위치
이미지는 Tiptap 에디터 내부에 inline으로 넣을까요, 아니면 기존처럼 별도 영역에 표시할까요?
- Option A: 기존 방식 유지 (별도 ImagePreviewList, 에디터 외부)
- Option B: Tiptap 에디터 내부에 inline 이미지로 표시

---

## 4. 제안하는 컴포넌트 구조

### 4.1 컴포넌트 계층

```
TiptapEditor (재사용 가능한 기본 에디터)
├── TiptapEditorCore (Tiptap 코어 로직)
└── TiptapEditorToolbar (옵션 툴바)

TiptapViewer (재사용 가능한 뷰어)
└── TiptapViewerCore (읽기 전용 Tiptap)

PostForm (PostForm 리팩토링)
├── TiptapEditor
└── ImagePreviewList (기존 유지)

CheckInForm / CheckOutForm (변경 최소화)
└── PostForm

PostContent (뷰어 부분 수정)
└── TiptapViewer
```

### 4.2 재사용성 고려

**TiptapEditor.tsx** - 재사용 가능한 에디터
```typescript
interface TiptapEditorProps {
  content?: JSONContent;        // Tiptap JSON
  onChange?: (json: JSONContent, text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  editable?: boolean;
  minHeight?: number;
  extensions?: Extension[];     // 커스텀 확장 가능
  showToolbar?: boolean;
  className?: string;
}
```

**TiptapViewer.tsx** - 재사용 가능한 뷰어
```typescript
interface TiptapViewerProps {
  content: JSONContent | string; // JSON 우선, fallback plainText
  className?: string;
  maxLines?: number;             // 라인 제한 (더보기 기능)
}
```

---

## 5. 데이터 흐름

### 5.1 작성 (Create/Update)

```
User Input
  ↓
TiptapEditor
  ↓ onChange
PostForm
  ↓ { message: string, messageJson: JSONContent, images: [] }
CheckInForm/CheckOutForm
  ↓ { score?, message, messageJson, images }
API Request
  ↓ { conditionText, conditionTextJson?, images }
Backend
```

### 5.2 뷰어 (Read)

```
API Response
  ↓ { conditionText, conditionTextJson?, ... }
postTransform.utils.ts
  ↓ { post.conditionText, post.conditionTextJson }
PostContent
  ↓
TiptapViewer (conditionTextJson 또는 conditionText)
```

---

## 6. 구현 계획

### 6.1 Phase 1: Tiptap 설치 및 기본 컴포넌트

1. Tiptap 패키지 설치
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
   ```

2. 기본 컴포넌트 생성
   - `src/shared/components/tiptap/TiptapEditor.tsx`
   - `src/shared/components/tiptap/TiptapViewer.tsx`
   - `src/shared/components/tiptap/extensions/` (커스텀 확장)
   - `src/shared/components/tiptap/styles/` (스타일)

### 6.2 Phase 2: PostForm 리팩토링

1. PostForm에 TiptapEditor 통합
2. 데이터 구조 변경
   ```typescript
   interface PostFormData {
     message: string;           // plainText (기존 호환)
     messageJson?: JSONContent; // Tiptap JSON (새로 추가)
     images: ImageMetadata[];
   }
   ```
3. 이미지 업로드 기능 유지 (별도 영역)

### 6.3 Phase 3: CheckInForm/CheckOutForm 업데이트

1. CheckInForm/CheckOutForm에서 새로운 데이터 구조 처리
2. API 요청 시 JSON 포함
   ```typescript
   createCheckIn({
     conditionText: data.message,
     conditionTextJson: data.messageJson,
     images: data.images
   })
   ```

### 6.4 Phase 4: PostContent 뷰어 업데이트

1. PostContent에서 TiptapViewer 사용
2. JSON 우선, plainText fallback
3. "더보기" 기능 TiptapViewer 내부로 이동

### 6.5 Phase 5: 타입 정의 업데이트

1. `src/shared/types/post.ts` 업데이트
   ```typescript
   interface Post {
     conditionText?: string;
     conditionTextJson?: JSONContent; // 추가
     reflectionText?: string;
     reflectionTextJson?: JSONContent; // 추가
   }
   ```

2. API Request/Response 타입 업데이트

### 6.6 Phase 6: 테스트 및 검증

1. 작성 기능 테스트
2. 뷰어 기능 테스트
3. 기존 Post 호환성 테스트
4. 드래그앤드롭 이미지 테스트

---

## 7. Tiptap 설정

### 7.1 Extensions

기본적인 기능만 사용:
- **StarterKit**: 기본 마크/노드 (paragraph, heading, bold, italic, etc.)
- **Link**: 링크 기능
- **Placeholder**: placeholder 텍스트

### 7.2 스타일 가이드

- 기존 `<textarea>` 스타일과 일관성 유지
- 최소한의 툴바 (또는 툴바 없이 단축키만)
- 기본 폰트/사이즈: `text-base md:text-[15px]`
- Padding: `p-[10px]`

---

## 8. 주의사항

1. **점진적 마이그레이션**
   - JSON과 plainText를 모두 저장하여 롤백 가능
   - 기존 Post도 계속 표시 가능

2. **성능**
   - Tiptap은 무겁지 않지만, 많은 Post를 렌더링할 때 주의
   - 필요시 virtualization 고려

3. **접근성**
   - 키보드 단축키 지원
   - ARIA 레이블 추가

4. **이미지 처리**
   - 현재 구조 유지 (별도 ImagePreviewList)
   - 향후 inline 이미지 지원 고려

---

## 9. 향후 확장 가능성

1. **TodoInput/TodoItem**
   - TiptapEditor를 TodoInput에서 재사용
   - TiptapViewer를 TodoItem에서 재사용

2. **CommentInput/CommentItem**
   - 동일한 컴포넌트 재사용

3. **추가 기능**
   - 멘션 (@username)
   - 코드 블록
   - 체크리스트
   - 테이블

---

## 10. 타임라인 (예상)

- Phase 1: 2일 (Tiptap 설치 및 기본 컴포넌트)
- Phase 2: 2일 (PostForm 리팩토링)
- Phase 3: 1일 (CheckInForm/CheckOutForm)
- Phase 4: 1일 (PostContent 뷰어)
- Phase 5: 1일 (타입 정의)
- Phase 6: 2일 (테스트 및 검증)

**총 예상: 9일**

---

## 11. 참고 자료

- [Tiptap 공식 문서](https://tiptap.dev/)
- [Tiptap React 가이드](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Tiptap Extensions](https://tiptap.dev/docs/editor/extensions/overview)
