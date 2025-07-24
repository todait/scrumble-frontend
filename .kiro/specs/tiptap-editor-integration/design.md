# Tiptap 에디터 통합 설계 문서

## 개요

현재 프로젝트의 모든 textarea 기반 텍스트 입력 컴포넌트를 Tiptap 에디터로 교체하여 향상된 텍스트 편집 기능을 제공하면서도 기존의 모든 스타일과 동작을 완벽하게 유지하는 통합 시스템을 설계합니다. 이 설계는 성능 최적화, 접근성, 그리고 완벽한 하위 호환성을 보장하면서 사용자에게 더 풍부한 텍스트 편집 경험을 제공합니다.

## 아키텍처

### 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    Tiptap 에디터 통합 시스템                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostForm      │  │  CommentInput   │  │   TodoInput     │ │
│  │ (240px 고정)    │  │  (동적 높이)     │  │  (단일 라인)     │ │
│  │ ✓ 이미지 업로드  │  │ ✓ 이미지 업로드   │  │ ✗ 이미지 없음    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    공통 Tiptap 컴포넌트                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              BaseTiptapEditor                           │ │
│  │  - 공통 설정 및 스타일 관리                               │ │
│  │  - 확장 기능 조합 로직                                   │ │
│  │  - 이벤트 핸들링 추상화                                  │ │
│  │  - 이미지 업로드 통합 (선택적)                            │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Tiptap 확장 시스템                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Bold      │ │ BulletList  │ │  AutoLink   │ │ Mention │ │
│  │   확장      │ │    확장     │ │    확장     │ │   확장  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   이미지 업로드 통합 시스템                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           ImageUploadIntegration                        │ │
│  │  - 드래그 앤 드롭 이벤트 조율                             │ │
│  │  - 클립보드 이벤트 분기 처리                              │ │
│  │  - 업로드 상태 동기화                                    │ │
│  │  - PostForm, CommentInput만 지원                       │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      스타일 시스템                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              TiptapStyles                               │ │
│  │  - 기존 textarea 스타일 복제                             │ │
│  │  - 프로젝트별 커스텀 스타일                               │ │
│  │  - 반응형 및 접근성 스타일                               │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 컴포넌트 계층 구조

```
BaseTiptapEditor (추상 기본 클래스)
├── PostFormEditor (게시물 작성용 - 이미지 업로드 지원)
├── CommentEditor (댓글 입력/수정용 - 이미지 업로드 지원)
└── TodoEditor (할일 입력용 - 이미지 업로드 미지원)
```

## 컴포넌트 및 인터페이스

### 1. BaseTiptapEditor 컴포넌트

**목적**: 모든 Tiptap 에디터의 공통 기능과 설정을 관리하는 기본 컴포넌트

```typescript
interface BaseTiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  extensions?: Extension[];
  editorProps?: EditorProps;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;

  // 이미지 업로드 통합 (선택적)
  imageUploadConfig?: {
    enabled: boolean;
    onImageUpload?: (files: File[]) => void;
    uploadingImages?: UploadingImage[];
    completedImages?: ImageMetadata[];
  };

  // 멘션 설정
  mentionConfig?: {
    suggestions: MentionUser[];
    onMentionSelect?: (user: MentionUser) => void;
  };
}
```

### 2. PostFormEditor 컴포넌트

**목적**: 게시물 작성을 위한 고정 높이 에디터 (이미지 업로드 지원)

```typescript
interface PostFormEditorProps extends BaseTiptapEditorProps {
  minHeight?: number; // 기본값: 240px
  onSubmit?: () => void;

  // 이미지 업로드 필수
  imageUploadHook: UseImageUploadReturn;
  onImagePaste?: (files: File[]) => void;
  onImageDrop?: (files: File[]) => void;
}
```

### 3. CommentEditor 컴포넌트

**목적**: 댓글 입력 및 수정을 위한 동적 높이 에디터 (이미지 업로드 지원)

