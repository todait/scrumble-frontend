// PostContent의 Todo 편집을 위한 로컬 상태 관리 스토어
import type { Todo } from '@/features/todo/types';
import { create } from 'zustand';

interface PostTodoState {
  // 현재 편집 중인 투두 목록
  todos: Todo[];
  
  // 편집 모드 여부
  isEditMode: boolean;
  
  // 원본 데이터 (편집 취소용)
  originalTodos: Todo[] | null;
  
  // 로딩 상태
  isLoading: boolean;
  
  // Actions
  setTodos: (todos: Todo[]) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  setOriginalTodos: (todos: Todo[] | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // Todo 조작 액션들
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  addTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
  
  // 편집 모드 관련 액션들
  startEdit: () => void;
  cancelEdit: () => void;
  applyChanges: (newTodos: Todo[]) => void;
  
  // 초기화
  reset: () => void;
}

export const usePostTodoStore = create<PostTodoState>((set, get) => ({
  todos: [],
  isEditMode: false,
  originalTodos: null,
  isLoading: false,

  setTodos: (todos) => set({ todos }),
  setIsEditMode: (isEditMode) => set({ isEditMode }),
  setOriginalTodos: (originalTodos) => set({ originalTodos }),
  setIsLoading: (isLoading) => set({ isLoading }),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      ),
    })),

  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  startEdit: () => {
    const { todos } = get();
    set({ 
      isEditMode: true, 
      originalTodos: [...todos] // 깊은 복사로 원본 백업
    });
  },

  cancelEdit: () => {
    const { originalTodos } = get();
    if (originalTodos) {
      set({ 
        isEditMode: false, 
        todos: [...originalTodos],
        originalTodos: null 
      });
    } else {
      set({ isEditMode: false });
    }
  },

  applyChanges: (newTodos) =>
    set({ 
      todos: newTodos,
      isEditMode: false,
      originalTodos: null 
    }),

  reset: () => set({ 
    todos: [], 
    isEditMode: false, 
    originalTodos: null, 
    isLoading: false 
  }),
}));