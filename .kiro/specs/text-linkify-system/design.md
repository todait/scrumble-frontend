# 텍스트 링크 처리 시스템 설계 문서

## 개요

linkifyjs를 기반으로 PostForm과 PostContent에서 URL, 멘션, JIRA 티켓, ClickUp 태스크 등 다양한 텍스트 패턴을 자동으로 감지하고 적절한 링크나 컴포넌트로 변환하는 확장 가능한 텍스트 링크 처리 시스템을 구현합니다. 이 시스템은 기존 PostForm의 textarea 기능과 PostContent의 텍스트 렌더링을 확장하여 실시간 링크 감지, 미리보기, 그리고 다양한 서비스별 특화 렌더링을 제공합니다.

## 아키텍처

### 전체 구조

```
src/shared/lib/linkify/
├── config/
│   ├── linkifyConfig.ts           # linkifyjs 설정 및 커스텀 매처 등록
│   ├── linkTypes.ts               # 링크 타입 정의 및 enum
│   └── servicePatterns.ts         # 서드파티 서비스 패턴 정의
├── components/
│   ├── LinkRenderer/
│   │   ├── LinkRenderer.tsx       # 메인 링크 렌더러 컴포넌트
│   │   ├── renderers/
│   │   │   ├── DefaultLink.tsx    # 기본 URL/이메일 링크
│   │   │   ├── MentionLink.tsx    # 멘션 렌더러
│   │   │   ├── JiraTicket.tsx     # JIRA 티켓 렌더러
│   │   │   ├── ClickUpTask.tsx    # ClickUp 태스크 렌더러
│   │   │   ├── GitHubLink.tsx     # GitHub 링크 렌더러
│   │   │   └── index.ts           # 렌더러 내보내기
│   │   └── index.ts
│   ├── LinkifyText/
│   │   ├── LinkifyText.tsx        # 텍스트 링크화 래퍼 컴포넌트
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useEnhancedTextarea.ts     # textarea 확장 기능 훅
│   ├── useLinkDetection.ts        # 링크 감지 로직 훅
│   └── index.ts
├── utils/
│   ├── linkDetection.ts           # 링크 감지 유틸리티
│   ├── linkTransform.ts           # 링크 변환 유틸리티
│   └── index.ts
└── index.ts

src/shared/components/ui/
├── PostForm.tsx                   # 기존 PostForm 확장
└── ...

src/features/feed/components/
├── PostContent.tsx                # 기존 PostContent 확장
└── ...
```

### 의존성 패키지

```json
{
  "dependencies": {
    "linkifyjs": "^4.1.3",
    "linkify-react": "^4.1.3",
    "@linkify/plugin-mention": "^4.1.3"
  }
}
```

## 컴포넌트 및 인터페이스

### 1. 핵심 타입 정의

```typescript
// linkTypes.ts
export enum LinkType {
  URL = 'url',
  EMAIL = 'email',
  MENTION = 'mention',
  JIRA = 'jira',
  CLICKUP = 'clickup',
  GITHUB = 'github',
  NOTION = 'notion',
}

export interface DetectedLink {
  type: LinkType;
  value: string;
  start: number;
  end: number;
  href: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface LinkRendererProps {
  href: string;
  type: LinkType;
  children: React.ReactNode;
  metadata?: {
    [key: string]: any;
  };
}

export interface ServiceConfig {
  name: string;
  pattern: RegExp;
  linkType: LinkType;
  urlTemplate?: string;
  icon?: React.ComponentType<{ className?: string }>;
  brandColor: string;
}
```

### 2. linkifyjs 설정

