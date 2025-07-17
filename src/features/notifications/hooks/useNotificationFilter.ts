import { create } from 'zustand';
import { NotificationCategory } from '@/shared/types/notification';

interface NotificationFilterState {
  currentFilter: {
    category: NotificationCategory | 'all';
    isRead?: boolean;
  };
  setCategory: (category: NotificationCategory | 'all') => void;
  setIsRead: (isRead?: boolean) => void;
  resetFilter: () => void;
}

export const useNotificationFilter = create<NotificationFilterState>((set) => ({
  currentFilter: {
    category: 'all',
    isRead: undefined,
  },
  setCategory: (category) =>
    set((state) => ({
      currentFilter: {
        ...state.currentFilter,
        category,
      },
    })),
  setIsRead: (isRead) =>
    set((state) => ({
      currentFilter: {
        ...state.currentFilter,
        isRead,
      },
    })),
  resetFilter: () =>
    set({
      currentFilter: {
        category: 'all',
        isRead: undefined,
      },
    }),
}));