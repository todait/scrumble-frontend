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
   * 멘션 텍스트를 HTML로 변환
   */
  formatMentionsToHtml(text: string, members: Member[]): string {
    const memberMap = new Map(members.map(member => [member.name, member]));

    return text.replace(this.MENTION_REGEX, (match, username) => {
      const member = memberMap.get(username);
      if (member) {
        return `<span class="mention" data-user-id="${member.id}">@${username}</span>`;
      }
      return match;
    });
  }

    /**
   * 멘션 텍스트를 파싱하여 렌더링용 구조체로 변환
   */
  formatMentionsToRenderData(text: string, members: Member[]): Array<{ type: 'text' | 'mention'; content: string; member?: Member }> {
    const memberMap = new Map(members.map(member => [member.name, member]));
    const parts: Array<{ type: 'text' | 'mention'; content: string; member?: Member }> = [];
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

  /**
   * 멘션 자동완성을 위한 검색
   */
  searchMembers(query: string, members: Member[]): Member[] {
    const normalizedQuery = query.toLowerCase();
    return members.filter(member =>
      member.name.toLowerCase().includes(normalizedQuery)
    );
  }
}

/**
 * 멘션 텍스트를 일반 텍스트로 변환 (저장용)
 */
export function convertMentionsToText(text: string, members: Member[]): string {
  const parser = new MentionParser();
  const memberMap = new Map(members.map(member => [member.name, member]));

  return text.replace(parser['MENTION_REGEX'], (match, username) => {
    const member = memberMap.get(username);
    return member ? `@${username}` : match;
  });
}

/**
 * 멘션 유효성 검사
 */
export function validateMentions(text: string, members: Member[]): boolean {
  const parser = new MentionParser();
  const mentions = parser.parseMentions(text);
  const memberNames = new Set(members.map(m => m.name));

  return mentions.every(mention => memberNames.has(mention.displayName));
}
