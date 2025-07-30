/**
 * Todo 관련 타입 정의
 * 할 일 관리 시스템의 타입들 (프론트엔드에서 사용)
 */

import type { DateString, ID } from './api';

/**
 * 프론트엔드에서 사용하는 Todo 타입
 * 계층적 구조를 지원하는 할 일 데이터
 */
export interface Todo {
  id: ID;
  name: string;
  description?: string;
  scheduledDate: DateString;
  order: number;
  thirdpartyUrl?: string;
  parentId?: string;
  originTodoId?: string | null;
  depth: number;
  completedAt?: DateString;
  children: Todo[];
}

/**
 * Todo 생성 요청 타입 (프론트엔드)
 * 계층적 구조의 Todo 생성 시 사용
 */
export interface CreateTodoItemRequest {
  name: string;
  description?: string;
  scheduledDate: DateString;
  originTodoId?: string | null;
  thirdpartyUrl?: string;
  children: CreateTodoItemRequest[];
}

export interface CreateTodosRequest {
  todos: CreateTodoItemRequest[];
}

/**
 * Todo 조회 요청 타입 (프론트엔드)
 * 특정 날짜의 Todo 목록 조회 시 사용
 */
export interface GetTodosRequest {
  date: string; // YYYY-MM-DD 형식
  spaceMemberId?: string; // 특정 사용자의 Todo 조회 (선택사항)
}

/**
 * Todo 수정 요청 타입 (프론트엔드)
 * Todo 필드 부분 수정 시 사용
 */
export interface UpdateTodoRequest {
  todoId: string;
  name?: string;
  description?: string;
  scheduledDate?: DateString;
  order?: number;
  thirdpartyUrl?: string;
  parentId?: string;
  originTodoId?: string | null;
  completedAt?: string; // ISO 8601 형식, null/"" 시 미완료로 설정
}

/**
 * Todo 완료 토글 요청 타입 (프론트엔드)
 * Todo 완료 상태 토글 시 사용
 */
export interface ToggleTodoRequest {
  todoId: string;
}

/**
 * Todo 삭제 요청 타입 (프론트엔드)
 * Todo 삭제 시 사용
 */
export interface DeleteTodoRequest {
  todoId: string;
}

/**
 * Todo 일괄 업데이트 요청 타입 (프론트엔드)
 * 여러 Todo를 한 번에 생성/수정/삭제할 때 사용
 */
export interface BulkUpdateTodosRequest {
  scheduledDate: string; // YYYY-MM-DD 형식 (필수)
  todos: BulkUpdateTodoItem[];
}

/**
 * Todo 일괄 업데이트 아이템 타입 (프론트엔드)
 * 일괄 업데이트 시 각 Todo 아이템에 사용
 */
export interface BulkUpdateTodoItem {
  id?: string; // UUID, 없으면 새로 생성
  name?: string;
  description?: string;
  scheduledDate?: string; // YYYY-MM-DD 형식
  order?: number;
  thirdpartyUrl?: string;
  parentId?: string; // UUID
  originTodoId?: string | null; // UUID 또는 null
  completedAt?: string; // ISO 8601 형식, null/"" 시 미완료로 설정
}

/**
 * Todo 생성 응답 타입 (프론트엔드)
 * Todo 생성 성공 시 반환
 */
export interface CreateTodosResponse {
  message: string;
}

/**
 * Todo 조회 응답 타입 (프론트엔드)
 * Todo 목록 조회 성공 시 반환
 */
export interface GetTodosResponse {
  todos: Todo[];
}

/**
 * Todo 수정 응답 타입 (프론트엔드)
 * Todo 수정 성공 시 반환
 */
export interface UpdateTodoResponse {
  message: string;
}

/**
 * Todo 완료 토글 응답 타입 (프론트엔드)
 * Todo 완료 상태 토글 성공 시 반환
 */
export interface ToggleTodoResponse {
  message: string;
}

/**
 * Todo 삭제 응답 타입 (프론트엔드)
 * Todo 삭제 성공 시 반환 (204 No Content)
 */
export type DeleteTodoResponse = void;

/**
 * Todo 일괄 업데이트 응답 타입 (프론트엔드)
 * 일괄 업데이트 성공 시 반환
 */
export interface BulkUpdateTodosResponse {
  message: string;
  result: BulkUpdateResult;
}

/**
 * Todo 일괄 업데이트 결과 타입 (프론트엔드)
 * 일괄 업데이트 성공 시 반환되는 결과
 */
export interface BulkUpdateResult {
  created: number; // 생성된 할 일 개수
  updated: number; // 수정된 할 일 개수
  deleted: number; // 삭제된 할 일 개수
}
