// 체크아웃 모달의 투두 상태를 관리하는 스토어
import { create } from 'zustand';

interface TodoDraft {
  id: string;
  text: string;
  completed: boolean;
}

interface CheckOutTodoState {
  todayTodos: TodoDraft[];
  setTodayTodos: (todos: TodoDraft[]) => void;
  reset: () => void;
}

export const useCheckOutTodoStore = create<CheckOutTodoState>((set) => ({
  todayTodos: [],
  setTodayTodos: (todos) => set({ todayTodos: todos }),
  reset: () => set({ todayTodos: [] }),
}));