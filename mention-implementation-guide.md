# 유저 멘션 기능 구현 가이드

Scrumble에서 post 작성이나 comment 작성 시 유저 멘션(@mention) 기능을 구현하는 방법을 단계별로 설명합니다.

## 1. 구현 개요

### 핵심 기능
- `@` 문자 입력 시 멤버 자동완성 목록 표시
- 키보드 탐색 지원 (화살표 키, Enter, Escape)
- 멘션된 사용자 하이라이팅
- 멘션 데이터 백엔드 전송

### 구성 요소
1. **MentionInput**: 멘션 입력을 지원하는 텍스트 영역
2. **MemberSuggestionList**: 멤버 자동완성 드롭다운
3. **MentionText**: 멘션이 포함된 텍스트 렌더링
4. **MentionParser**: 멘션 파싱 및 처리 유틸리티

## 2. 파일 구조

```
src/
├── shared/
│   ├── components/
│   │   └── ui/
│   │       └── mention/
│   │           ├── MentionInput.tsx         # 멘션 입력 컴포넌트
│   │           ├── MemberSuggestionList.tsx # 자동완성 목록
│   │           └── MentionText.tsx          # 멘션 텍스트 렌더링
│   ├── utils/
│   │   └── mention.utils.ts                # 멘션 파싱 유틸리티
│   └── hooks/
│       └── queries/
│           └── useSpaceMembers.ts           # 스페이스 멤버 API 훅
```

## 3. 구현 상세

### 3.1 MentionParser 유틸리티

```typescript
// src/shared/utils/mention.utils.ts
import { Member } from '@/shared/types/member';

export interface MentionMatch {
  start: number;
  end: number;
  text: string;
  displayName: string;
  userId?: string;
}

export class MentionParser {
  private readonly MENTION_REGEX = /@(\w+)/g;

  /**
   * 텍스트에서 멘션을 파싱하여 매치 정보를 반환
   */
  parseMentions(text: string): MentionMatch[] {
    const matches: MentionMatch[] = [];
    let match;

    while ((match = this.MENTION_REGEX.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        displayName: match[1],
      });
    }

    return matches;
  }

  /**
   * 텍스트에서 멘션된 사용자 ID 추출
   */
  extractMentionedUserIds(text: string): string[] {
    const mentions = this.parseMentions(text);
    return mentions
      .map(mention => mention.userId)
      .filter((userId): userId is string => userId !== undefined);
  }

  /**
   * 멘션 텍스트를 파싱하여 렌더링용 구조체로 변환
   */
  formatMentionsToRenderData(text: string, members: Member[]): Array<{
    type: 'text' | 'mention';
    content: string;
    member?: Member;
  }> {
    const memberMap = new Map(members.map(member => [member.name, member]));
    const parts: Array<{
      type: 'text' | 'mention';
      content: string;
      member?: Member;
    }> = [];
    let lastIndex = 0;
    let match;

    while ((match = this.MENTION_REGEX.exec(text)) !== null) {
      // 멘션 전 텍스트 추가
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }

      const username = match[1];
      const member = memberMap.get(username);

      if (member) {
        parts.push({
          type: 'mention',
          content: `@${username}`,
          member
        });
      } else {
        parts.push({
          type: 'text',
          content: match[0]
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // 마지막 텍스트 추가
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return parts;
  }
}
```

### 3.2 MentionInput 컴포넌트