```typescript
interface CommentEditorProps extends BaseTiptapEditorProps {
  mode: 'create' | 'edit';
  minLines?: number; // 기본값: 1
  maxLines?: number; // 기본값: 5
  onSubmit?: () => void;
  onCancel?: () => void;

  // 이미지 업로드 선택적
  imageUploadHook?: UseImageUploadReturn;
  enableImageUpload?: boolean; // 기본값: true
}
```

### 4. TodoEditor 컴포넌트

**목적**: 할일 입력을 위한 단일 라인 에디터 (이미지 업로드 미지원)

```typescript
interface TodoEditorProps extends BaseTiptapEditorProps {
  onSubmit?: () => void;
  enableMentions?: boolean;

  // 이미지 업로드 명시적으로 비활성화
  // imageUploadConfig는 사용하지 않음
}
```

## 이미지 업로드 시스템 통합

### 이미지 업로드 통합 아키텍처

```typescript
interface ImageUploadIntegration {
  // 기존 이미지 업로드 훅과의 연동
  uploadHook: UseImageUploadReturn;

  // 컴포넌트별 이미지 지원 여부
  componentSupport: {
    PostForm: true;
    CommentInput: true;
    CommentEdit: true;
    TodoInput: false; // 명시적으로 비활성화
  };

  // Tiptap 에디터와의 이벤트 조율
  handlePaste: (event: ClipboardEvent) => boolean;
  handleDrop: (event: DragEvent) => boolean;

  // 이미지 메타데이터 관리
  images: ImageMetadata[];
  uploadingImages: UploadingImage[];

  // 상태 동기화
  syncWithEditor: (editor: Editor) => void;
}

interface TiptapImageHandling {
  // 이미지를 에디터 내부가 아닌 별도 영역으로 리다이렉트
  preventInlineImages: boolean;

  // 이미지 드롭 위치 감지 및 처리
  handleImageDrop: (event: DragEvent) => {
    isOverEditor: boolean;
    isOverUploadArea: boolean;
    preventDefault: boolean;
  };

  // 클립보드 이미지 처리 분기
  handleClipboardImage: (items: DataTransferItemList) => {
    hasImage: boolean;
    images: File[];
    shouldPreventDefault: boolean;
  };
}
```

### 이벤트 처리 우선순위

```typescript
enum EventPriority {
  IMAGE_UPLOAD = 1, // 이미지 업로드가 최우선 (PostForm, CommentInput만)
  TIPTAP_EDITOR = 2, // 텍스트 편집이 그 다음
  DEFAULT = 3, // 기본 브라우저 동작
}

interface EventCoordinator {
  // 컴포넌트 타입에 따른 이벤트 처리
  componentType: 'PostForm' | 'CommentInput' | 'TodoInput';

  registerHandler(event: string, handler: Function, priority: EventPriority): void;

  handleEvent(event: Event): void;

  // TodoInput의 경우 이미지 관련 이벤트 무시
  shouldHandleImageEvent(): boolean;
}
```

## 데이터 모델

### 에디터 설정 모델

```typescript
interface EditorConfig {
  extensions: Extension[];
  editorProps: EditorProps;
  styling: {
    className: string;
    customCSS?: string;
  };
  behavior: {
    allowLineBreaks: boolean;
    submitOnEnter: boolean;
    autoResize: boolean;
    allowImageUpload: boolean; // 컴포넌트별 설정
  };
}

interface ComponentSpecificConfig {
  PostForm: {
    minHeight: 240;
    allowImageUpload: true;
    extensions: ['Bold', 'BulletList', 'AutoLink', 'Mention'];
  };
  CommentInput: {
    dynamicHeight: true;
    maxLines: 5;
    allowImageUpload: true;
    extensions: ['Bold', 'BulletList', 'AutoLink', 'Mention'];
  };
  TodoInput: {
    singleLine: true;
    allowImageUpload: false; // 명시적으로 false
    extensions: ['Bold', 'Mention']; // 최소 기능만
  };
}
```

