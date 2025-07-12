interface TodoItemStylesProps {
  mode: 'view' | 'edit';
  isEditable: boolean;
  isEditing: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isSelectDisabled: boolean;
  onToggleSelect?: (todoId: string) => void;
  displayMode?: 'checkbox' | 'bullet';
}

export function getTodoItemClasses({
  mode,
  isEditable,
  isEditing,
  isSelected,
  isFocused,
  isSelectDisabled,
  onToggleSelect,
  displayMode = 'checkbox',
}: TodoItemStylesProps): string {
  const classes = [
    `flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors relative ${displayMode === 'bullet' ? 'h-8' : 'h-9'} group`,

    /* ✅ 선택/포커스 하이라이트 */
    (isSelected || isFocused) && 'bg-purple-50',

    /* ✅ 편집 모드: 편집 "중"인 행만 보라색 테두리 */
    mode === 'edit' && isEditable && isEditing && 'border border-purple-400',

    /* ✅ 편집 모드의 나머지 행은 cursor 표시 */
    mode === 'edit' && isEditable && !isEditing && 'cursor-text',

    /* ✅ 선택 가능한 항목은 pointer 커서 */
    onToggleSelect && !isSelectDisabled && 'cursor-pointer',

    /* ✅ 편집 중에는 강제로 흰 배경으로 덮어쓰기 */
    isEditing && 'bg-white',
  ];

  return classes.filter(Boolean).join(' ');
}

export function getCheckboxClasses(isEditable: boolean): string {
  return `h-5 w-5 flex-shrink-0 transition-colors ${isEditable ? 'cursor-pointer' : 'cursor-default'}`;
}

export function getSelectButtonClasses(isSelectDisabled: boolean, isSelected?: boolean): string {
  return `flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
    isSelectDisabled && !isSelected
      ? 'cursor-not-allowed border-gray-200 bg-gray-100'
      : isSelectDisabled && isSelected
        ? 'cursor-not-allowed'
        : 'border-gray-300 hover:border-purple-400'
  }`;
}

export function getTextClasses(isCompleted: boolean): string {
  return `flex h-6 items-center px-2 py-1.5 text-sm leading-tight overflow-hidden group-hover:text-[#9747FF] transition-colors ${
    isCompleted ? 'text-[#222222] line-through opacity-60' : 'text-[#222222]'
  }`;
}
