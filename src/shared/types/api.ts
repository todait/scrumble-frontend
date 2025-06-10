/**
 * API 관련 공통 타입 정의
 * 실제 백엔드 API와 연동할 때 사용할 타입들
 */

// API 응답 공통 구조
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 공통 ID 타입
export type ID = string;

// 날짜 관련 타입
export type DateString = string; // ISO 8601 format
export type Timestamp = number;