/**
 * 사용자 관련 타입 정의
 * 인증, 프로필, 멤버십 등 사용자 도메인 타입들
 */

import type { ID } from './api';

/**
 * 기본 사용자 정보
 * 애플리케이션 전반에서 사용되는 핵심 사용자 타입
 */
export interface User {
  id: ID;
  email: string;
}

/**
 * 사용자 프로필 (확장된 정보)
 * 설정 페이지나 상세 프로필에서 사용
 */
export interface UserProfile extends User {
  bio?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 스페이스 멤버 정보
 * 팀 관리나 멤버 목록에서 사용
 */
export interface SpaceMember {
  id: ID;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastActiveAt?: string;
}
