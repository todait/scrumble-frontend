textarea에서 링크를 자동으로 감지하여 시각적으로 표시하는 기능을 구현하려면, textarea 위에 오버레이를 사용하는 방법이 가장 가볍고 효과적입니다. 다음과 같이 구현할 수 있습니다:

## 1. 링크 감지 및 하이라이팅을 위한 Custom Hook

```typescript
// hooks/useTextareaLinkHighlight.tsx
import { useCallback, useEffect, useRef, useState } from 'react';

interface LinkPosition {
  text: string;
  start: number;
  end: number;
  url: string;
}

export const useTextareaLinkHighlight = (value: string) => {
  const [links, setLinks] = useState<LinkPosition[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // URL 정규식 - 간단한 버전
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|co\.kr|net|org|io|dev|kr|go\.kr)([\/\w\-._~:/?#[\]@!$&'()*+,;=]*)?)/gi;

  // 링크 찾기
  const findLinks = useCallback((text: string) => {
    const foundLinks: LinkPosition[] = [];
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      let url = match[0];
      // www로 시작하거나 프로토콜이 없는 경우 https:// 추가
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = url.startsWith('www.') ? `https://${url}` : `https://www.${url}`;
      }

      foundLinks.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        url: url,
      });
    }

    return foundLinks;
  }, []);

  // 텍스트가 변경될 때마다 링크 찾기
  useEffect(() => {
    const foundLinks = findLinks(value);
    setLinks(foundLinks);
  }, [value, findLinks]);

  // textarea 스크롤 동기화
  const handleScroll = useCallback(() => {
    if (textareaRef.current && mirrorRef.current) {
      mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
      mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return {
    textareaRef,
    mirrorRef,
    links,
    handleScroll,
  };
};
```

## 2. 링크 하이라이팅 컴포넌트

```typescript
// components/TextareaWithLinks.tsx
import { useTextareaLinkHighlight } from '@/hooks/useTextareaLinkHighlight';
import { forwardRef } from 'react';

interface TextareaWithLinksProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextareaWithLinks = forwardRef<HTMLTextAreaElement, TextareaWithLinksProps>(
  ({ value, onChange, className, style, ...props }, ref) => {
    const { textareaRef, mirrorRef, links, handleScroll } = useTextareaLinkHighlight(value);

    // 텍스트를 링크와 일반 텍스트로 분리
    const renderHighlightedText = () => {
      if (!value) return null;

      const elements: JSX.Element[] = [];
      let lastIndex = 0;

      links.forEach((link, index) => {
        // 링크 이전의 일반 텍스트
        if (link.start > lastIndex) {
          elements.push(
            <span key={`text-${index}`}>
              {value.substring(lastIndex, link.start)}
            </span>
          );
        }

        // 링크 텍스트
        elements.push(
          <span
            key={`link-${index}`}
            className="text-blue-600 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.open(link.url, '_blank', 'noopener,noreferrer');
            }}
          >
            {link.text}
          </span>
        );

        lastIndex = link.end;
      });

      // 마지막 링크 이후의 텍스트
      if (lastIndex < value.length) {
        elements.push(
          <span key="text-last">
            {value.substring(lastIndex)}
          </span>
        );
      }

      return elements;
    };

    return (
      <div className="relative">
        {/* 미러 div - textarea 아래에 위치하여 링크를 표시 */}
        <div
          ref={mirrorRef}
          className={`absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words ${className}`}
          style={{
            ...style,
            color: 'transparent',
            caretColor: 'transparent',
            zIndex: 1,
          }}
        >
          {renderHighlightedText()}
        </div>

        {/* 실제 textarea */}
        <textarea
          ref={(node) => {
            // 두 ref를 모두 설정
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            textareaRef.current = node;
          }}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          className={className}
          style={{
            ...style,
            position: 'relative',
            zIndex: 2,
            background: 'transparent',
          }}
          {...props}
        />
      </div>
    );
  }
);

TextareaWithLinks.displayName = 'TextareaWithLinks';
```

## 3. PostForm에 적용

```typescript
// PostForm 컴포넌트 수정
import { TextareaWithLinks } from '@/components/TextareaWithLinks';

// ... 기존 코드

return (
  <div ref={formRef} className="relative" {...dragHandlers}>
    {children}

    <div className={`px-2 transition-colors md:px-7 ${isDragging ? 'bg-blue-50' : ''}`}>
      <div className="relative cursor-text rounded-xl py-3" onClick={onTextAreaClick}>
        <TextareaWithLinks
          {...textareaProps}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            // ... 기존 키보드 이벤트 핸들러
          }}
          placeholder={placeholder}
          className="h-[240px] w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed md:text-[15px]"
          disabled={disabled}
        />
      </div>

      {/* ... 나머지 코드 */}
    </div>
  </div>
);
```
