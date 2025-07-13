import type { Todo } from '@/features/todo/types';
import type { CreateTodoItemRequest } from '@/shared/types/todo';
import type { TodoDraft } from '@/features/checkin/stores/useCheckInTodoStore';

/**
 * Todo ID 관련 헬퍼 함수들
 */

/**
 * 임시 ID인지 확인하는 헬퍼 함수
 * @param id - 확인할 ID
 * @returns 임시 ID인지 여부
 */
export const isTemporaryId = (id: string): boolean => {
  return id.startsWith('temp_');
};

/**
 * 새로운 임시 ID 생성
 * @returns 새로운 임시 ID
 */
export const generateTemporaryId = (): string => {
  return `temp_${crypto.randomUUID()}`;
};

/**
 * 서버 ID인지 확인하는 헬퍼 함수 (UUID 형태)
 * @param id - 확인할 ID
 * @returns 서버 ID인지 여부
 */
export const isServerId = (id: string): boolean => {
  return !isTemporaryId(id) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * TodoDraft → Todo 변환 (store → TodoContainer)
 */
export const convertTodoDraftToTodo = (
  draft: TodoDraft,
  scheduledDate: string,
  order: number,
  parentId?: string,
  originTodoId?: string
): Todo => {
  return {
    id: draft.id,
    name: draft.text,
    description: undefined,
    scheduledDate,
    order,
    thirdpartyUrl: undefined,
    parentId: parentId || undefined,
    originTodoId: originTodoId || undefined,
    depth: 0, // 현재는 평면 구조만 지원
    completedAt: draft.completed ? new Date().toISOString() : '',
    children: [],
  };
};

/**
 * 새로운 Todo 생성 (임시 ID 사용)
 * @param text - Todo 텍스트
 * @param scheduledDate - 예정 날짜
 * @param order - 순서
 * @param originTodoId - 원본 Todo ID (어제 Todo에서 복사된 경우)
 * @returns 새로운 Todo 객체
 */
export const createNewTodo = (
  text: string,
  scheduledDate: string,
  order: number,
  originTodoId?: string
): Todo => {
  return {
    id: generateTemporaryId(),
    name: text,
    description: undefined,
    scheduledDate,
    order,
    thirdpartyUrl: undefined,
    parentId: undefined,
    originTodoId: originTodoId || undefined,
    depth: 0,
    completedAt: undefined,
    children: [],
  };
};

/**
 * 어제 Todo를 오늘로 복사할 때 사용 (origin_todo_id 처리 포함)
 */
export const copyYesterdayTodoToToday = (
  yesterdayTodo: Todo,
  todayDate: string,
  newOrder: number
): Todo => {
  return {
    ...yesterdayTodo,
    id: generateTemporaryId(), // 새로운 임시 ID 생성
    scheduledDate: todayDate,
    order: newOrder,
    completedAt: undefined, // 완료 상태 초기화
    // origin_todo_id 로직:
    // 어제 todo에 origin_todo_id가 있으면 그것을 사용,
    // 없으면 어제 todo의 id를 사용
    originTodoId: yesterdayTodo.originTodoId || yesterdayTodo.id,
    children: [], // 하위 항목은 복사하지 않음
  };
};

/**
 * Todo → CreateTodoItemRequest 변환
 */
export const convertTodoToApiCreate = (todo: Todo): CreateTodoItemRequest => {
  return {
    name: todo.name,
    description: todo.description,
    scheduledDate: todo.scheduledDate,
    originTodoId: todo.originTodoId,
    thirdpartyUrl: todo.thirdpartyUrl,
    children: [], // 현재는 평면 구조만 지원
  };
};