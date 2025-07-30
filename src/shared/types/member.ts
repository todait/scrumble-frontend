import { DateString, ID } from './api';

/**
 * 멤버 관련 타입 정의
 * settings와 다른 feature에서 공통으로 사용
 */

export interface Member {
  id: ID;
  spaceId: string;
  name: string;
  avatarURL?: string;
  spaceSlug: string;
  spaceName: string;
  centrifugoToken?: string;
  role: MemberRole;
  joinedAt: DateString;
  lastActiveAt?: DateString;
  status: MemberStatus;
}

export type MemberRole = 'owner' | 'admin' | 'member';

export type MemberStatus = 'active' | 'inactive' | 'pending';

// API 요청/응답 타입
export interface InviteMemberRequest {
  email: string;
  role?: MemberRole;
}

export interface UpdateMemberRequest {
  role?: MemberRole;
  status?: MemberStatus;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
}
