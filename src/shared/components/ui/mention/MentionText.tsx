'use client';

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

// 멘션 없이 일반 텍스트로 렌더링하는 컴포넌트
export function PlainMentionText({
  text,
  members,
  className = ''
}: Omit<MentionTextProps, 'onMentionClick'>) {
  const parser = new MentionParser();
  const renderData = parser.formatMentionsToRenderData(text, members);

  return (
    <span className={className}>
      {renderData.map((part, index) => {
        if (part.type === 'mention' && part.member) {
          return (
            <span
              key={index}
              className="mention bg-blue-100 text-blue-600 px-1 py-0.5 rounded"
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
