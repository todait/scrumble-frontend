export interface Todo {
  /** 고유 식별자 */
  id: string;
  /** 투두 내용 */
  text: string;
  /** 완료 시간 (완료되지 않았으면 null) */
  completedAt: Date | null;
  /** 투두 생성 날짜 */
  date: Date;
  /** 표시 순서를 위한 숫자값 */
  order: number;
}

export interface TodoListProps {
  /** Todo 배열 */
  todos: Todo[];
  /** 수정 가능 여부 (본인 투두인지) */
  isEditable: boolean;
  /** 보기 또는 수정 모드 */
  mode: 'view' | 'edit';
  /** todos 업데이트 콜백 함수 */
  onUpdate: (todos: Todo[]) => void;
  /** 완료 토글 콜백 함수 */
  onToggleComplete: (todoId: string) => void;
  /** 선택된 투두 ID 배열 (어제 투두 선택용) */
  selectedIds?: string[];
  /** 선택 변경 콜백 함수 */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** 이미 가져온 Todo ID 목록 (선택 비활성화용) */
  disabledIds?: Set<string>;
  /** 어제에서 가져온 Todo ID 목록 */
  broughtFromYesterdayIds?: Set<string>;
}

export interface TodoItemProps {
  /** Todo 객체 */
  todo: Todo;
  /** 수정 가능 여부 */
  isEditable: boolean;
  /** 보기 또는 수정 모드 */
  mode: 'view' | 'edit';
  /** 선택 여부 (어제 투두 선택용) */
  isSelected?: boolean;
  /** 편집 중인지 여부 */
  isEditing?: boolean;
  /** 포커스된 투두인지 여부 */
  isFocused?: boolean;
  /** 텍스트 변경 콜백 */
  onTextChange: (todoId: string, text: string) => void;
  /** 완료 토글 콜백 */
  onToggleComplete: (todoId: string) => void;
  /** 선택 토글 콜백 */
  onToggleSelect?: (todoId: string) => void;
  /** Shift + 클릭으로 범위 선택 콜백 */
  onShiftSelectRange?: (todoId: string) => void;
  /** 편집 시작 콜백 */
  onStartEdit?: (todoId: string) => void;
  /** 편집 완료 콜백 */
  onFinishEdit?: (todoId: string) => void;
  /** 새 투두 추가 콜백 */
  onAddTodo?: (afterTodoId: string) => void;
  /** 투두 삭제 콜백 */
  onDeleteTodo?: (todoId: string, enterEditMode?: boolean) => void;
  /** Shift+Enter 제출 콜백 */
  onShiftEnterSubmit?: (todoId: string, newText: string) => void;
  /** 선택 비활성화 여부 */
  isSelectDisabled?: boolean;
  /** 가져온 투두인지 여부 */
  isBroughtFromYesterday?: boolean;
}

export interface CollapseTodoListSectionProps {
  /** 섹션 제목 */
  title: string;
  /** Todo 배열 */
  todos: Todo[];
  /** 접힘 상태 */
  isCollapsed: boolean;
  /** 접힘 상태 변경 콜백 */
  onToggleCollapse: () => void;
  /** 수정 가능 여부 */
  isEditable: boolean;
  /** 보기 또는 수정 모드 */
  mode: 'view' | 'edit';
  /** 선택된 투두 ID 배열 */
  selectedIds?: string[];
  /** 선택 변경 콜백 */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** 완료 토글 콜백 */
  onToggleComplete: (todoId: string) => void;
  /** todos 업데이트 콜백 */
  onUpdate?: (todos: Todo[]) => void;
  /** 가져오기 버튼 표시 여부 */
  showBringButton?: boolean;
  /** 가져오기 콜백 */
  onBringToToday?: (selectedTodos: Todo[]) => void;
  /** 이미 가져온 Todo ID 목록 */
  broughtTodoIds?: Set<string>;
}

export interface TodoContainerProps {
  /** 어제 투두 목록 */
  yesterdayTodos: Todo[];
  /** 오늘 투두 목록 */
  todayTodos: Todo[];
  /** 수정 가능 여부 */
  isEditable: boolean;
  /** 어제/오늘 투두 업데이트 콜백 */
  onUpdateYesterdayTodos?: (todos: Todo[]) => void;
  /** 오늘 투두 업데이트 콜백 */
  onUpdateTodayTodos: (todos: Todo[]) => void;
  /** 완료 토글 콜백 */
  onToggleComplete: (todoId: string, isYesterday: boolean) => void;
  /** 편집 모드 강제 (토글 버튼 숨김) */
  forceEditMode?: boolean;
}

export type TodoMode = 'view' | 'edit';

export interface TodoKeyboardShortcuts {
  /** E 키: 편집 모드 진입 */
  edit: string;
  /** Enter 키: 편집 완료 또는 새 투두 추가 */
  confirm: string;
  /** Escape 키: 편집 취소 */
  cancel: string;
}
