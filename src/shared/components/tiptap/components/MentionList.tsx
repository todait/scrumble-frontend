'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { MentionUser } from '../tiptap.types';

export interface MentionListProps extends SuggestionProps {
  items: MentionUser[];
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div 
      className="z-50 max-h-[200px] overflow-y-auto rounded-lg border border-[rgba(34,34,34,0.08)] bg-white shadow-lg"
      role="listbox"
      aria-label="사용자 선택"
    >
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 ${
              index === selectedIndex ? 'bg-purple-50 text-purple-700' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            role="option"
            aria-selected={index === selectedIndex}
            aria-label={`${item.name}${item.email ? `, ${item.email}` : ''}`}
          >
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              {item.email && (
                <div className="text-xs text-gray-500">{item.email}</div>
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">사용자를 찾을 수 없습니다</div>
      )}
    </div>
  );
});