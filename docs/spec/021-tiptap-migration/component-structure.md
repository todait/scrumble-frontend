# Tiptap 컴포넌트 구조 상세 설계

## 1. 컴포넌트 트리

```
src/shared/components/tiptap/
├── TiptapEditor.tsx           # 재사용 가능한 에디터 컴포넌트
├── TiptapViewer.tsx           # 재사용 가능한 뷰어 컴포넌트
├── TiptapToolbar.tsx          # 옵션 툴바 컴포넌트
├── extensions/
│   ├── index.ts               # 기본 extensions 설정
│   └── custom-link.ts         # 커스텀 링크 설정 (옵션)
├── hooks/
│   ├── useTiptapEditor.ts     # Tiptap 에디터 훅
│   └── useTiptapContent.ts    # 컨텐츠 변환 유틸리티 훅
└── styles/
    └── tiptap.css             # Tiptap 스타일
```

---

## 2. TiptapEditor 컴포넌트

### 2.1 기본 인터페이스

```typescript
import type { Editor, JSONContent } from '@tiptap/react';
import type { Extension } from '@tiptap/core';

export interface TiptapEditorProps {
  /** 초기 컨텐츠 (Tiptap JSON 형식) */
  content?: JSONContent | null;
  
  /** 변경 이벤트 핸들러 */
  onChange?: (json: JSONContent, plainText: string, editor: Editor) => void;
  
  /** placeholder 텍스트 */
  placeholder?: string;
  
  /** 비활성화 여부 */
  disabled?: boolean;
  
  /** 편집 가능 여부 */
  editable?: boolean;
  
  /** 최소 높이 (px) */
  minHeight?: number;
  
  /** 최대 높이 (px) */
  maxHeight?: number;
  
  /** 커스텀 확장 */
  extensions?: Extension[];
  
  /** 툴바 표시 여부 */
  showToolbar?: boolean;
  
  /** 커스텀 클래스명 */
  className?: string;
  
  /** 에디터 클릭 이벤트 */
  onEditorClick?: () => void;
  
  /** 포커스 이벤트 */
  onFocus?: () => void;
  
  /** 블러 이벤트 */
  onBlur?: () => void;
  
  /** 키보드 이벤트 (CMD+Enter 등) */
  onKeyDown?: (event: KeyboardEvent, editor: Editor) => boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps>;
```

### 2.2 구현 예시

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useEffect } from 'react';
import { getDefaultExtensions } from './extensions';
import type { TiptapEditorProps } from './types';
import './styles/tiptap.css';

export const TiptapEditor = ({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  disabled = false,
  editable = true,
  minHeight = 240,
  maxHeight,
  extensions: customExtensions = [],
  showToolbar = false,
  className = '',
  onEditorClick,
  onFocus,
  onBlur,
  onKeyDown,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [...getDefaultExtensions(placeholder), ...customExtensions],
    content,
    editable: editable && !disabled,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content prose prose-sm max-w-none focus:outline-none',
      },
      handleClick: () => {
        onEditorClick?.();
        return false;
      },
      handleKeyDown: (view, event) => {
        if (onKeyDown) {
          return onKeyDown(event, editor!);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON();
        const text = editor.getText();
        onChange(json, text, editor);
      }
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable && !disabled);
    }
  }, [editable, disabled, editor]);

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      {showToolbar && editor && <TiptapToolbar editor={editor} />}
      <div
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflow: maxHeight ? 'auto' : undefined,
        }}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
```

---

## 3. TiptapViewer 컴포넌트

### 3.1 기본 인터페이스

```typescript
import type { JSONContent } from '@tiptap/react';

export interface TiptapViewerProps {
  /** 표시할 컨텐츠 (JSON 우선, 없으면 plainText) */
  content: JSONContent | string | null;
  
  /** plainText fallback */
  fallbackText?: string;
  
  /** 최대 라인 수 (더보기 기능) */
  maxLines?: number;
  
  /** 최대 글자 수 */
  maxLength?: number;
  
  /** 커스텀 클래스명 */
  className?: string;
  
  /** "더보기" 버튼 텍스트 */
  expandText?: string;
  
  /** 초기 확장 상태 */
  initialExpanded?: boolean;
  
  /** 확장 상태 변경 핸들러 */
  onExpandChange?: (expanded: boolean) => void;
}

