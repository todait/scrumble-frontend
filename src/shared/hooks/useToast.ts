import { useCallback } from 'react';

import { useToastStore } from '../stores/toast.store';

interface ToastOptions {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const show = useCallback((options: ToastOptions | string) => {
    if (typeof options === 'string') {
      addToast({
        message: options,
        duration: 3000,
      });
    } else {
      // title과 message가 모두 있으면 결합
      const message = options.title && options.message 
        ? `${options.title}: ${options.message}`
        : options.title || options.message || '';
      
      addToast({
        message,
        actionText: options.actionText,
        onAction: options.onAction,
        duration: options.duration || 3000,
      });
    }
  }, [addToast]);

  // 이전 API와의 호환성을 위한 메서드들
  const success = useCallback((options: ToastOptions) => {
    show(options);
  }, [show]);

  const error = useCallback((options: ToastOptions) => {
    show(options);
  }, [show]);

  const info = useCallback((options: ToastOptions) => {
    show(options);
  }, [show]);

  const warning = useCallback((options: ToastOptions) => {
    show(options);
  }, [show]);

  const toast = useCallback((_type: string, options: ToastOptions) => {
    show(options);
  }, [show]);

  return {
    show,
    toast,
    success,
    error,
    info,
    warning,
    dismiss: removeToast,
    dismissAll: clearToasts,
  };
}