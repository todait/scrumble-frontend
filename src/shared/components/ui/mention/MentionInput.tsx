'use client';

import { Member } from '@/shared/types/member';
import React, { useEffect, useRef, useState } from 'react';
import { MentionParser } from '../../../utils/mention.utils';
import { MemberSuggestionList } from './MemberSuggestionList';

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
        const lineHeight = 24; // 대략적인 라인 높이
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
