import { Todo } from '../types';

/**
 * 새로운 Todo ID 생성
 */
export function generateTodoId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * 새 투두 추가 시 order 계산
 */
export function calculateNewOrder(todos: Todo[], insertAfterTodoId?: string): number {
  if (todos.length === 0) {
    return 10;
  }

  if (!insertAfterTodoId) {
    // 맨 끝에 추가
    const lastTodo = todos[todos.length - 1];
    return lastTodo.order + 10;
  }

  const insertIndex = todos.findIndex(todo => todo.id === insertAfterTodoId);
  if (insertIndex === -1) {
    // 해당 투두를 찾을 수 없으면 맨 끝에 추가
    const lastTodo = todos[todos.length - 1];
    return lastTodo.order + 10;
  }

  if (insertIndex === todos.length - 1) {
    // 맨 끝에 추가
    return todos[insertIndex].order + 10;
  }

  // 중간에 삽입: 앞뒤 투두의 order 평균값
  const currentOrder = todos[insertIndex].order;
  const nextOrder = todos[insertIndex + 1].order;
  return (currentOrder + nextOrder) / 2;
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
export function calculateSelectionStats(todos: Todo[], selectedIds: string[]) {
  const selectedTodos = todos.filter(todo => selectedIds.includes(todo.id));
  const completedCount = selectedTodos.filter(todo => todo.completedAt !== null).length;
  const incompleteCount = selectedTodos.filter(todo => todo.completedAt === null).length;
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
export function getSelectionHeaderText(todos: Todo[], selectedIds: string[]): string {
  const stats = calculateSelectionStats(todos, selectedIds);
  
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
  const today = new Date();
  
  return selectedTodos.map((todo, index) => ({
    id: generateTodoId(),
    text: todo.text,
    date: today,
    completedAt: null, // 가져온 투두는 미완료 상태로
    order: (index + 1) * 10, // 새로운 order 할당
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