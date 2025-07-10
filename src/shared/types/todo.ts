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
  originTodoId?: string;
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
  originTodoId?: string;
  thirdpartyUrl?: string;
  children: CreateTodoItemRequest[];
}

export interface CreateTodosRequest {
  spaceSlug: string;
  todos: CreateTodoItemRequest[];
}

/**
 * Todo 조회 요청 타입 (프론트엔드)
 * 특정 날짜의 Todo 목록 조회 시 사용
 */
export interface GetTodosRequest {
  spaceSlug: string;
  date: string; // YYYY-MM-DD 형식
}

/**
 * Todo 수정 요청 타입 (프론트엔드)
 * Todo 필드 부분 수정 시 사용
 */
export interface UpdateTodoRequest {
  spaceSlug: string;
  todoId: string;
  name?: string;
  description?: string;
  scheduledDate?: DateString;
  order?: number;
  thirdpartyUrl?: string;
  parentId?: string;
  originTodoIdIsNil?: boolean;
}

/**
 * Todo 완료 토글 요청 타입 (프론트엔드)
 * Todo 완료 상태 토글 시 사용
 */
export interface ToggleTodoRequest {
  spaceSlug: string;
  todoId: string;
}

/**
 * Todo 삭제 요청 타입 (프론트엔드)
 * Todo 삭제 시 사용
 */
export interface DeleteTodoRequest {
  spaceSlug: string;
  todoId: string;
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