import { useSaveTodos } from '@/shared/hooks/queries';
import { useToast } from '@/shared/hooks/useToast';
import { formatDateToAPIString } from '@/shared/utils';
import { useRef, useState, useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { usePostTodos } from './usePostTodos';
import { usePostTodoStore } from '../stores/usePostTodoStore';
import type { Post } from '../types/feed.types';
import type { TodoContainerRef, Todo } from '@/features/todo';

interface UsePostTodoSectionParams {
  post: Post;
  isDetailView?: boolean;
}

interface TodoStatistics {
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

interface UsePostTodoSectionReturn {
  // 상태
  isTodoCollapsed: boolean;
  setIsTodoCollapsed: (collapsed: boolean) => void;
  isTodoEditMode: boolean;
  isSaving: boolean;
  
  // Todo 데이터
  todos: Todo[] | undefined;
  isTodosLoading: boolean;
  
  // 통계
  todoStatistics: TodoStatistics;
  
  // 핸들러
  handleToggleTodoEditMode: () => void;
  handleSaveTodos: () => Promise<void>;
  handleCancelEdit: () => void;
  handleToggleComplete: (todoId: string) => void;
  handleUpdateTodos: (updatedTodos: Todo[]) => void;
  
  // Ref
  todoContainerRef: MutableRefObject<TodoContainerRef | null>;
  
  // 표시 여부
  shouldShowTodoSection: boolean;
}

/**
 * PostContent의 Todo 섹션 관련 로직을 관리하는 훅
 */
export const usePostTodoSection = ({
  post,
  isDetailView = false,
}: UsePostTodoSectionParams): UsePostTodoSectionReturn => {
  const { show } = useToast();
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(!isDetailView);
  const todoContainerRef = useRef<TodoContainerRef>(null);
  
  // Zustand store에서 편집 모드 상태 가져오기
  const { editingPostId, startEdit, cancelEdit, applyChanges } = usePostTodoStore();
  
  // 현재 post가 편집 중인지 확인
  const isTodoEditMode = editingPostId === post.id;
  
  // Todo 저장을 위한 공통 훅
  const { saveTodos: saveTodosApi, isSaving } = useSaveTodos();
  
  // Todo 리스트용 hook (lazy loading)
  const {
    todos,
    isLoading: isTodosLoading,
    handleToggleComplete,
    handleUpdateTodos,
  } = usePostTodos({
    postDate: new Date(post.postedAt),
    postId: post.id,
    spaceMemberId: post.author.id,
    enabled: !isTodoCollapsed || isDetailView, // Collapse가 열릴 때 또는 상세보기에서 로딩
  });
  
  // Todo 통계 계산
  const todoStatistics = useMemo<TodoStatistics>(() => {
    const hasTodos = todos && todos.length > 0;
    
    const completedCount = hasTodos 
      ? todos.filter(todo => todo.completedAt).length 
      : (post.completedTodoCount ?? 0);
    
    const totalCount = hasTodos 
      ? todos.length 
      : (post.todoCount ?? 0);
    
    const completionRate = hasTodos && totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100) 
      : (post.completionRate ?? 0);
    
    return {
      completedCount,
      totalCount,
      completionRate,
    };
  }, [todos, post.completedTodoCount, post.todoCount, post.completionRate]);
  
  // Todo 섹션 표시 여부
  const shouldShowTodoSection = post.todoCount !== undefined || todos !== undefined;
  
  // 편집 모드 토글 핸들러
  const handleToggleTodoEditMode = () => {
    if (!isTodoEditMode) {
      // 편집 모드 진입: React Query 데이터를 zustand store에 복사
      const { setTodos } = usePostTodoStore.getState();
      setTodos(todos); // 현재 React Query 데이터를 store에 설정
      startEdit(post.id);
    } else {
      // 편집 모드 종료 (취소)
      cancelEdit();
      todoContainerRef.current?.clearFocus(); // 포커스 초기화
    }
  };
  
  // Todo 저장 핸들러
  const handleSaveTodos = async () => {
    if (!todos) return;
    
    try {
      const dateString = formatDateToAPIString(new Date(post.postedAt));
      
      // 공통 저장 함수 사용
      await saveTodosApi(dateString, todos);
      
      applyChanges(todos); // store에서 편집 모드 종료 및 상태 적용
      todoContainerRef.current?.clearFocus(); // 포커스 초기화
      show('투두가 성공적으로 저장되었습니다');
    } catch (error) {
      console.error('투두 저장 실패:', error);
      show('투두 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    // store에서 편집 취소 처리 (원본 데이터로 복원)
    cancelEdit();
    todoContainerRef.current?.clearFocus(); // 포커스 초기화
  };
  
  return {
    // 상태
    isTodoCollapsed,
    setIsTodoCollapsed,
    isTodoEditMode,
    isSaving,
    
    // Todo 데이터
    todos,
    isTodosLoading,
    
    // 통계
    todoStatistics,
    
    // 핸들러
    handleToggleTodoEditMode,
    handleSaveTodos,
    handleCancelEdit,
    handleToggleComplete,
    handleUpdateTodos,
    
    // Ref
    todoContainerRef,
    
    // 표시 여부
    shouldShowTodoSection,
  };
};