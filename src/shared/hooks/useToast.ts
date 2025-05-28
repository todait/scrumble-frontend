import { useCallback } from 'react';
import { useToastStore } from '../stores/toast.store';
import { ToastType } from '../components/feedback/Toast';

interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = useCallback((type: ToastType, options: ToastOptions) => {
    addToast({
      type,
      title: options.title,
      message: options.message,
      duration: options.duration,
    });
  }, [addToast]);

  const success = useCallback((options: ToastOptions) => {
    toast('success', options);
  }, [toast]);

  const error = useCallback((options: ToastOptions) => {
    toast('error', options);
  }, [toast]);

  const info = useCallback((options: ToastOptions) => {
    toast('info', options);
  }, [toast]);

  const warning = useCallback((options: ToastOptions) => {
    toast('warning', options);
  }, [toast]);

  return {
    toast,
    success,
    error,
    info,
    warning,
    dismiss: removeToast,
    dismissAll: clearToasts,
  };
}