```typescript
// linkifyConfig.ts
import linkify from 'linkifyjs';
import mentionPlugin from '@linkify/plugin-mention';
import { LinkType, ServiceConfig } from './linkTypes';

// 멘션 플러그인 등록
mentionPlugin(linkify);

// 서드파티 서비스 설정
export const serviceConfigs: Record<string, ServiceConfig> = {
  jira: {
    name: 'JIRA',
    pattern: /\b[A-Z]{2,10}-\d+\b/g,
    linkType: LinkType.JIRA,
    urlTemplate: 'https://your-company.atlassian.net/browse/{ticketId}',
    brandColor: '#0052CC',
  },
  clickup: {
    name: 'ClickUp',
    pattern: /https:\/\/app\.clickup\.com\/t\/[a-zA-Z0-9]+/g,
    linkType: LinkType.CLICKUP,
    brandColor: '#7B68EE',
  },
  github: {
    name: 'GitHub',
    pattern: /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/g,
    linkType: LinkType.GITHUB,
    brandColor: '#24292e',
  },
};

// 커스텀 매처 등록
export const registerCustomMatchers = () => {
  // JIRA 티켓 패턴 등록
  const jiraToken = linkify.createTokenClass('jira', {
    isLink: true,
  });

  linkify.registerPlugin('jira', ({ scanner, parser }) => {
    const { HYPHEN, UPPERCASE, NUM } = scanner.tokens;

    // ABC-123 패턴 매칭
    const jiraStart = parser.start.tt(UPPERCASE);
    const jiraMiddle = jiraStart.tt(UPPERCASE).repeat(1, 9); // 2-10 글자
    const jiraHyphen = jiraMiddle.tt(HYPHEN, jiraToken);
    const jiraEnd = jiraHyphen.tt(NUM, jiraToken).repeat(1);

    jiraEnd.tt(NUM, jiraToken).repeat(0);
  });
};

// 링크 타입 결정 함수
export const determineLinkType = (href: string, originalType: string): LinkType => {
  if (originalType === 'mention') return LinkType.MENTION;
  if (originalType === 'email') return LinkType.EMAIL;

  // URL 기반 서비스 감지
  for (const [key, config] of Object.entries(serviceConfigs)) {
    if (config.pattern.test(href)) {
      return config.linkType;
    }
  }

  return LinkType.URL;
};

// 초기화
registerCustomMatchers();
```

### 3. 링크 렌더러 컴포넌트들

```typescript
// LinkRenderer.tsx
import React from 'react';
import { LinkType, LinkRendererProps } from '../config/linkTypes';
import {
  DefaultLink,
  MentionLink,
  JiraTicket,
  ClickUpTask,
  GitHubLink,
} from './renderers';

const linkRenderers: Record<LinkType, React.FC<LinkRendererProps>> = {
  [LinkType.URL]: DefaultLink,
  [LinkType.EMAIL]: DefaultLink,
  [LinkType.MENTION]: MentionLink,
  [LinkType.JIRA]: JiraTicket,
  [LinkType.CLICKUP]: ClickUpTask,
  [LinkType.GITHUB]: GitHubLink,
  [LinkType.NOTION]: DefaultLink,
};

export const LinkRenderer: React.FC<LinkRendererProps> = ({ type, ...props }) => {
  const Component = linkRenderers[type] || DefaultLink;
  return <Component {...props} type={type} />;
};
```

```typescript
// renderers/DefaultLink.tsx
import React from 'react';
import { LinkRendererProps } from '../../config/linkTypes';

export const DefaultLink: React.FC<LinkRendererProps> = ({
  href,
  children,
  type
}) => {
  const isEmail = type === 'email';
  const finalHref = isEmail && !href.startsWith('mailto:')
    ? `mailto:${href}`
    : href;

  return (
    <a
      href={finalHref}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noopener noreferrer"}
      className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
    >
      {children}
    </a>
  );
};
```

```typescript
// renderers/MentionLink.tsx
import React from 'react';
import { LinkRendererProps } from '../../config/linkTypes';

export const MentionLink: React.FC<LinkRendererProps> = ({
  href,
  children,
  metadata
}) => {
  const username = children?.toString().replace('@', '') || '';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 멘션 클릭 처리 로직
    console.log('Mention clicked:', username);
    // TODO: 사용자 프로필 모달 또는 페이지로 이동
  };

  return (
    <span
      onClick={handleClick}
      className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors duration-200"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-label={`멘션: ${username}`}
    >
      {children}
    </span>
  );
};
```

