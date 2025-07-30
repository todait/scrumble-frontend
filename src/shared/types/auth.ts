/**
 * 인증 관련 타입 정의
 * 로그인, 토큰, 인증 상태 관리 등에 사용
 */

// 기본 타입들을 user.ts에서 import
import type { TokenPair } from './api';
import type { User } from './user';

export type { TokenPair, User };

/**
 * 로그인 응답 타입
 * OAuth 로그인 성공 시 반환되는 데이터
 */
export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

/**
 * 인증 상태 타입
 * AuthContext에서 사용되는 전체 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: TokenPair | null;
}