### 멘션 데이터 모델

```typescript
interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface MentionSuggestion {
  users: MentionUser[];
  loading: boolean;
  query: string;
}
```

## 확장 기능 시스템

### 1. Bold 확장

**기능**: Cmd/Ctrl + B로 굵은 글씨 적용
**구현**: Tiptap의 기본 Bold 확장 사용
**스타일**: 기존 프로젝트의 font-weight 스타일 적용

### 2. BulletList 확장

**기능**: "-" 또는 "\*"로 시작하는 자동 목록 생성
**구현**: Tiptap의 BulletList + ListItem 확장 조합
**스타일**: 기본 브라우저 스타일 대신 프로젝트 커스텀 스타일 적용

### 3. AutoLink 확장

**기능**: URL 자동 감지 및 링크 변환
**구현**: 커스텀 AutoLink 확장 개발
**특수 처리**:

- GitHub PR/Issue 링크 감지
- Clickup 작업 링크 감지
- 기존 프로젝트 링크 스타일 적용

```typescript
interface LinkDetectionRule {
  pattern: RegExp;
  transform: (match: string) => string;
  className?: string;
}

const GITHUB_PATTERN = /https?:\/\/github\.com\/[\w-]+\/[\w-]+\/(pull|issues)\/\d+/g;
const CLICKUP_PATTERN = /https?:\/\/app\.clickup\.com\/t\/[\w]+/g;
```

### 4. Mention 확장

**기능**: @ 기호로 사용자 멘션
**구현**: 커스텀 Mention 확장 + 드롭다운 UI
**특징**:

- 실시간 사용자 검색
- 키보드 네비게이션 지원
- 터치 인터페이스 최적화

## 스타일 시스템

### 스타일 일치 전략

```css
/* 기존 textarea 스타일 추출 */
:root {
  --textarea-font-family: inherit;
  --textarea-font-size: 14px;
  --textarea-line-height: 1.5;
  --textarea-color: #374151;
  --textarea-padding: 12px;
  --textarea-border: 1px solid #d1d5db;
  --textarea-border-radius: 8px;
  --textarea-background: #ffffff;
  --textarea-placeholder-color: #9ca3af;
}

/* Tiptap 에디터에 동일 스타일 적용 */
.tiptap-editor {
  font-family: var(--textarea-font-family);
  font-size: var(--textarea-font-size);
  line-height: var(--textarea-line-height);
  color: var(--textarea-color);
  padding: var(--textarea-padding);
  border: var(--textarea-border);
  border-radius: var(--textarea-border-radius);
  background: var(--textarea-background);
}

/* 컴포넌트별 특수 스타일 */
.tiptap-editor--post-form {
  min-height: 240px;
}

.tiptap-editor--comment {
  min-height: calc(var(--textarea-line-height) * 1em + var(--textarea-padding) * 2);
  max-height: calc(var(--textarea-line-height) * 5em + var(--textarea-padding) * 2);
}

.tiptap-editor--todo {
  overflow: hidden;
  white-space: nowrap;
}
```

## 보안 및 콘텐츠 검증

```typescript
interface SecurityConfig {
  // XSS 방지
  sanitization: {
    enabled: boolean;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
    sanitizeOnPaste: boolean;
    sanitizeOnSubmit: boolean;
  };

  // 콘텐츠 검증
  validation: {
    maxLength: number;
    allowedFileTypes: string[]; // PostForm, CommentInput만 적용
    maxFileSize: number;
    maxImageCount: number;
  };

  // CSP 정책 준수
  contentSecurityPolicy: {
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
  };
}

class ContentSanitizer {
  sanitizeHTML(html: string): string;
  validateContent(content: string): ValidationResult;
  checkForMaliciousPatterns(text: string): boolean;
  stripDisallowedTags(html: string): string;
}
```

## 성능 최적화

### 번들 크기 최적화

