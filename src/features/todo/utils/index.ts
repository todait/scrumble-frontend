import { formatDateToAPIString } from '@/shared/utils';
import { Todo } from '../types';

/**
 * 새로운 Todo ID 생성
 */
export function generateTodoId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * 새 투두 추가 시 order 계산
 */
export function calculateNewOrder(todos: Todo[], insertAfterTodoId?: string): number {
  // normalizeOrders를 항상 호출하므로 간단하게 구현
  // 정확한 order 값은 중요하지 않음 - 대략적인 위치만 지정
  
  if (todos.length === 0) {
    return 10;
  }

  if (!insertAfterTodoId) {
    // 맨 끝에 추가 - 큰 값 반환
    return 999999;
  }

  // insertAfterTodoId에 해당하는 Todo 찾기
  const targetTodo = todos.find(todo => todo.id === insertAfterTodoId);
  if (!targetTodo) {
    // 해당 투두를 찾을 수 없으면 맨 끝에 추가
    return 999999;
  }

  // targetTodo의 order보다 약간 큰 값 반환
  // normalizeOrders가 올바른 순서로 재정렬할 것임
  return targetTodo.order + 0.5;
}

/**
 * order 정규화 (10씩 간격으로 재할당)
 */
export function normalizeOrders(todos: Todo[]): Todo[] {
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
  return sortedTodos.map((todo, index) => ({
    ...todo,
    order: (index + 1) * 10,
  }));
}







/**
 * 선택된 todos 통계 계산
 */
export function calculateSelectionStats(todos: Todo[], selectedIds: string[], disabledIds?: Set<string>) {
  // disabledIds가 제공되면 disabled가 아닌 항목만 필터링
  const selectedTodos = todos.filter(todo => 
    selectedIds.includes(todo.id) && (!disabledIds || !disabledIds.has(todo.id))
  );
  const completedCount = selectedTodos.filter(todo => !!todo.completedAt).length;
  const incompleteCount = selectedTodos.filter(todo => !todo.completedAt).length;
  const totalCount = selectedTodos.length;
  
  return {
    totalCount,
    completedCount,
    incompleteCount,
    hasCompleted: completedCount > 0,
    hasIncomplete: incompleteCount > 0,
    allCompleted: completedCount === totalCount && totalCount > 0,
    allIncomplete: incompleteCount === totalCount && totalCount > 0,
  };
}

/**
 * 선택 상태에 따른 헤더 텍스트 생성
 */
export function getSelectionHeaderText(todos: Todo[], selectedIds: string[], disabledIds?: Set<string>): string {
  const stats = calculateSelectionStats(todos, selectedIds, disabledIds);
  
  if (stats.totalCount === 0) {
    return '어제의 투두에서 • 투두 0개 선택';
  }
  
  if (stats.allIncomplete) {
    return `미완료 ${stats.incompleteCount}개 • 가져오기`;
  }
  
  if (stats.allCompleted) {
    return `완료 ${stats.completedCount}개 • 가져오기`;
  }
  
  return `투두 ${stats.totalCount}개 • 가져오기`;
}

/**
 * 투두 복사 (가져오기용)
 */
export function copyTodosForToday(todos: Todo[], selectedIds: string[]): Todo[] {
  const selectedTodos = todos.filter(todo => selectedIds.includes(todo.id));
  
  return selectedTodos.map((todo, index) => ({
    id: generateTodoId(),
    name: todo.name,
    description: todo.description,
    scheduledDate: formatDateToAPIString(new Date()),
    order: (index + 1) * 10, // 새로운 order 할당
    thirdpartyUrl: todo.thirdpartyUrl,
    parentId: undefined, // 새로운 Todo이므로 부모 없음
    originTodoId: todo.originTodoId || todo.id, // origin_todo_id 로직
    depth: 0,
    completedAt: undefined, // 가져온 투두는 미완료 상태로
    children: [],
  }));
}

/**
 * 키보드 이벤트가 투두 관련 단축키인지 확인
 */
export function isTodoShortcut(event: KeyboardEvent): boolean {
  const { key, ctrlKey, metaKey } = event;
  
  // 수정자 키가 눌린 경우는 우리가 처리하지 않음
  if (ctrlKey || metaKey) return false;
  
  // 투두 관련 단축키들
  const shortcuts = ['e', 'E', 'Enter', 'Escape'];
  
  return shortcuts.includes(key);
}

/**
 * 유효한 투두 텍스트인지 확인
 */
export function isValidTodoText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 500;
}