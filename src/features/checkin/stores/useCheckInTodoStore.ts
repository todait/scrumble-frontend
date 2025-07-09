// 체크인 Todo 리스트를 임시로 저장하는 스토어
// 서버에 저장하기 전까지 Todo 아이템들을 관리
import { create } from 'zustand';

export interface TodoDraft {
  id: string;
  text: string;
  completed: boolean;
}

interface CheckInTodoState {
  yesterdayTodos: TodoDraft[];
  todayTodos: TodoDraft[];
  setYesterdayTodos: (todos: TodoDraft[]) => void;
  setTodayTodos: (todos: TodoDraft[]) => void;
  updateTodo: (
    type: 'yesterday' | 'today',
    id: string,
    updates: Partial<TodoDraft>
  ) => void;
  addTodo: (type: 'yesterday' | 'today', todo: TodoDraft) => void;
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