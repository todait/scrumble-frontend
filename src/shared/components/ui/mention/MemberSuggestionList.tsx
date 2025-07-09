'use client';

import { Member } from '@/shared/types/member';
import { useEffect, useRef } from 'react';
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