```typescript
// src/shared/components/ui/mention/MentionInput.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Member } from '@/shared/types/member';
import { MemberSuggestionList } from './MemberSuggestionList';
import { MentionParser } from '../../../utils/mention.utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect?: (mentionedUserIds: string[]) => void;
  members: Member[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextAreaClick?: () => void;
}

export function MentionInput({
  value,
  onChange,
  onMentionSelect,
  members,
  placeholder = '메시지를 입력하세요...',
  disabled = false,
  className = '',
  onKeyDown,
  onTextAreaClick,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 멘션 파서 초기화
  const mentionParser = new MentionParser();

  // 필터링된 멤버 목록
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(suggestionQuery.toLowerCase())
  );

  // 현재 커서 위치에서 @ 문자 감지
  const detectMentionTrigger = (text: string, position: number) => {
    const beforeCursor = text.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) return null;

    const afterAt = beforeCursor.substring(lastAtIndex + 1);

    // @ 뒤에 공백이 있으면 멘션이 아님
    if (afterAt.includes(' ')) return null;

    return {
      start: lastAtIndex,
      query: afterAt,
    };
  };

  // 텍스트 변경 핸들러
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // 멘션 트리거 감지
    const mentionTrigger = detectMentionTrigger(newValue, newCursorPosition);

    if (mentionTrigger) {
      setSuggestionQuery(mentionTrigger.query);
      setShowSuggestions(true);
      setSelectedIndex(0);

      // 자동완성 위치 계산
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        const lineHeight = 24;
        const lines = newValue.substring(0, mentionTrigger.start).split('\n').length;

        setSuggestionPosition({
          top: rect.top + (lines * lineHeight) + 30,
          left: rect.left + 10,
        });
      }
    } else {
      setShowSuggestions(false);
    }

    // 멘션된 사용자 ID 추출하여 콜백 호출
    if (onMentionSelect) {
      const mentionedUserIds = mentionParser.extractMentionedUserIds(newValue);
      onMentionSelect(mentionedUserIds);
    }
  };

  // 멘션 선택 핸들러
  const handleMentionSelect = (member: Member) => {
    if (!textareaRef.current) return;

    const mentionTrigger = detectMentionTrigger(value, cursorPosition);
    if (!mentionTrigger) return;

    const beforeMention = value.substring(0, mentionTrigger.start);
    const afterMention = value.substring(cursorPosition);
    const mentionText = `@${member.name}`;

    const newValue = beforeMention + mentionText + afterMention;
    const newCursorPosition = mentionTrigger.start + mentionText.length;

    onChange(newValue);
    setShowSuggestions(false);

    // 커서 위치 복원
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(filteredMembers.length - 1, prev + 1));
          break;
        case 'Enter':
          if (filteredMembers[selectedIndex]) {
            e.preventDefault();
            handleMentionSelect(filteredMembers[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions && textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onClick={onTextAreaClick}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed md:text-[15px] ${className}`}
      />

      {showSuggestions && filteredMembers.length > 0 && (
        <MemberSuggestionList
          members={filteredMembers}
          selectedIndex={selectedIndex}
          onSelect={handleMentionSelect}
          position={suggestionPosition}
        />
      )}
    </div>
  );
}
```

### 3.3 MemberSuggestionList 컴포넌트

```typescript
// src/shared/components/ui/mention/MemberSuggestionList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Member } from '@/shared/types/member';
import ProfileAvatar from '../ProfileAvatar';

interface MemberSuggestionListProps {
  members: Member[];
  selectedIndex: number;
  onSelect: (member: Member) => void;
  position: { top: number; left: number };
  maxHeight?: number;
}

