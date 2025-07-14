// 체크인 Todo 리스트를 임시로 저장하는 스토어
// 서버에 저장하기 전까지 Todo 아이템들을 관리
import { create } from 'zustand';
import type { Todo } from '@/features/todo/types';

interface CheckInTodoState {
  yesterdayTodos: Todo[];
  todayTodos: Todo[];
  setYesterdayTodos: (todos: Todo[]) => void;
  setTodayTodos: (todos: Todo[]) => void;
  updateTodo: (
    type: 'yesterday' | 'today',
    id: string,
    updates: Partial<Todo>
  ) => void;
  addTodo: (type: 'yesterday' | 'today', todo: Todo) => void;
  removeTodo: (type: 'yesterday' | 'today', id: string) => void;
  reset: () => void;
}

export const useCheckInTodoStore = create<CheckInTodoState>((set) => ({
  yesterdayTodos: [],
  todayTodos: [],
  setYesterdayTodos: (todos) => set({ yesterdayTodos: todos }),
  setTodayTodos: (todos) => set({ todayTodos: todos }),
  updateTodo: (type, id, updates) =>
    set((state) => ({
      [`${type}Todos`]: state[`${type}Todos`].map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      ),
    })),
  addTodo: (type, todo) =>
    set((state) => ({
      [`${type}Todos`]: [...state[`${type}Todos`], todo],
    })),
  removeTodo: (type, id) =>
    set((state) => ({
      [`${type}Todos`]: state[`${type}Todos`].filter((todo) => todo.id !== id),
    })),
  reset: () => set({ yesterdayTodos: [], todayTodos: [] }),
}));