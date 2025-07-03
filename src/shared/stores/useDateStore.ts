import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DateStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  resetToToday: () => void;
  initializeFromUrl: (urlDate: string | null) => void;
}

// 미래 날짜인지 확인하는 헬퍼 함수
const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 자정으로 설정

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0); // 대상 날짜 자정으로 설정

  return targetDate > today;
};

export const useDateStore = create<DateStore>()(
  persist(
    (set, get) => ({
      selectedDate: new Date(),
      setSelectedDate: (date: Date) => {
        // 미래 날짜인 경우 오늘 날짜로 설정
        if (isFutureDate(date)) {
          set({ selectedDate: new Date() });
          return;
        }
        set({ selectedDate: date });
      },
      resetToToday: () => set({ selectedDate: new Date() }),
      initializeFromUrl: (urlDate: string | null) => {
        if (urlDate) {
          // URL에서 유효한 날짜가 있으면 사용
          try {
            const date = new Date(urlDate);
            if (!isNaN(date.getTime())) {
              // 미래 날짜인 경우 오늘 날짜로 설정
              if (isFutureDate(date)) {
                set({ selectedDate: new Date() });
                return;
              }
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
        if (!current || isNaN(current.getTime()) || isFutureDate(current)) {
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
