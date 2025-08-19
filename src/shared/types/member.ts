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

// 프로필 관련 타입 추가
export interface ApiSpaceMemberDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarURL?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface SpaceMemberProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarURL: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface GetSpaceMemberProfileResponse {
  space_member: ApiSpaceMemberDTO;
}

export interface UpdateSpaceMemberProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UpdateSpaceMemberProfileApiRequest {
  name?: string;
  avatar_url?: string;
}

export interface UpdateSpaceMemberProfileResponse {
  message: string;
  space_member: ApiSpaceMemberDTO;
}

export enum MemberErrorCode {
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_AVATAR_URL = 'INVALID_AVATAR_URL',
  NAME_TOO_LONG = 'NAME_TOO_LONG',
  NAME_REQUIRED = 'NAME_REQUIRED',
}
