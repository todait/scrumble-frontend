import { create } from 'zustand';
import { ToastProps, ToastType } from '../components/feedback/Toast';

interface ToastState {
  toasts: Omit<ToastProps, 'onClose'>[];
  toastCounter: number;
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toastCounter: 0,
  
  addToast: (toast) => {
    set((state) => {
      const id = `toast-${state.toastCounter}`;
      const newToast = { ...toast, id };
      
      return {
        toasts: [...state.toasts, newToast],
        toastCounter: state.toastCounter + 1,
      };
    });
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
}));