```typescript
// renderers/JiraTicket.tsx
import React from 'react';
import { LinkRendererProps } from '../../config/linkTypes';
import { serviceConfigs } from '../../config/linkifyConfig';

export const JiraTicket: React.FC<LinkRendererProps> = ({
  href,
  children
}) => {
  const ticketId = children?.toString() || '';
  const config = serviceConfigs.jira;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const jiraUrl = config.urlTemplate?.replace('{ticketId}', ticketId);
    if (jiraUrl) {
      window.open(jiraUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <span
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: `${config.brandColor}15`,
        color: config.brandColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${config.brandColor}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${config.brandColor}15`;
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-label={`JIRA 티켓: ${ticketId}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V2H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V6.8H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V11.6H2z"/>
      </svg>
      {children}
    </span>
  );
};
```

### 4. LinkifyText 래퍼 컴포넌트

```typescript
// LinkifyText.tsx
import React from 'react';
import Linkify from 'linkify-react';
import { LinkRenderer } from '../LinkRenderer';
import { determineLinkType } from '../config/linkifyConfig';

interface LinkifyTextProps {
  children: string;
  className?: string;
  options?: {
    truncate?: number;
    target?: string;
  };
}

export const LinkifyText: React.FC<LinkifyTextProps> = ({
  children,
  className,
  options = {}
}) => {
  const linkifyOptions = {
    render: {
      url: ({ attributes, content }: any) => {
        const { href, ...props } = attributes;
        const linkType = determineLinkType(href, 'url');

        // URL 길이 제한
        let displayContent = content;
        if (options.truncate && content.length > options.truncate) {
          displayContent = content.substring(0, options.truncate) + '...';
        }

        return (
          <LinkRenderer href={href} type={linkType} {...props}>
            {displayContent}
          </LinkRenderer>
        );
      },
      email: ({ attributes, content }: any) => {
        const { href, ...props } = attributes;

        return (
          <LinkRenderer href={href} type="email" {...props}>
            {content}
          </LinkRenderer>
        );
      },
      mention: ({ attributes, content }: any) => {
        const { href, ...props } = attributes;

        return (
          <LinkRenderer href={href} type="mention" {...props}>
            {content}
          </LinkRenderer>
        );
      },
    },
    target: options.target || '_blank',
    rel: 'noopener noreferrer',
  };

  return (
    <div className={className}>
      <Linkify options={linkifyOptions}>{children}</Linkify>
    </div>
  );
};
```

### 5. Enhanced Textarea Hook

```typescript
// useEnhancedTextarea.ts
import { useCallback, useRef, useState, useMemo } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { DetectedLink, LinkType } from '../config/linkTypes';
import { detectLinks } from '../utils/linkDetection';

interface UseEnhancedTextareaOptions {
  debounceMs?: number;
  enableMentionAutocomplete?: boolean;
}

export const useEnhancedTextarea = (options: UseEnhancedTextareaOptions = {}) => {
  const { debounceMs = 300, enableMentionAutocomplete = true } = options;

  const [detectedLinks, setDetectedLinks] = useState<DetectedLink[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 디바운스된 링크 감지
  const debouncedDetectLinks = useDebounce((text: string) => {
    const links = detectLinks(text);
    setDetectedLinks(links);
  }, debounceMs);

  // 텍스트 변경 처리
  const handleTextChange = useCallback(
    (text: string) => {
      debouncedDetectLinks(text);

      // 멘션 자동완성 처리
      if (enableMentionAutocomplete && textareaRef.current) {
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        // 현재 커서 위치에서 @ 찾기
        const textBeforeCursor = text.substring(0, cursorPosition);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
          setMentionQuery(mentionMatch[1]);
          setMentionPosition({
            start: cursorPosition - mentionMatch[0].length,
            end: cursorPosition,
          });
          setShowMentionSuggestions(true);
        } else {
          setShowMentionSuggestions(false);
          setMentionQuery('');
        }
      }
    },
    [debouncedDetectLinks, enableMentionAutocomplete]
  );

  // 멘션 삽입
  const insertMention = useCallback(
    (username: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const text = textarea.value;
      const mention = `@${username} `;

      const newText =
        text.substring(0, mentionPosition.start) + mention + text.substring(mentionPosition.end);

      textarea.value = newText;
      const newCursorPosition = mentionPosition.start + mention.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);

      // 변경 이벤트 발생
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      setShowMentionSuggestions(false);
      setMentionQuery('');
    },
    [mentionPosition]
  );

  // 링크 통계
  const linkStats = useMemo(() => {
    const stats = detectedLinks.reduce(
      (acc, link) => {
        acc[link.type] = (acc[link.type] || 0) + 1;
        return acc;
      },
      {} as Record<LinkType, number>
    );

    return {
      total: detectedLinks.length,
      byType: stats,
    };
  }, [detectedLinks]);

  return {
    textareaRef,
    detectedLinks,
    linkStats,
    handleTextChange,

    // 멘션 관련
    showMentionSuggestions,
    mentionQuery,
    insertMention,

    // 유틸리티
    clearDetectedLinks: () => setDetectedLinks([]),
  };
};
```

### 6. 링크 감지 유틸리티

```typescript
// linkDetection.ts
import linkify from 'linkifyjs';
import { DetectedLink, LinkType } from '../config/linkTypes';
import { determineLinkType } from '../config/linkifyConfig';

export const detectLinks = (text: string): DetectedLink[] => {
  const links = linkify.find(text);

  return links.map(link => ({
    type: determineLinkType(link.href, link.type),
    value: link.value,
    start: link.start,
    end: link.end,
    href: link.href,
    metadata: {
      originalType: link.type,
    },
  }));
};

export const hasLinks = (text: string): boolean => {
  return linkify.test(text);
};

export const extractLinks = (text: string, type?: LinkType): DetectedLink[] => {
  const allLinks = detectLinks(text);
  return type ? allLinks.filter(link => link.type === type) : allLinks;
};
```

## PostForm 통합

### 기존 PostForm 확장

```typescript
// PostForm.tsx (수정된 부분)
import { useEnhancedTextarea } from '@/shared/lib/linkify/hooks/useEnhancedTextarea';
import { LinkifyText } from '@/shared/lib/linkify/components/LinkifyText';

export const PostForm = ({ ... }) => {
  const [message, setMessage] = useState(initialMessage);
  const [showPreview, setShowPreview] = useState(false);

  // Enhanced textarea 기능
  const {
    textareaRef,
    detectedLinks,
    linkStats,
    handleTextChange,
    showMentionSuggestions,
    mentionQuery,
    insertMention,
  } = useEnhancedTextarea({
    debounceMs: 300,
    enableMentionAutocomplete: true,
  });

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    handleTextChange(value);
  };

  return (
    <div ref={formRef} className="relative" {...dragHandlers}>
      {children}

      <div className={`px-2 transition-colors md:px-7 ${isDragging ? 'bg-blue-50' : ''}`}>
        {/* 미리보기 모드 */}
        {showPreview ? (
          <div
            className="min-h-[240px] p-[10px] whitespace-pre-wrap cursor-text rounded-xl py-3"
            onClick={() => setShowPreview(false)}
          >
            <LinkifyText className="text-base text-black md:text-[15px]">
              {message}
            </LinkifyText>
          </div>
        ) : (
          /* 편집 모드 */
          <div className="relative cursor-text rounded-xl py-3" onClick={onTextAreaClick}>
            <textarea
              {...textareaProps}
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onBlur={() => setShowPreview(true)}
              onFocus={() => setShowPreview(false)}
              placeholder={placeholder}
              className="h-[240px] w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed md:text-[15px]"
              disabled={disabled}
            />

            {/* 멘션 자동완성 */}
            {showMentionSuggestions && (
              <MentionSuggestions
                query={mentionQuery}
                onSelect={insertMention}
                onClose={() => setShowMentionSuggestions(false)}
              />
            )}
          </div>
        )}

        {/* 링크 통계 표시 (선택적) */}
        {linkStats.total > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {linkStats.total}개의 링크 감지됨
          </div>
        )}

        {/* 기존 이미지 업로드 섹션... */}
      </div>

      {/* 기존 제출 버튼... */}
    </div>
  );
};
```

## PostContent 통합

### 기존 PostContent 확장

```typescript
// PostContent.tsx (수정된 부분)
import { LinkifyText } from '@/shared/lib/linkify/components/LinkifyText';

export function PostContent({ ... }) {
  // ... 기존 로직

  return (
    <>
      <div className={`group relative flex gap-[10px] ${padding} bg-white`}>
        {/* ... 기존 헤더 섹션 */}

        {/* 본문 - LinkifyText로 래핑 */}
        <div className="py-2">
          {showFullContent ? (
            <LinkifyText
              className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}
              options={{ truncate: 50 }}
            >
              {content}
            </LinkifyText>
          ) : (
            <div className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>
              {content.length > 200 ? (
                <>
                  <LinkifyText options={{ truncate: 50 }}>
                    {contentPreview.replace(/\.\.\.$/, '')}
                  </LinkifyText>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowFullContent(true);
                    }}
                    className="ml-1 text-base font-medium text-[#A0A0A0] hover:text-[#808080] md:text-[15px]"
                  >
                    ...더보기
                  </button>
                </>
              ) : (
                <LinkifyText options={{ truncate: 50 }}>
                  {content}
                </LinkifyText>
              )}
            </div>
          )}
        </div>

        {/* ... 기존 나머지 섹션들 */}
      </div>

      {/* ... 기존 모달들 */}
    </>
  );
}
```

## 에러 처리

### 에러 시나리오 및 처리 전략

1. **링크 파싱 에러**

   - 잘못된 정규식 패턴으로 인한 파싱 실패
   - 예외 처리를 통해 원본 텍스트 유지

2. **외부 서비스 연결 실패**

   - JIRA, ClickUp 등 외부 링크 접근 실패
   - 사용자에게 적절한 에러 메시지 표시

3. **성능 문제**
   - 대량 텍스트 처리 시 성능 저하
   - 디바운싱과 메모이제이션으로 최적화

```typescript
// 에러 처리 예시
export const safeDetectLinks = (text: string): DetectedLink[] => {
  try {
    return detectLinks(text);
  } catch (error) {
    console.error('링크 감지 실패:', error);
    return [];
  }
};
```

## 테스팅 전략

### 단위 테스트

1. **링크 감지 테스트**

   ```typescript
   describe('detectLinks', () => {
     it('should detect URLs correctly', () => {
       const text = 'Visit https://example.com for more info';
       const links = detectLinks(text);
       expect(links).toHaveLength(1);
       expect(links[0].type).toBe(LinkType.URL);
     });

     it('should detect JIRA tickets', () => {
       const text = 'Fix issue ABC-123 and DEF-456';
       const links = detectLinks(text);
       expect(links).toHaveLength(2);
       expect(links[0].type).toBe(LinkType.JIRA);
     });
   });
   ```

2. **컴포넌트 렌더링 테스트**
   ```typescript
   describe('LinkRenderer', () => {
     it('should render mention links correctly', () => {
       render(
         <LinkRenderer type={LinkType.MENTION} href="@username">
           @username
         </LinkRenderer>
       );
       expect(screen.getByRole('button')).toBeInTheDocument();
     });
   });
   ```

### 통합 테스트

1. **PostForm 통합 테스트**

   - 텍스트 입력 시 실시간 링크 감지
   - 미리보기 모드에서 링크 렌더링
   - 멘션 자동완성 기능

2. **PostContent 통합 테스트**
   - 다양한 링크 타입의 올바른 렌더링
   - 긴 URL의 적절한 잘림 처리
   - 접근성 기능 동작

## 성능 최적화

### 렌더링 최적화

1. **메모이제이션**

   ```typescript
   const MemoizedLinkRenderer = React.memo(LinkRenderer);
   const MemoizedLinkifyText = React.memo(LinkifyText);
   ```

2. **디바운싱**

   ```typescript
   const debouncedDetectLinks = useDebounce(detectLinks, 300);
   ```

3. **가상화**
   - 대량의 포스트 목록에서 링크 처리 최적화
   - React Window 또는 React Virtualized 활용

### 번들 최적화

1. **코드 분할**

   ```typescript
   const LinkifyText = lazy(() => import('./LinkifyText'));
   ```

2. **트리 쉐이킹**
   - 사용하지 않는 링크 렌더러 제거
   - linkifyjs 플러그인 선택적 로딩

## 접근성 고려사항

### 키보드 네비게이션

```typescript
// 키보드 접근성 예시
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
};
```

### 스크린 리더 지원

```typescript
// ARIA 라벨 예시
<span
  role="button"
  tabIndex={0}
  aria-label={`JIRA 티켓: ${ticketId}`}
  onKeyDown={handleKeyDown}
>
  {children}
</span>
```

### 색상 대비

- WCAG 2.1 AA 기준 준수
- 브랜드 색상의 적절한 대비율 확보
- 다크 모드 지원 준비

## 모바일 최적화

### 터치 인터페이스

1. **터치 타겟 크기**

   - 최소 44px × 44px 터치 영역 확보
   - 링크 간 적절한 간격 유지

2. **터치 피드백**

   ```typescript
   const [isPressed, setIsPressed] = useState(false);

   return (
     <span
       onTouchStart={() => setIsPressed(true)}
       onTouchEnd={() => setIsPressed(false)}
       className={`transition-colors ${isPressed ? 'bg-opacity-30' : 'bg-opacity-15'}`}
     >
       {children}
     </span>
   );
   ```

### 반응형 디자인

- 모바일에서 링크 텍스트 적절한 크기 조정
- 긴 URL의 모바일 친화적 표시
- 터치 스크롤과의 충돌 방지

## 확장성 설계

### 새로운 서비스 추가

1. **서비스 설정 추가**

   ```typescript
   // servicePatterns.ts에 추가
   notion: {
     name: 'Notion',
     pattern: /https:\/\/www\.notion\.so\/[a-zA-Z0-9-]+/g,
     linkType: LinkType.NOTION,
     brandColor: '#000000',
   }
   ```

2. **렌더러 컴포넌트 생성**

   ```typescript
   // NotionLink.tsx
   export const NotionLink: React.FC<LinkRendererProps> = ({ ... }) => {
     // Notion 특화 렌더링 로직
   };
   ```

3. **타입 및 매핑 업데이트**

   ```typescript
   // linkTypes.ts에 추가
   export enum LinkType {
     // ... 기존 타입들
     NOTION = 'notion',
   }

   // LinkRenderer.tsx에 매핑 추가
   const linkRenderers = {
     // ... 기존 렌더러들
     [LinkType.NOTION]: NotionLink,
   };
   ```

### 플러그인 시스템

향후 확장을 위한 플러그인 아키텍처 준비:

```typescript
interface LinkifyPlugin {
  name: string;
  patterns: RegExp[];
  renderer: React.FC<LinkRendererProps>;
  priority: number;
}

export const registerPlugin = (plugin: LinkifyPlugin) => {
  // 플러그인 등록 로직
};
```

이 설계를 통해 확장 가능하고 유지보수가 용이한 텍스트 링크 처리 시스템을 구축할 수 있습니다.
