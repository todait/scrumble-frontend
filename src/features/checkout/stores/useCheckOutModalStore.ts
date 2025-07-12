// 체크아웃 모달의 step을 관리하는 스토어
// sessionStorage에 persist하여 모달이 닫혔다 열려도 상태 유지
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckOutModalState {
  step: 'todo' | 'checkout';
  setStep: (step: 'todo' | 'checkout') => void;
  reset: () => void;
}

export const useCheckOutModalStore = create<CheckOutModalState>()(
  persist(
    (set) => ({
      step: 'todo',
      setStep: (step) => set({ step }),
      reset: () => set({ step: 'todo' }),
    }),
    {
      name: 'checkout-modal-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);