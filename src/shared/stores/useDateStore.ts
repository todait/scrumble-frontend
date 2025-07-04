import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DateStore {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  resetToToday: () => void;
  initializeFromUrl: (urlDate: string | null) => void;
}

// localStorage에 저장할 데이터 구조
interface StoredDateData {
  selectedDate: string; // ISO 문자열
  timestamp: number; // 저장된 시간 (밀리초)
}

// persist state 구조
interface PersistedState {
  selectedDate: Date | string; // Date 객체 또는 ISO 문자열
  timestamp?: number; // 선택적 타임스탬프
}

// 1시간을 밀리초로 변환 (1시간 = 60 * 60 * 1000)
const EXPIRY_TIME_MS = 60 * 60 * 1000;

// 미래 날짜인지 확인하는 헬퍼 함수
const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 자정으로 설정

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0); // 대상 날짜 자정으로 설정

  return targetDate > today;
};

// 저장된 데이터가 만료되었는지 확인하는 헬퍼 함수
const isExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > EXPIRY_TIME_MS;
};

// 기존 저장된 데이터가 구 형식인지 확인하는 헬퍼 함수
const isLegacyData = (data: unknown): data is Date | string => {
  return data instanceof Date || (typeof data === 'string' && !isNaN(Date.parse(data)));
};

// 새로운 형식의 데이터인지 확인하는 헬퍼 함수
const isNewFormatData = (data: unknown): data is StoredDateData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'selectedDate' in data &&
    'timestamp' in data &&
    typeof (data as StoredDateData).selectedDate === 'string' &&
    typeof (data as StoredDateData).timestamp === 'number'
  );
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
      version: 1, // 데이터 구조 변경으로 인한 버전 추가
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value: unknown) => {
          if (key === 'state' && typeof value === 'object' && value !== null) {
            const state = value as PersistedState;
            
            // 새로운 형식의 데이터 처리
            if (isNewFormatData(state)) {
              const storedDate = new Date(state.selectedDate);
              // 데이터가 만료되었거나 미래 날짜인 경우 오늘 날짜로 리셋
              if (isExpired(state.timestamp) || isFutureDate(storedDate)) {
                return {
                  selectedDate: new Date(),
                };
              }
              return {
                selectedDate: storedDate,
              };
            }
            
            // 기존 형식(Date 객체만 있는 경우) 호환성 처리
            if (state.selectedDate && isLegacyData(state.selectedDate)) {
              // 기존 데이터는 만료된 것으로 간주하여 오늘 날짜로 리셋
              return {
                selectedDate: new Date(),
              };
            }
          }
          return value;
        },
        replacer: (key, value: unknown) => {
          if (key === 'state' && typeof value === 'object' && value !== null) {
            const state = value as { selectedDate: Date };
            return {
              selectedDate: state.selectedDate.toISOString(),
              timestamp: Date.now(), // 저장할 때마다 현재 시간으로 업데이트
            } satisfies StoredDateData;
          }
          return value;
        },
      }),
    }
  )
);
