/**
 * 리액션 변환 유틸리티 함수들
 * 백엔드 API 응답(개별 리액션들)을 프론트엔드 타입(집계된 리액션들)으로 변환
 */

import type { Reaction } from '@/features/feed/types/feed.types';
import type { ApiReaction, ApiUser } from '@/shared/types/api';

/**
 * 백엔드 개별 리액션들을 프론트엔드 집계 리액션들로 변환
 * @param apiReactions 백엔드에서 받은 개별 리액션 배열
 * @returns 집계된 리액션 배열 (emoji별로 그룹화하여 count와 spaceMemberIds 포함)
 */
export function convertApiReactionsToReactions(apiReactions: ApiReaction[] = []): Reaction[] {
  if (!apiReactions || apiReactions.length === 0) {
    return [];
  }

  // emoji별로 그룹화
  const reactionMap = new Map<
    string,
    {
      spaceMemberIds: string[];
      count: number;
    }
  >();

  apiReactions.forEach(apiReaction => {
    const { emoji, space_member_id } = apiReaction;

    if (!reactionMap.has(emoji)) {
      reactionMap.set(emoji, {
        spaceMemberIds: [],
        count: 0,
      });
    }

    const reactionGroup = reactionMap.get(emoji)!;

    // 중복 사용자 체크 (같은 사용자가 같은 이모지로 여러 번 리액션하는 경우 방지)
    if (!reactionGroup.spaceMemberIds.includes(space_member_id)) {
      reactionGroup.spaceMemberIds.push(space_member_id);
      reactionGroup.count++;
    }
  });

  // Map을 Reaction 배열로 변환
  return Array.from(reactionMap.entries()).map(([emoji, { spaceMemberIds, count }]) => ({
    emoji,
    count,
    spaceMemberIds,
  }));
}

/**
 * 백엔드 사용자 정보를 프론트엔드 User 타입으로 변환
 * @param apiUser 백엔드 API 사용자 정보
 * @returns 프론트엔드 User 타입
 */
export function convertApiUserToUser(apiUser: ApiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    profileImage: apiUser.avatar_url || '',
    email: apiUser.email, // 필요한 경우를 위해 보존
  };
}

/**
 * 프론트엔드 Reaction 배열에서 특정 사용자가 특정 이모지에 리액션했는지 확인
 * @param reactions 리액션 배열
 * @param spaceMemberId 멤버 ID
 * @param emoji 이모지
 * @returns 리액션 여부
 */
export function hasUserReacted(
  reactions: Reaction[],
  spaceMemberId: string,
  emoji: string
): boolean {
  const reaction = reactions.find(r => r.emoji === emoji);
  return reaction ? reaction.spaceMemberIds.includes(spaceMemberId) : false;
}

/**
 * 리액션 통계 정보 계산
 * @param reactions 리액션 배열
 * @returns 리액션 통계 (총 개수, 사용자 수, 이모지 종류 수)
 */
export function getReactionStats(reactions: Reaction[]): {
  totalCount: number;
  uniqueUsers: number;
  emojiCount: number;
} {
  const totalCount = reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const uniquespaceMemberIds = new Set<string>();

  reactions.forEach(reaction => {
    reaction.spaceMemberIds.forEach(spaceMemberId => uniquespaceMemberIds.add(spaceMemberId));
  });

  return {
    totalCount,
    uniqueUsers: uniquespaceMemberIds.size,
    emojiCount: reactions.length,
  };
}

/**
 * 특정 이모지의 리액션 정보 가져오기
 * @param reactions 리액션 배열
 * @param emoji 이모지
 * @returns 해당 이모지의 리액션 정보 또는 null
 */
export function getReactionByEmoji(reactions: Reaction[], emoji: string): Reaction | null {
  return reactions.find(r => r.emoji === emoji) || null;
}
