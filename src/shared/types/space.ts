/**
 * 스페이스 관련 타입 정의
 * 팀 스페이스 관리 및 멤버 관련 타입들
 */

import type { DateString, ID } from './api';

/**
 * 스페이스 멤버 역할
 */
export type SpaceMemberRole = 'owner' | 'admin' | 'member';

/**
 * 스페이스 멤버 정보
 * 스페이스에 속한 사용자의 정보와 권한
 */
export interface SpaceMember {
  id: ID; // 멤버십 ID
  userId: ID; // 사용자 ID
  name: string; // 사용자 이름
  avatarURL?: string; // 아바타 URL
  role: SpaceMemberRole; // 역할
  joinedAt: DateString; // ISO 8601 형식의 가입일시
}

/**
 * 스페이스 정보
 * 팀 스페이스의 전체 정보
 */
export interface Space {
  id: ID; // 스페이스 ID
  slug: string; // 유니크한 스페이스 식별자
  name: string; // 스페이스 이름
  iconURL?: string; // 아이콘 URL
  members: SpaceMember[]; // 멤버 목록
  createdAt: DateString; // ISO 8601 형식의 생성일시
  updatedAt: DateString; // ISO 8601 형식의 수정일시
}

/**
 * 스페이스 생성 요청
 */
export interface CreateSpaceRequest {
  name: string; // 1-100자
}

/**
 * 스페이스 생성 응답
 */
export interface CreateSpaceResponse {
  message: string;
  space: Space;
}

/**
 * 스페이스 수정 요청
 * 모든 필드는 선택사항 (부분 업데이트 지원)
 */
export interface UpdateSpaceRequest {
  spaceSlug: string; // 경로 파라미터로 사용
  name?: string; // 1-100자
  iconUrl?: string; // 유효한 URL 형식
}

/**
 * 스페이스 수정 응답
 */
export interface UpdateSpaceResponse {
  message: string;
  space: Space;
}

/**
 * 내 스페이스 목록 조회 옵션
 */
export interface GetMySpacesOptions {
  timezone?: string; // 사용자 타임존 (선택사항)
}

/**
 * 내 스페이스 목록 조회 응답
 */
export interface GetMySpacesResponse {
  spaces: Space[];
}

/**
 * 스페이스 상세 조회 파라미터
 */
export interface GetSpaceParams {
  spaceSlug: string;
  timezone?: string; // 사용자 타임존 (선택사항)
}

/**
 * 스페이스 상세 조회 응답
 */
export interface GetSpaceResponse {
  space: Space;
}

/**
 * 스페이스 삭제 파라미터
 */
export interface DeleteSpaceParams {
  spaceSlug: string;
}

/**
 * 스페이스 삭제 응답
 */
export interface DeleteSpaceResponse {
  message: string;
}

/**
 * 스페이스 관련 에러 코드
 * 백엔드와 동기화된 에러 코드
 */
export enum SpaceErrorCode {
  SPACE_NOT_FOUND = 'SPACE_NOT_FOUND',
  SPACE_NAME_REQUIRED = 'SPACE_NAME_REQUIRED',
  SPACE_NAME_TOO_LONG = 'SPACE_NAME_TOO_LONG',
  INVALID_ICON_URL = 'INVALID_ICON_URL',
  NOT_SPACE_OWNER = 'NOT_SPACE_OWNER',
  SPACE_ACCESS_DENIED = 'SPACE_ACCESS_DENIED',
  SPACE_MEMBER_NOT_FOUND = 'SPACE_MEMBER_NOT_FOUND',
  SLUG_GENERATION_FAILED = 'SLUG_GENERATION_FAILED',
}