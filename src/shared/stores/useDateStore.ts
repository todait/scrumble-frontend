import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DateStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  resetToToday: () => void;
  initializeFromUrl: (urlDate: string | null) => void;
}

export const useDateStore = create<DateStore>()(
  persist(
    (set, get) => ({
      selectedDate: new Date(),
      setSelectedDate: (date: Date) => set({ selectedDate: date }),
      resetToToday: () => set({ selectedDate: new Date() }),
      initializeFromUrl: (urlDate: string | null) => {
        if (urlDate) {
          // URL에서 유효한 날짜가 있으면 사용
          try {
            const date = new Date(urlDate);
            if (!isNaN(date.getTime())) {
              set({ selectedDate: date });
              return;
            }
          } catch {
            // 유효하지 않은 날짜면 무시
          }
        }
        // URL에 날짜가 없거나 유효하지 않으면 localStorage의 기존 값 사용 (persist가 자동 복원)
        // 아무것도 없으면 오늘 날짜 사용
        const current = get().selectedDate;
        if (!current || isNaN(current.getTime())) {
          set({ selectedDate: new Date() });
        }
      },
    }),
    {
      name: 'scrumble-selected-date',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === 'selectedDate' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        },
        replacer: (key, value) => {
          if (key === 'selectedDate' && value instanceof Date) {
            return value.toISOString();
          }
          return value;
        },
      }),
    }
  )
);