```typescript
// 컴포넌트별 확장 설정
const EXTENSION_CONFIG = {
  PostForm: {
    extensions: [Bold, BulletList, AutoLink, Mention],
    imageUpload: true,
  },
  CommentInput: {
    extensions: [Bold, BulletList, AutoLink, Mention],
    imageUpload: true,
  },
  TodoInput: {
    extensions: [Bold, Mention], // 최소한의 기능만
    imageUpload: false,
  },
};

// 동적 임포트를 통한 코드 분할
const loadExtensions = async (componentType: string) => {
  const config = EXTENSION_CONFIG[componentType];
  const extensions = await Promise.all(
    config.extensions.map(ext => import(`@tiptap/extension-${ext.name}`))
  );
  return extensions;
};
```

### 런타임 성능 최적화

```typescript
interface PerformanceOptimization {
  // 메모이제이션
  memoization: {
    editorInstances: Map<string, Editor>;
    extensionConfigs: Map<string, Extension[]>;
    styleCalculations: Map<string, CSSStyleDeclaration>;
  };

  // 메모리 관리
  memoryManagement: {
    cleanupOnUnmount: boolean;
    releaseEventListeners: boolean;
    clearImageCache: boolean;
  };

  // 한글 입력 최적화
  imeOptimization: {
    compositionHandling: boolean;
    deferredUpdates: boolean;
    batchedChanges: boolean;
  };
}
```

## 접근성 지원

```typescript
interface AccessibilityConfig {
  // 키보드 네비게이션
  keyboard: {
    shortcuts: Record<string, string>;
    tabNavigation: boolean;
    escapeHandling: boolean;
  };

  // 스크린 리더
  screenReader: {
    announcements: boolean;
    ariaLabels: Record<string, string>;
    liveRegions: boolean;
  };

  // 시각적 피드백
  visualFeedback: {
    focusIndicators: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
  };
}
```

## 자동 저장 및 버전 관리

```typescript
interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds

  // 저장 전략
  strategy: 'debounce' | 'throttle' | 'immediate';

  // 로컬 스토리지 백업
  localBackup: {
    enabled: boolean;
    key: string;
    maxSize: number;
  };

  // 버전 관리
  versioning: {
    enabled: boolean;
    maxVersions: number;
    comparisonView: boolean;
  };
}

class DraftManager {
  // 컴포넌트별 자동 저장 설정
  componentConfigs: {
    PostForm: { interval: 30000; versioning: true };
    CommentInput: { interval: 10000; versioning: false };
    TodoInput: { interval: 5000; versioning: false };
  };

  saveDraft(componentId: string, content: string): Promise<void>;
  loadDraft(componentId: string): Promise<string | null>;
  clearDraft(componentId: string): Promise<void>;
}
```

## 로깅 및 모니터링

```typescript
interface LoggingConfig {
  // 성능 메트릭스
  performance: {
    trackTypingLatency: boolean;
    trackRenderTime: boolean;
    trackMemoryUsage: boolean;
    trackImageUploadTime: boolean; // PostForm, CommentInput만
  };

  // 사용자 행동 분석
  analytics: {
    trackFeatureUsage: boolean;
    trackMentionUsage: boolean;
    trackLinkConversion: boolean;
    trackImageUploadCount: boolean;
  };

  // 에러 리포팅
  errorReporting: {
    provider: 'sentry' | 'custom';
    sampleRate: number;
    includeUserContext: boolean;
  };
}
```

## 국제화(i18n) 지원

```typescript
interface I18nConfig {
  // 지원 언어
  supportedLocales: ['ko', 'en', 'ja', 'zh'];
  defaultLocale: 'ko';

  // 번역 리소스
  translations: {
    placeholder: {
      PostForm: Record<string, string>;
      CommentInput: Record<string, string>;
      TodoInput: Record<string, string>;
    };
    mentionSearch: Record<string, string>;
    errors: Record<string, string>;
    imageUpload: Record<string, string>; // PostForm, CommentInput만
  };

  // RTL 언어 지원
  rtlSupport: boolean;
}
```