export function MemberSuggestionList({
  members,
  selectedIndex,
  onSelect,
  position,
  maxHeight = 200,
}: MemberSuggestionListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // 선택된 항목이 보이도록 스크롤 조정
  useEffect(() => {
    if (selectedItemRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedItem = selectedItemRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.clientHeight;

      if (itemTop < containerTop) {
        container.scrollTop = itemTop;
      } else if (itemBottom > containerBottom) {
        container.scrollTop = itemBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);

  if (members.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: maxHeight,
        overflowY: 'auto',
      }}
    >
      <div className="p-2">
        <div className="text-xs text-gray-500 mb-2 px-2">멤버 선택</div>
        {members.map((member, index) => (
          <div
            key={member.id}
            ref={index === selectedIndex ? selectedItemRef : null}
            className={`
              flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors
              ${index === selectedIndex
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
              }
            `}
            onClick={() => onSelect(member)}
          >
            <ProfileAvatar
              src={member.avatarURL}
              alt={member.name}
              size={24}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {member.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {member.email}
              </div>
            </div>
            {member.role === 'owner' && (
              <div className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                Owner
              </div>
            )}
            {member.role === 'admin' && (
              <div className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                Admin
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 MentionText 렌더링 컴포넌트

```typescript
// src/shared/components/ui/mention/MentionText.tsx
'use client';

import React from 'react';
import { Member } from '@/shared/types/member';
import { MentionParser } from '../../../utils/mention.utils';

interface MentionTextProps {
  text: string;
  members: Member[];
  className?: string;
  onMentionClick?: (member: Member) => void;
}

export function MentionText({
  text,
  members,
  className = '',
  onMentionClick
}: MentionTextProps) {
  const parser = new MentionParser();
  const renderData = parser.formatMentionsToRenderData(text, members);

  return (
    <span className={className}>
      {renderData.map((part, index) => {
        if (part.type === 'mention' && part.member) {
          return (
            <span
              key={index}
              className="mention bg-blue-100 text-blue-600 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => onMentionClick?.(part.member!)}
              title={`${part.member.name} (${part.member.email})`}
            >
              {part.content}
            </span>
          );
        }
        return part.content;
      })}
    </span>
  );
}
```

### 3.5 스페이스 멤버 API 훅

```typescript
// src/shared/hooks/queries/useSpaceMembers.ts
import { useQuery } from '@tanstack/react-query';
import { Member } from '@/shared/types/member';
import { apiClient } from '@/shared/lib/api';

interface SpaceMembersResponse {
  members: Member[];
  total: number;
}

const fetchSpaceMembers = async (spaceSlug: string): Promise<Member[]> => {
  const response = await apiClient.get<SpaceMembersResponse>(`/spaces/${spaceSlug}/members`);
  return response.data.members;
};

export const useSpaceMembers = (spaceSlug: string) => {
  return useQuery({
    queryKey: ['space-members', spaceSlug],
    queryFn: () => fetchSpaceMembers(spaceSlug),
    enabled: !!spaceSlug,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 활성 멤버만 가져오는 훅
export const useActiveSpaceMembers = (spaceSlug: string) => {
  const { data: allMembers = [], ...rest } = useSpaceMembers(spaceSlug);

  const activeMembers = allMembers.filter((member: Member) => member.status === 'active');

  return {
    data: activeMembers,
    ...rest,
  };
};
```

## 4. 기존 컴포넌트 수정

### 4.1 CheckInForm 수정

```typescript
// src/features/checkin/components/forms/CheckInForm.tsx
'use client';

import { MentionInput } from '@/shared/components/ui/mention/MentionInput';
import { useActiveSpaceMembers } from '@/shared/hooks/queries/useSpaceMembers';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScoreSelector } from '../ui';

interface CheckInFormProps {
  onSubmit: (data: {
    score: number;
    message: string;
    images: ImageMetadata[];
    mentionedUserIds: string[];
  }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  initialData?: { score: number; message: string; images?: ImageMetadata[] };
  onScoreRequiredToast?: () => void;
}

export const CheckInForm = ({
  onSubmit,
  disabled = false,
  isLoading = false,
  initialData,
  onScoreRequiredToast,
}: CheckInFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(initialData?.score || null);
  const [message, setMessage] = useState(initialData?.message || '');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [images, setImages] = useState<ImageMetadata[]>(initialData?.images || []);

  const params = useParams();
  const spaceSlug = params.spaceSlug as string;

  // 스페이스 멤버 목록 가져오기
  const { data: members = [] } = useActiveSpaceMembers(spaceSlug);

  useEffect(() => {
    if (initialData) {
      setSelectedScore(initialData.score);
      setMessage(initialData.message);
      setImages(initialData.images || []);
    }
  }, [initialData]);

  const handleSubmit = (data: { message: string; images: ImageMetadata[] }) => {
    if (!selectedScore) {
      if (onScoreRequiredToast) {
        onScoreRequiredToast();
      }
      return;
    }
    if (selectedScore && data.message.trim()) {
      onSubmit({
        score: selectedScore,
        message: data.message,
        images: data.images,
        mentionedUserIds
      });
    }
  };

  const handleMentionInputChange = (value: string) => {
    setMessage(value);
  };

  const handleMentionSelect = (userIds: string[]) => {
    setMentionedUserIds(userIds);
  };

  const handleTextAreaClick = () => {
    if (!selectedScore && onScoreRequiredToast) {
      onScoreRequiredToast();
    }
  };

  const placeholder = selectedScore
    ? '오늘 팀과 함께 시작하는 하루! 오늘의 컨디션이나 기대되는 일, 도움이 필요한 부분을 편하게 나눠주세요.'
    : '오늘의 상태를 점수로 기록하면 좋은점💡 스스로를 객관적으로 돌아볼 수 있고, 팀과도 배려하며 협업할 수 있어요.';

  return (
    <div className="space-y-4">
      <ScoreSelector
        value={selectedScore}
        onChange={score => setSelectedScore(score || null)}
      />

      <div className="relative">
        <MentionInput
          value={message}
          onChange={handleMentionInputChange}
          onMentionSelect={handleMentionSelect}
          members={members}
          placeholder={placeholder}
          disabled={disabled}
          onTextAreaClick={handleTextAreaClick}
          className="h-[240px] w-full resize-none border-none p-[10px] text-base text-black placeholder-gray-400 outline-none disabled:cursor-not-allowed md:text-[15px]"
        />
      </div>

      {/* 기존 이미지 업로드 및 제출 버튼 로직 유지 */}
    </div>
  );
};
```

### 4.2 CommentSection 수정

```typescript
// src/shared/components/ui/CommentSection.tsx에서 편집 모드 textarea 부분 수정

// 기존 textarea를 MentionInput으로 교체
<MentionInput
  value={editContent}
  onChange={setEditContent}
  onMentionSelect={(userIds) => {
    // 멘션된 사용자 ID 저장
    setMentionedUserIds(userIds);
  }}
  members={members}
  placeholder="댓글을 입력하세요..."
  disabled={false}
  className="w-full resize-none overflow-y-auto rounded-lg border border-[rgba(34,34,34,0.08)] bg-white p-3 text-sm text-[#222222] focus:border-[#9747FF] focus:outline-none md:text-[14px]"
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isSaveEnabled) {
        handleSave();
      }
    }
  }}
/>
```

### 4.3 댓글 렌더링 시 멘션 표시

```typescript
// CommentSection.tsx의 댓글 렌더링 부분에서 MentionText 사용
import { MentionText } from './mention/MentionText';

// 댓글 내용 렌더링
<MentionText
  text={comment.content}
  members={members}
  className="whitespace-pre-line text-sm text-[#222222] md:text-[14px]"
  onMentionClick={(member) => {
    // 멘션 클릭 시 사용자 프로필 표시 등
    console.log('Mentioned user clicked:', member);
  }}
/>
```

## 5. 백엔드 API 수정

### 5.1 체크인 API 수정

```typescript
// 체크인 생성 시 멘션 데이터 포함
interface CreateCheckinDto {
  spaceSlug: string;
  postedDate: string;
  conditionScore: number;
  conditionText: string;
  images: ImageMetadata[];
  mentionedUserIds: string[]; // 추가
}

// 체크인 응답 타입에 멘션 정보 포함
interface Checkin {
  id: string;
  // ... 기존 필드들
  mentionedUsers: Member[]; // 추가
}
```

### 5.2 댓글 API 수정

```typescript
// 댓글 생성/수정 시 멘션 데이터 포함
interface CreateCommentDto {
  content: string;
  images?: ImageMetadata[];
  mentionedUserIds: string[]; // 추가
}

interface Comment {
  id: string;
  // ... 기존 필드들
  mentionedUsers: Member[]; // 추가
}
```

## 6. 사용 방법

### 6.1 체크인 작성 시 멘션 사용

1. 체크인 작성 화면에서 텍스트 입력 시 `@` 문자 입력
2. 멤버 자동완성 목록이 표시됨
3. 화살표 키로 멤버 선택 후 Enter 키 또는 클릭
4. 멘션된 사용자가 파란색 배경으로 하이라이트됨

### 6.2 댓글 작성 시 멘션 사용

1. 댓글 입력 시 `@` 문자 입력
2. 멤버 자동완성 목록에서 선택
3. 멘션된 사용자 표시

### 6.3 멘션 렌더링

- 저장된 텍스트에서 `@username` 형태로 멘션 표시
- 클릭 시 사용자 프로필 정보 표시 가능
- 멘션된 사용자에게 알림 발송 (백엔드 처리)

## 7. 스타일링 커스터마이징

### 7.1 멘션 스타일

```css
/* Tailwind 클래스 또는 CSS로 멘션 스타일 커스터마이징 */
.mention {
  @apply bg-blue-100 text-blue-600 px-1 py-0.5 rounded;
  @apply cursor-pointer hover:bg-blue-200 transition-colors;
}

.mention:hover {
  @apply bg-blue-200;
}
```

### 7.2 자동완성 목록 스타일

```css
/* 자동완성 목록 스타일 */
.suggestion-list {
  @apply fixed z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg;
  @apply max-h-48 overflow-y-auto;
}

.suggestion-item {
  @apply flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors;
  @apply hover:bg-gray-50;
}

.suggestion-item.selected {
  @apply bg-blue-50 text-blue-700;
}
```

## 8. 성능 최적화

### 8.1 멤버 목록 캐싱

```typescript
// React Query를 사용한 멤버 목록 캐싱
export const useActiveSpaceMembers = (spaceSlug: string) => {
  return useQuery({
    queryKey: ['space-members', spaceSlug],
    queryFn: () => fetchSpaceMembers(spaceSlug),
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    cacheTime: 10 * 60 * 1000, // 10분 메모리 보관
  });
};
```

### 8.2 디바운싱

```typescript
// 멘션 검색 시 디바운싱 적용
import { useDebounce } from '@/shared/hooks/useDebounce';

const debouncedQuery = useDebounce(suggestionQuery, 300);
const filteredMembers = members.filter(member =>
  member.name.toLowerCase().includes(debouncedQuery.toLowerCase())
);
```

## 9. 접근성 고려사항

### 9.1 키보드 내비게이션

- 화살표 키로 자동완성 목록 탐색
- Enter 키로 멘션 선택
- Escape 키로 자동완성 닫기

### 9.2 스크린 리더 지원

```typescript
// ARIA 속성 추가
<div
  role="listbox"
  aria-label="멤버 선택"
  aria-expanded={showSuggestions}
>
  {members.map((member, index) => (
    <div
      key={member.id}
      role="option"
      aria-selected={index === selectedIndex}
      aria-label={`${member.name} (${member.email})`}
    >
      {/* 멤버 정보 */}
    </div>
  ))}
</div>
```

## 10. 테스트

### 10.1 단위 테스트

```typescript
// MentionParser 테스트
describe('MentionParser', () => {
  it('should parse mentions correctly', () => {
    const parser = new MentionParser();
    const text = 'Hello @john and @jane!';
    const mentions = parser.parseMentions(text);

    expect(mentions).toHaveLength(2);
    expect(mentions[0].displayName).toBe('john');
    expect(mentions[1].displayName).toBe('jane');
  });
});
```

### 10.2 통합 테스트

```typescript
// MentionInput 컴포넌트 테스트
describe('MentionInput', () => {
  it('should show suggestions when @ is typed', async () => {
    const mockMembers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
    ];

    render(<MentionInput members={mockMembers} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '@j' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

이 가이드를 따라 구현하면 Scrumble에서 완전한 유저 멘션 기능을 구현할 수 있습니다.
