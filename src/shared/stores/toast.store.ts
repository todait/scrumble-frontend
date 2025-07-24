'use client';

import { create } from 'zustand';

import { ToastProps } from '../components/feedback/Toast';

// 서버 사이드에서 import되면 경고
if (typeof window === 'undefined') {
  console.warn('[toast.store] imported on server! This should only be imported on client.');
}

interface ToastState {
  toasts: Omit<ToastProps, 'onClose'>[];
  toastCounter: number;
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  toasts: [],
  toastCounter: 0,

  addToast: toast => {
    set(state => {
      const id = `toast-${state.toastCounter}`;
      const newToast = { ...toast, id };

      return {
        toasts: [...state.toasts, newToast],
        toastCounter: state.toastCounter + 1,
      };
    });
  },

  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