## 에러 처리 및 복구

```typescript
interface ErrorHandling {
  // 에러 유형별 처리
  handlers: {
    initializationError: (error: Error) => void;
    extensionLoadError: (error: Error) => void;
    imageUploadError: (error: Error) => void;
    networkError: (error: Error) => void;
  };

  // 폴백 메커니즘
  fallback: {
    toTextarea: boolean;
    preserveContent: boolean;
    notifyUser: boolean;
  };

  // 자동 복구
  recovery: {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
  };
}
```

## 마이그레이션 전략

### 단계별 마이그레이션

**Phase 1**: PostForm 컴포넌트 교체

- 가장 복잡한 컴포넌트 (이미지 업로드 포함)
- 충분한 테스트 후 다음 단계 진행

**Phase 2**: CommentInput/CommentSection 교체

- 댓글 입력 및 수정 기능 통합
- 이미지 업로드 선택적 지원

**Phase 3**: TodoInput 교체

- 가장 단순한 컴포넌트 (이미지 없음)
- 단일 라인 입력만 지원

### 하위 호환성 보장

```typescript
interface BackwardCompatibility {
  // Props 인터페이스 유지
  maintainProps: boolean;

  // 이벤트 핸들러 보존
  preserveEventHandlers: string[];

  // CSS 클래스 유지
  keepCssClasses: boolean;

  // API 호환성
  apiCompatibility: {
    methodNames: 'same' | 'aliased';
    returnTypes: 'same' | 'wrapped';
  };
}
```

## 테스팅 전략

### 컴포넌트별 테스트

```typescript
interface TestingStrategy {
  // 단위 테스트
  unitTests: {
    components: ['PostFormEditor', 'CommentEditor', 'TodoEditor'];
    extensions: ['Bold', 'BulletList', 'AutoLink', 'Mention'];
    utilities: ['ContentSanitizer', 'EventCoordinator'];
  };

  // 통합 테스트
  integrationTests: {
    imageUpload: ['PostForm', 'CommentInput']; // TodoInput 제외
    mentionSystem: ['all'];
    autoSave: ['all'];
  };

  // E2E 테스트
  e2eTests: {
    userFlows: ['createPost', 'editComment', 'addTodo'];
    crossBrowser: ['Chrome', 'Firefox', 'Safari', 'Edge'];
    mobileDevices: ['iOS', 'Android'];
  };

  // 시각적 회귀 테스트
  visualRegression: {
    components: ['all'];
    breakpoints: ['mobile', 'tablet', 'desktop'];
    themes: ['light', 'dark'];
  };
}
```

## 설계 결정 및 근거

### 1. TodoInput 이미지 업로드 비활성화

**결정**: TodoInput에서는 이미지 업로드 기능을 완전히 제거
**근거**:

- 할일의 단순성과 명확성 유지
- 빠른 입력과 목록 관리에 집중
- 불필요한 복잡성 제거

### 2. 컴포넌트별 확장 차별화

**결정**: 각 컴포넌트의 용도에 맞는 최적화된 확장 세트 제공
**근거**:

- 번들 크기 최적화
- 사용자 경험 개선
- 성능 향상

### 3. 이미지 업로드 별도 영역 유지

**결정**: 에디터 내부가 아닌 별도 영역에서 이미지 관리
**근거**:

- 기존 시스템과의 호환성
- 이미지 관리의 일관성
- 사용자 인터페이스의 명확성

### 4. 멘션 기능 전체 적용

**결정**: 모든 컴포넌트에 멘션 기능 제공
**근거**:

- 협업 기능의 일관성
- 사용자 커뮤니케이션 향상
- TodoInput에서도 담당자 지정 가능

이 설계는 각 컴포넌트의 특성을 고려하여 최적화된 기능을 제공하면서도 전체적인 일관성을 유지하며, 특히 기존 이미지 업로드 시스템과의 완벽한 통합을 보장합니다.