export const TiptapViewer: React.FC<TiptapViewerProps>;
```

### 3.2 구현 예시

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useMemo, useState } from 'react';
import { getViewerExtensions } from './extensions';
import type { TiptapViewerProps } from './types';
import './styles/tiptap.css';

export const TiptapViewer = ({
  content,
  fallbackText,
  maxLength,
  className = '',
  expandText = '...더보기',
  initialExpanded = false,
  onExpandChange,
}: TiptapViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // JSON인지 string인지 판단
  const isJsonContent = useMemo(() => {
    return content && typeof content === 'object' && 'type' in content;
  }, [content]);

  // plainText로 변환
  const plainText = useMemo(() => {
    if (isJsonContent) {
      // JSON에서 text 추출
      return extractTextFromJson(content as JSONContent);
    }
    return (content as string) || fallbackText || '';
  }, [content, fallbackText, isJsonContent]);

  // 잘라야 하는지 판단
  const shouldTruncate = maxLength && plainText.length > maxLength && !isExpanded;
  const truncatedContent = shouldTruncate
    ? plainText.slice(0, maxLength)
    : plainText;

  // Tiptap viewer 에디터 (읽기 전용)
  const editor = useEditor({
    extensions: getViewerExtensions(),
    content: isJsonContent ? content : { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: truncatedContent }] }] },
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap-viewer-content prose prose-sm max-w-none',
      },
    },
  });

  const handleExpand = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  return (
    <div className={`tiptap-viewer-wrapper ${className}`}>
      <EditorContent editor={editor} />
      {shouldTruncate && (
        <button
          onClick={handleExpand}
          className="ml-1 text-[15px] font-medium text-[#A0A0A0] hover:text-[#808080]"
        >
          {expandText}
        </button>
      )}
    </div>
  );
};

// JSON에서 plainText 추출 유틸리티
function extractTextFromJson(json: JSONContent): string {
  if (!json.content) return '';
  
  return json.content
    .map(node => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return extractTextFromJson(node);
      return '';
    })
    .join('');
}
```

---

## 4. Extensions 설정

### 4.1 기본 Extensions

```typescript
// src/shared/components/tiptap/extensions/index.ts

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { Extension } from '@tiptap/core';

export function getDefaultExtensions(placeholder?: string): Extension[] {
  return [
    StarterKit.configure({
      // 기본 기능만 사용
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: true,
      orderedList: true,
      bold: true,
      italic: true,
      strike: true,
      code: false, // 코드 블록 비활성화
      codeBlock: false,
      blockquote: false, // 인용구 비활성화 (필요시 활성화)
      horizontalRule: false,
      hardBreak: true,
      dropcursor: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-purple-600 hover:underline',
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
  ];
}

export function getViewerExtensions(): Extension[] {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: true,
      orderedList: true,
      bold: true,
      italic: true,
      strike: true,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      hardBreak: true,
      dropcursor: false,
    }),
    Link.configure({
      openOnClick: true, // 뷰어에서는 링크 클릭 가능
      HTMLAttributes: {
        class: 'text-purple-600 hover:underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  ];
}
```

---

## 5. Toolbar 컴포넌트 (옵션)

### 5.1 기본 인터페이스

```typescript
import type { Editor } from '@tiptap/react';

export interface TiptapToolbarProps {
  editor: Editor;
  className?: string;
}

export const TiptapToolbar: React.FC<TiptapToolbarProps>;
```

### 5.2 구현 예시

```typescript
'use client';

import type { Editor } from '@tiptap/react';
import { RiBold, RiItalic, RiListUnordered, RiListOrdered, RiLink } from '@remixicon/react';

interface TiptapToolbarProps {
  editor: Editor;
  className?: string;
}

export const TiptapToolbar = ({ editor, className = '' }: TiptapToolbarProps) => {
  const buttons = [
    {
      icon: RiBold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      label: 'Bold',
    },
    {
      icon: RiItalic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      label: 'Italic',
    },
    {
      icon: RiListUnordered,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      label: 'Bullet List',
    },
    {
      icon: RiListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      label: 'Ordered List',
    },
    {
      icon: RiLink,
      onClick: () => {
        const url = window.prompt('URL을 입력하세요:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive('link'),
      label: 'Link',
    },
  ];

  return (
    <div className={`flex items-center gap-1 border-b border-gray-200 p-2 ${className}`}>
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={`rounded p-2 transition-colors ${
            button.isActive
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={button.label}
        >
          <button.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};
```

---

## 6. 스타일

### 6.1 Tiptap 기본 스타일

```css
/* src/shared/components/tiptap/styles/tiptap.css */

/* 에디터 래퍼 */
.tiptap-editor-wrapper {
  @apply w-full;
}

/* 에디터 컨텐츠 */
.tiptap-editor-content {
  @apply w-full resize-none border-none p-[10px] text-base text-black outline-none;
  @apply md:text-[15px];
  line-height: 160%;
  color: #1D1D1F;
  font-weight: 400;
}

/* Placeholder */
.tiptap-editor-content p.is-editor-empty:first-child::before {
  @apply text-gray-400;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 뷰어 래퍼 */
.tiptap-viewer-wrapper {
  @apply w-full;
}

/* 뷰어 컨텐츠 */
.tiptap-viewer-content {
  @apply text-[15px];
  line-height: 160%;
  color: #1D1D1F;
  font-weight: 400;
}

/* 링크 스타일 */
.tiptap-editor-content a,
.tiptap-viewer-content a {
  @apply text-purple-600 hover:underline;
}

/* 리스트 스타일 */
.tiptap-editor-content ul,
.tiptap-viewer-content ul {
  @apply list-disc pl-6;
}

.tiptap-editor-content ol,
.tiptap-viewer-content ol {
  @apply list-decimal pl-6;
}

/* Bold, Italic */
.tiptap-editor-content strong,
.tiptap-viewer-content strong {
  @apply font-bold;
}

.tiptap-editor-content em,
.tiptap-viewer-content em {
  @apply italic;
}

/* 단락 간격 */
.tiptap-editor-content p,
.tiptap-viewer-content p {
  @apply mb-2 last:mb-0;
}
```

---

## 7. Hooks

### 7.1 useTiptapContent Hook

```typescript
// src/shared/components/tiptap/hooks/useTiptapContent.ts

import { useMemo } from 'react';
import type { JSONContent } from '@tiptap/react';

export function useTiptapContent(content: JSONContent | string | null) {
  const isJson = useMemo(() => {
    return content && typeof content === 'object' && 'type' in content;
  }, [content]);

  const plainText = useMemo(() => {
    if (isJson) {
      return extractTextFromJson(content as JSONContent);
    }
    return (content as string) || '';
  }, [content, isJson]);

  return {
    isJson,
    plainText,
    jsonContent: isJson ? (content as JSONContent) : null,
  };
}

function extractTextFromJson(json: JSONContent): string {
  if (!json.content) return '';
  
  return json.content
    .map(node => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return extractTextFromJson(node);
      return '';
    })
    .join('');
}
```

---

## 8. 재사용 시나리오

### 8.1 PostForm에서 사용

```typescript
// src/shared/components/ui/PostForm.tsx

import { TiptapEditor } from '@/shared/components/tiptap';

export const PostForm = ({ ... }: PostFormProps) => {
  const [messageJson, setMessageJson] = useState<JSONContent | null>(null);
  const [messagePlainText, setMessagePlainText] = useState('');

  const handleEditorChange = (json: JSONContent, text: string) => {
    setMessageJson(json);
    setMessagePlainText(text);
    
    if (onChange) {
      onChange({ 
        message: text, 
        messageJson: json, 
        images: completedImages 
      });
    }
  };

  return (
    <div>
      <TiptapEditor
        content={messageJson}
        onChange={handleEditorChange}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={240}
      />
      {/* 이미지 업로드 영역 */}
    </div>
  );
};
```

### 8.2 PostContent에서 사용

```typescript
// src/features/feed/components/PostContent.tsx

import { TiptapViewer } from '@/shared/components/tiptap';

export function PostContent({ post }: PostContentProps) {
  const content = post.conditionTextJson || post.conditionText;
  
  return (
    <div>
      <TiptapViewer
        content={content}
        fallbackText={post.conditionText}
        maxLength={200}
        initialExpanded={isDetailView}
      />
    </div>
  );
}
```

### 8.3 TodoInput에서 사용 (향후)

```typescript
// src/features/todo/components/TodoInput.tsx

import { TiptapEditor } from '@/shared/components/tiptap';

export const TodoInput = ({ ... }: TodoInputProps) => {
  return (
    <TiptapEditor
      content={content}
      onChange={handleChange}
      placeholder="할 일을 입력하세요..."
      minHeight={60}
      showToolbar={false}
    />
  );
};
```

### 8.4 CommentInput에서 사용 (향후)

```typescript
// src/shared/components/comment/CommentInput.tsx

import { TiptapEditor } from '@/shared/components/tiptap';

export const CommentInput = ({ ... }: CommentInputProps) => {
  return (
    <TiptapEditor
      content={content}
      onChange={handleChange}
      placeholder="댓글을 입력하세요..."
      minHeight={80}
      showToolbar={false}
    />
  );
};
```

---

## 9. 타입 정의

### 9.1 공통 타입

```typescript
// src/shared/components/tiptap/types.ts

import type { Editor, JSONContent } from '@tiptap/react';
import type { Extension } from '@tiptap/core';

export type { Editor, JSONContent, Extension };

export interface TiptapEditorProps {
  content?: JSONContent | null;
  onChange?: (json: JSONContent, plainText: string, editor: Editor) => void;
  placeholder?: string;
  disabled?: boolean;
  editable?: boolean;
  minHeight?: number;
  maxHeight?: number;
  extensions?: Extension[];
  showToolbar?: boolean;
  className?: string;
  onEditorClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent, editor: Editor) => boolean;
}

export interface TiptapViewerProps {
  content: JSONContent | string | null;
  fallbackText?: string;
  maxLength?: number;
  className?: string;
  expandText?: string;
  initialExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export interface TiptapToolbarProps {
  editor: Editor;
  className?: string;
}
```

---

## 10. 테스트 전략

### 10.1 단위 테스트

- TiptapEditor 컴포넌트 테스트
- TiptapViewer 컴포넌트 테스트
- useTiptapContent 훅 테스트
- JSON ↔ plainText 변환 테스트

### 10.2 통합 테스트

- PostForm + TiptapEditor 통합
- PostContent + TiptapViewer 통합
- CheckInForm → API 요청 테스트

### 10.3 E2E 테스트

- CheckIn 작성 및 조회 플로우
- CheckOut 작성 및 조회 플로우
- 이미지 업로드 + Tiptap 동시 사용
